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
const util = require('util');
const moment = require('moment');

// Offset used by the appointment setting functionality
// to calculate the correct time.
const timeZoneOffset = '-06:00';

/**
 * This sample script serves as the webhook URL for Dialogflow fulfillment.
 *
 * The /dfCallback URL should be configured within Dialogflow as the webhook
 * for fulfillment. The callback URL maps the matching intent to a function
 * to generate a custom payload response formatted for Business Messages.
 *
 * Please check the README for configuration instructions.
 */

// Mapping between triggered intent and the function
// that should produce a response from the bot
let intentMap = new Map([
    ['Default Welcome Intent', welcomeMessageResponse],
    ['Good Bye / Thanks', goodByeResponse],
    ['Hours', hoursResponse],
    ['Location', locationResponse],
    ['Menu', menuResponse],
    ['Make Appointment', makeAppointmentResponse],
    ['Make Appointment - custom', makeAppointmentFollowUpResponse],
  ]);

/**
 * The Dialogflow fulfillment webhook.
 */
router.post('/dfCallback', function(req, res, next) {
  let payload = {};

  let intentDisplayName = req.body.queryResult.intent.displayName;
  console.log('Display name: ' + intentDisplayName);

  if (intentMap.has(intentDisplayName)) {
    console.log('Found name: ' + intentDisplayName);

    let func = intentMap.get(intentDisplayName);
    payload = func(req.body.queryResult);
  }

  console.log('payload');
  console.log(util.inspect(payload, {showHidden: false, depth: null}));

  res.status(200).json(payload);
});

