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

const businessmessages = require("businessmessages");

const SERVICE_ACCOUNT_LOCATION =
  __dirname + '/../resources/bm-agent-service-account-credentials.json';

// API library reference object
let bmApi = false;

// JWT cloud authentication reference object
let authClient = false;

const apiHelper = {
  init: function() {
    const authToken = this.generateAuthToken();

    return new Promise(function(resolve, reject) {
      authToken.then(function(authBearer) {
        resolve({authClient: authClient, bmApi: bmApi});
      }).catch(function(err) {
        console.log(err);
      });
    }).catch(function(err) {
      console.log(err);
    });
  },

  /**
   * Creates authorization token for Business Messages API access.
   *
   * @return {obj} A promise that will create the auth bearer.
   */
  generateAuthToken: function() {
    // Auth client has already been created, return existing token
    if (authClient != false) {
      return new Promise(function(resolve, reject) {
        resolve(authClient.credentials.access_token);
      });
    }

    // get the GoogleAPI library
    const {google} = require('googleapis');

    // set the scope that we need for the business communications api
    const scopes = [
      'https://www.googleapis.com/auth/businessmessages',
    ];

    // set the private key to the service account file
    const privatekey =
      require(SERVICE_ACCOUNT_LOCATION);

    // configure a JWT auth client
    authClient = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        scopes,
    );

    // initialize the RBM API
    bmApi =
        new businessmessages.businessmessages_v1.Businessmessages({}, google);

    return new Promise(function(resolve, reject) {
      // authenticate request
      authClient.authorize(function(err, tokens) {
        if (err) {

        } else {
          console.log('Successfully connected!');

          resolve(authClient.credentials.access_token);
        }
      });
    });
  },
};

module.exports = apiHelper;
