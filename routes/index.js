// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const apiHelper = require('../lib/api_helper');

// Constants used for Dialogflow API authentication
const DIALOGFLOW_SERVICE_ACCOUNT_LOCATION
  = __dirname + '/../resources/df-agent-service-account-credentials.json';
const DIALOGFLOW_PROJECT_ID
  = require(DIALOGFLOW_SERVICE_ACCOUNT_LOCATION).project_id;

/**
 * This sample script serves as the webhook URL for a Business Messages
 * registered partner account. The /callback URL receives messages
 * sent from consumers to a book an appointment bike shop agent.
 *
 * The digital agent uses a Dialogflow agent to process the inbound
 * messages and compute the response. The response is posted to the
 * Business Messages APIs via the Business Messages client library.
 *
 * Please check the README for configuration instructions.
 */

/**
 * Sample Business Messages entry point test page.
 */
router.get('/', function(req, res, next) {
  res.render('index');
});

/**
 * The Business Messages webhook callback method.
 */
router.post('/callback', function(req, res, next) {
  let requestBody = req.body;

  // Log the full JSON payload received
  console.log('requestBody: ' + JSON.stringify(requestBody));
  console.log('requestHeader: ' + JSON.stringify(req.headers));

  // Extract the message payload parameters
  let conversationId = requestBody.conversationId;

  let displayName = requestBody.context.userInfo != undefined
    ? requestBody.context.userInfo.displayName : '';

  // Compute the end index for splitting off the user's first name
  let endIndex = displayName.indexOf(' ') == -1
    ? displayName.length : displayName.indexOf(' ');
  let firstName = displayName.substr(0, endIndex);

  // Check that the message and text values exist
  if (requestBody.message !== undefined
    && requestBody.message.text !== undefined) {
    let message = requestBody.message.text;

    // Log message parameters
    console.log('conversationId: ' + conversationId);
    console.log('message: ' + message);
    console.log('displayName: ' + displayName);

    handleMessage(message, conversationId, firstName);
  } else if (requestBody.suggestionResponse !== undefined) {
    let message = requestBody.suggestionResponse.text;
    let postback = requestBody.suggestionResponse.postbackData;

    // Log message parameters
    console.log('conversationId: ' + conversationId);
    console.log('message: ' + message);
    console.log('displayName: ' + displayName);

    if (postback != 'ignore') {
      handleMessage(postback, conversationId, firstName);
    }
  } else if (requestBody.userStatus !== undefined) {
    if (requestBody.userStatus.isTyping !== undefined) {
      console.log('User is typing');
    } else if (requestBody.userStatus.requestedLiveAgent !== undefined) {
      console.log('User requested transfer to live agent');
    }
  }

  res.sendStatus(200);
});

/**
 * Take the message received from the end-user and determine the response
 * by calling the Dialogflow agent.
 *
 * @param {string} message The message text received from the user.
 * @param {string} conversationId The unique id for this user and agent.
 * @param {string} displayName The consumer's name that is
 * interacting with the agent.
 */
function handleMessage(message, conversationId, displayName) {
  let result = detectIntent(message, conversationId);

  result.then((response) => {
    let intentName = response.queryResult.intent.displayName;

    // Log the matching intent and query
    console.log('intent: ' + intentName);
    console.log('query text: ' + response.queryResult.queryText);

    let intentResponse = response.queryResult.fulfillmentText;
    let botResponse = {text: intentResponse};
    let responseSatisifiedViaFulfillment = false;

    // Use the custom payloads if they exist
    if (response.queryResult.fulfillmentMessages.length > 0) {
      for (let i = 0; i < response.queryResult.fulfillmentMessages.length; i++) {
        // Log the matching fulfillment
        console.dir(response.queryResult.fulfillmentMessages[i]);

        // Only process custom payload fulfillment messages
        if (response.queryResult.fulfillmentMessages[i].payload != undefined) {
          botResponse = response.queryResult.fulfillmentMessages[i].payload;

          if (botResponse.text != undefined
              && botResponse.text.indexOf('{name}') > 0) {
            botResponse.text = botResponse.text.replace('{name}', displayName);
          }

          botResponse.messageId = uuidv4();
          botResponse.representative = {
            representativeType: 'BOT',
          };

          // No fallback text, use the default text from Dialogflow
          if (botResponse.fallback === undefined) {
            botResponse.fallback = intentResponse;
          }

          // Respond to the user
          sendResponse(botResponse, conversationId);

          responseSatisifiedViaFulfillment = true;
        }
      }
    }

    // Send a response based on the configured Dialogflow
    // response if fulfillment was not used
    if (!responseSatisifiedViaFulfillment) {
      botResponse.messageId = uuidv4();
      botResponse.representative = {
        representativeType: 'BOT',
      };

      sendResponse(botResponse, conversationId);
    }
  }).catch((err) => {
    console.error('ERROR:', err);
  });
}