/**
 * Generates a welcome message formatted for Business Messages.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function welcomeMessageResponse(queryResult) {
  let payload = {
    'fulfillmentMessages': [
        {
          'payload': {
            'text': 'Hi {name}, welcome to Sean\'s Bike Shop!\n\nI\'m ' +
              'Sean\'s digital assistant and I can help you book an ' +
              'appointment for a bike service or tune-up. Please let ' +
              'me know how I can help.',
            'suggestions': [
              {
                'reply': {
                  'postbackData': 'I want to book an appointment',
                  'text': 'Book an appointment',
                },
              },
              {
                'reply': {
                  'postbackData': 'What are your hours?',
                  'text': 'What are your hours?',
                },
              },
              {
                'reply': {
                  'postbackData': 'Where are you located?',
                  'text': 'Where are you located?',
                },
              },
            ],
          },
        },
      ],
    };

    return payload;
}

/**
 * Generates a good bye/thank you message formatted for Business Messages.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function goodByeResponse(queryResult) {
  let payload = {
    'fulfillmentMessages': [
        {
          'payload': {
            'suggestions': [
              {
                'reply': {
                  'text': 'Book an appointment',
                  'postbackData': 'I want to book an appointment',
                },
              },
              {
                'reply': {
                  'text': 'What are your hours?',
                  'postbackData': 'What are your hours?',
                },
              },
              {
                'reply': {
                  'postbackData': 'Where are you located?',
                  'text': 'Where are you located?',
                },
              },
            ],
            'text': 'Thanks {name} for using Sean\'s Bike Shop! Let me know ' +
              'if there\'s anything else I can help with.',
          },
        },
      ],
    };

    return payload;
}

/**
 * Generates a response for questions about the business's hours
 * formatted for Business Messages.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function hoursResponse(queryResult) {
  let payload = {
    'fulfillmentMessages': [
        {
          'payload': {
            'suggestions': [
              {
                'reply': {
                  'postbackData': 'I want to book an appointment',
                  'text': 'Book an appointment',
                },
              },
              {
                'reply': {
                  'postbackData': 'Where are you located?',
                  'text': 'Where are you located?',
                },
              },
            ],
            'text': 'We\'re open Monday through Friday from 9am to 5:30pm.',
          },
        },
      ],
    };

    return payload;
}

/**
 * Generates a response for listing the locations available for this business
 * formatted for Business Messages.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function locationResponse(queryResult) {
  let payload = {
      'fulfillmentMessages': [
        {
          'payload': {
            'text': 'We currently have three locations in the Bay Area.',
          },
        },
        {
          'payload': {
            'richCard': {
              'carouselCard': {
                'cardContents': [
                  {
                    'suggestions': [
                      {
                        'action': {
                          'openUrlAction': {
                            'url': 'https://www.google.com/maps/place/Googleplex/@37.4220041,-122.0862515,17z/data=!3m1!4b1!4m5!3m4!1s0x808fba02425dad8f:0x6c296c66619367e0!8m2!3d37.4219999!4d-122.0840575',
                          },
                          'postbackData': 'ignore',
                          'text': 'See details',
                        },
                      },
                    ],
                    'media': {
                      'contentInfo': {
                        'fileUrl': 'https://storage.googleapis.com/sample-logos/googleplex.png',
                        'forceRefresh': false,
                      },
                      'height': 'MEDIUM',
                    },
                    'title': 'Sean\'s Mountain View location',
                  },
                  {
                    'media': {
                      'contentInfo': {
                        'forceRefresh': false,
                        'fileUrl': 'https://storage.googleapis.com/sample-logos/sf-office.png',
                      },
                      'height': 'MEDIUM',
                    },
                    'title': 'Sean\'s San Francisco location',
                    'suggestions': [
                      {
                        'action': {
                          'openUrlAction': {
                            'url': 'https://www.google.com/maps/place/Google+San+Francisco/@37.7896862,-122.3923026,17z/data=!3m1!4b1!4m5!3m4!1s0x8085806415f06bdf:0xf048a8b5bd7b0cf3!8m2!3d37.789682!4d-122.3901086',
                          },
                          'postbackData': 'ignore',
                          'text': 'See details',
                        },
                      },
                    ],
                  },
                  {
                    'suggestions': [
                      {
                        'action': {
                          'postbackData': 'ignore',
                          'openUrlAction': {
                            'url': 'https://www.google.com/maps/place/YouTube+San+Bruno,+1000+Cherry+Ave,+San+Bruno,+CA+94066/@37.6292889,-122.4299609,16z/data=!4m5!3m4!1s0x808f79e84bcef1e9:0xd9997ba77f204b56!8m2!3d37.6292847!4d-122.4255782',
                          },
                          'text': 'See details',
                        },
                      },
                    ],
                    'title': 'Sean\'s San Bruno location',
                    'media': {
                      'contentInfo': {
                        'fileUrl': 'https://storage.googleapis.com/sample-logos/youtube.png',
                        'forceRefresh': false,
                      },
                      'height': 'MEDIUM',
                    },
                  },
                ],
                'cardWidth': 'MEDIUM',
              },
            },
            'suggestions': [
              {
                'reply': {
                  'postbackData': 'I want to book an appointment',
                  'text': 'Book an appointment',
                },
              },
              {
                'reply': {
                  'text': 'What are your hours?',
                  'postbackData': 'What are your hours?',
                },
              },
              {
                'reply': {
                  'postbackData': 'Where are you located?',
                  'text': 'Where are you located?',
                },
              },
            ],
          },
        },
      ],
    };

    return payload;
}

/**
 * Generates a menu of options formatted for Business Messages.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function menuResponse(queryResult) {
  let payload = {
      'fulfillmentMessages': [
        {
          'payload': {
            'suggestions': [
              {
                'reply': {
                  'postbackData': 'I want to book an appointment',
                  'text': 'Book an appointment',
                },
              },
              {
                'reply': {
                  'text': 'What are your hours?',
                  'postbackData': 'What are your hours?',
                },
              },
              {
                'reply': {
                  'text': 'Where are you located?',
                  'postbackData': 'Where are you located?',
                },
              },
            ],
            'text': 'No problem at all, happy to help. ' +
              'Please let me know what I can do?',
          },
        },
      ],
    };

    return payload;
}

/**
 * Generates a response to making an appointment formatted for Business Messages.
 * The function checks to see if all required parameters have been supplied. If
 * not, then the user is prompted to supply those parameters before moving on.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function makeAppointmentResponse(queryResult) {
  // Extract required parameters
  const appointmentDate = queryResult.parameters.date;
  const appointmentTime = queryResult.parameters.time;

  const gotAppointmentDate = appointmentDate.length > 0;
  const gotAppointmentTime = appointmentTime.length > 0;

  let responseText = '';
  let suggestions = [];

  if (gotAppointmentDate && gotAppointmentTime) {
    // We have all required parameters, return success message
    console.log('have both pieces of info');
    responseText = 'Great! I\'ve set up your appointment!\n\n' +
      'Do you need a repair or just a tune-up?';
    suggestions = [
                {
                  'reply': {
                    'text': 'Repair',
                    'postbackData': 'repair',
                  },
                },
                {
                  'reply': {
                    'text': 'Tune-up',
                    'postbackData': 'tune-up',
                  },
                },
              ];
  } else if (gotAppointmentDate) {
    console.log('getting times');
    responseText = 'What time works for you?';
    suggestions = getSuggestedTimes();
  } else if (gotAppointmentTime) {
    responseText = 'What day do you want to come in?';
    suggestions = getSuggestedDates();
  } else {
    responseText = 'What day do you want to come in?';
    suggestions = getSuggestedDates();
  }

  let payload = {
    'fulfillmentMessages': [
      {
        'payload': {
            'text': responseText,
            'suggestions': suggestions,
          },
      },
    ],
  };

  return payload;
}

/**
 * Generates the follow-up message after an appointment has been set
 * formatted for Business Messages.
 *
 * @param {object} queryResult The result object from Dialogflow.
 * @return {object} The JSON payload for fulfillment
 * containing the Business Messages response.
 */