/**
 * Posts a message to the Business Messages API, first sending a typing
 * indicator event and sending a stop typing event after the message
 * has been sent.
 *
 * @param {object} messageObject The message object payload to send to the user.
 * @param {string} conversationId The unique id for this user and agent.
 */
function sendResponse(messageObject, conversationId) {
  const apiConnector = apiHelper.init();
  apiConnector.then(function(apiObject) {
    // Create the payload for sending a typing started event
    let apiEventParams = {
      auth: apiObject.authClient,
      parent: 'conversations/' + conversationId,
      resource: {
        eventType: 'TYPING_STARTED',
        representative: {
          representativeType: 'BOT',
        },
      },
      eventId: uuidv4(),
    };

    // Send the typing started event
    apiObject.bmApi.conversations.events.create(apiEventParams, {},
      (err, response) => {
      console.log(err);
      console.log(response);

      let apiParams = {
        auth: apiObject.authClient,
        parent: 'conversations/' + conversationId,
        resource: messageObject,
      };

      // Call the message create function using the
      // Business Messages client library
      apiObject.bmApi.conversations.messages.create(apiParams, {},
        (err, response) => {
        console.log(err);
        console.log(response);

        // Update the event parameters
        apiEventParams.resource.eventType = 'TYPING_STOPPED';
        apiEventParams.eventId = uuidv4();

        // Send the typing stopped event
        apiObject.bmApi.conversations.events.create(apiEventParams, {},
          (err, response) => {
          console.log(err);
          console.log(response);
        });
      });
    });
  }).catch(function(err) {
    console.log(err);
  });
}

/**
 * Posts to Dialogflow's detectIntent API to find the matching intent
 * and get the response to send back to the consumer.
 *
 * @param {object} text The inbound text from the consumer.
 * @param {string} conversationId The unique id for this user and agent.
 * @return {object} A promise the resolves to the detectIntent results.
 */
function detectIntent(text, conversationId) {
  return new Promise((resolve, reject) => {
    let authToken = generateDfAuthToken();

    authToken.then(function(authBearer) {
      let request = require('request');

      let options = {
        method: 'POST',
        body: {
          queryInput: {
            text: {
              text: text,
              languageCode: 'en',
            },
          },
        },
        json: true,
        url: 'https://dialogflow.googleapis.com/v2/projects/' + DIALOGFLOW_PROJECT_ID +
          '/agent/sessions/' + conversationId + ':detectIntent',
        headers: {
            'Authorization': 'Bearer ' + authBearer,
        },
      };

      request(options, function(err, response, body) {
;
        resolve(body);
      });
    }).catch(function(err) {
        console.log(err);
    });
  });
}

/**
 * Generates an authentication token for making API calls to Dialogflow.
 *
 * @return {object} A promise for generating the auth token.
 */
function generateDfAuthToken() {
  // get the GoogleAPI library
  let {google} = require('googleapis');

  // set the scope that we need to RCS business messenging
  let scopes = [
      'https://www.googleapis.com/auth/dialogflow',
  ];

  // set the private key to the service account file
  let privatekey = require(DIALOGFLOW_SERVICE_ACCOUNT_LOCATION);

  // configure a JWT auth client
  authClient = new google.auth.JWT(
      privatekey.client_email,
      null,
      privatekey.private_key,
      scopes,
  );

  return new Promise(function(resolve, reject) {
      // authenticate request
      authClient.authorize(function(err, tokens) {
          if (err) {
              return;
          } else {
              console.log('Successfully connected!');

              resolve(authClient.credentials.access_token);
          }
      });
  });
}

module.exports = router;