function makeAppointmentFollowUpResponse(queryResult) {
  try {
    let context = queryResult.outputContexts[0];

    // Extract required parameters
    const appointmentDate = new Date(context.parameters.date);
    const appointmentTime = new Date(context.parameters.time);
    const appointmentType = queryResult.parameters.AppointmentType;

    // Format date and time to be human-readable
    const dateAsString = appointmentDate.toLocaleDateString('en-US',
        {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});

    console.log('appointmentTime: ' + appointmentTime);

    let hoursOffset = parseInt(timeZoneOffset.split(':')[0]);
    let minutesOffset = parseInt(timeZoneOffset.split(':')[1]);

    let format = 'YYYYMMDDTHHmmss';
    let startTime = moment(appointmentTime).add(hoursOffset, 'hours')
      .add(minutesOffset, 'minutes').format(format);
    let endTime = moment(appointmentTime).add(hoursOffset, 'hours')
      .add(minutesOffset, 'minutes').add(30, 'minutes').format(format);

    const timeAsString = moment(appointmentTime).add(hoursOffset, 'hours')
      .add(minutesOffset, 'minutes').format('h:mm a');

    // Compose response for user
    let responseText = 'Okay, we\'ll schedule a ' + appointmentType +
      ', ' + dateAsString +
      ', at ' + timeAsString + '.  We\'ll see you then!';

    // Create a calendar event link
    let calendarUrl = 'https://www.google.com/calendar/render?action=TEMPLATE&text=Your+Bike+Appointment+with+Sean\'s+bike+shop&dates='
      + startTime + '/' + endTime
      + '&details=For+location+details,+link+here:+https://www.google.com/maps/place/Googleplex/@37.4220041,-122.0862515,17z/data=!3m1!4b1!4m5!3m4!1s0x808fba02425dad8f:0x6c296c66619367e0!8m2!3d37.4219999!4d-122.0840575&sf=true&output=xml';

    console.log(calendarUrl);

    let payload = {
      'fulfillmentMessages': [
        {
          'payload': {
              'text': responseText,
                'suggestions': [
                  {
                    'action': {
                      'postbackData': 'thanks',
                      'text': 'Add to my calendar',
                      'openUrlAction': {
                        'url': calendarUrl,
                      },
                    },
                  },
                  {
                    'reply': {
                      'postbackData': 'What are your hours?',
                      'text': 'What are your hours?',
                    },
                  },
                  {
                    'reply': {
                      'postbackData': 'Where are you located?',
                      'text': 'Where are you located?',
                    },
                  },
                ],
            },
        },
      ],
    };

    return payload;
  } catch (e) {
    console.log(e);
  }
}

/**
 * Generates suggestions for appointment times formatted for Business Messages.
 *
 * @return {object} The JSON representation of suggested replies for times.
 */
function getSuggestedTimes() {
  return [
        {
          'reply': {
            'text': '9am',
            'postbackData': '9:00 am',
          },
        },
        {
          'reply': {
            'text': '10am',
            'postbackData': '10:00 am',
          },
        },
        {
          'reply': {
            'text': '1pm',
            'postbackData': '1:00 pm',
          },
        },
        {
          'reply': {
            'text': '2pm',
            'postbackData': '2:00 pm',
          },
        },
      ];
}

/**
 * Generates suggestions for appointment dates formatted for Business Messages.
 *
 * @return {object} The JSON representation of suggested replies for dates.
 */
function getSuggestedDates() {
  return [
        {
          'reply': {
            'text': 'Today',
            'postbackData': 'Today',
          },
        },
        {
          'reply': {
            'text': 'Tomorrow',
            'postbackData': 'Tomorrow',
          },
        },
        {
          'reply': {
            'text': 'Two days from now',
            'postbackData': 'two days from now',
          },
        },
      ];
}

module.exports = router;
