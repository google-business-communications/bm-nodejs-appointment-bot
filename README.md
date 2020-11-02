# BUSINESS MESSAGES: Appointment Bot

This sample demonstrates how to create an appointment setting agent
for the [Business Messages](https://developers.google.com/business-communications/business-messages/reference/rest)
platform using Dialogflow and the
[Business Messages Node.js client library](https://github.com/google-business-communications/nodejs-businessmessages).

This sample runs on the Google App Engine.

See the Google App Engine (https://cloud.google.com/appengine/docs/nodejs/) standard environment
documentation for more detailed instructions.

## Documentation

The documentation for the Business Messages API can be found [here](https://developers.google.com/business-communications/business-messages/reference/rest).

## Prerequisite

You must have the following software installed on your machine:

* [Google Cloud SDK](https://cloud.google.com/sdk/) (aka gcloud)
* [Node.js](https://nodejs.org/en/) - version 10 or above

## Before you begin

1.  [Register with Business Messages](https://developers.google.com/business-communications/business-messages/guides/set-up/register).
1.  Once registered, follow the instructions to [enable the APIs for your project](https://developers.google.com/business-communications/business-messages/guides/set-up/register#enable-api).

### Setup your API authentication credentials

This sample application uses a service account key file to authenticate the Business Messages API calls for your registered Google Cloud project. You must download a service account key and configure it for the sample.

To download a service account key and configure it for the sample, follow the instructions below.

1.  Open [Google Cloud Console](https://console.cloud.google.com) with your
    Business Messages Google account and make sure you select the project that you registered for Business Messages with.

1.  Create a service account.

    1.   Navigate to [Credentials](https://console.cloud.google.com/apis/credentials).

    2.   Click **Create service account**.

    3.   For **Service account name**, enter your agent's name, then click **Create**.

    4.   For **Select a role**, choose **Project** > **Editor**, then click **Continue**.

    5.   Under **Create key**, choose **JSON**, then click **Create**.

         Your browser downloads the service account key. Store it in a secure location.

    6.  Click **Done**.

    7.  Copy the JSON credentials file into this sample's /resources
        folder and rename it to "bm-agent-service-account-credentials.json".

### Create a Business Messages agent

*   Open the [Create an agent](https://developers.google.com/business-communications/business-messages/guides/set-up/agent)
    guide and follow the instructions to create a Business Messages agent.

### Create a Dialogflow agent:

1.  Open [Dialogflow Console](https://dialogflow.cloud.google.com/) with your Google account and create a new Dialogflow agent.

1.  After the agent is created, click the great icon next to the name of your agent in the left navigation.

1.  Click the **Service Account** email field. This will open the Service accounts page within the Google Cloud Console.

1.  Download a service account key.

    1.    Click the three dots for see the overflow menu for the existing service account in the table.

    1.    Click **Create key**.

    1.    One the dialog that opens, click **Create** to download the service account key.

    1.    Copy the JSON credentials file into this sample's /resources
          folder and rename it to "df-agent-service-account-credentials.json".

1.  Go back to the Dialogflow Console and from the agent configuration page, click **Export and Import**.

1.  Click the **RESTORE FROM ZIP** button and select the zip file within this samples root directory called dialogflow-appointmentbot.zip.

1.  Once the Dialogflow agent is imported, click **Fulfillment** from the left navigation.

1.  Under **Webhook**, click the **Disabled** toggle onto **Enabled** and enter
    https://PROJECT_ID.appspot.com/fulfillment/dfCallback in the **URL** field. Replace PROJECT_ID with the Google Cloud project you created and registered with Business Messages.

1.  Click **SAVE** at the bottom of this page.

### Update the sample launch page Business Messages agent test URL

1.  Open the [views/index.ejs](https://github.com/google-business-communications/bm-nodejs-appointment-bot/blob/master/views/index.ejs) file from the samples route directory.

1.  Locate the **Chat now** anchor link and update the href value to your agent's test URL. You can retrieve your agent's test URL by issuing a [GET request](https://developers.google.com/business-communications/business-messages/guides/set-up/agent#get-agent) via [Business Communications API](https://developers.google.com/business-communications/business-messages/reference/business-communications/rest) for your agent.

## Deploy the sample

1.  In a terminal, navigate to this sample's root directory.

1.  Run the following commands:

    ```bash
    gcloud config set project PROJECT_ID
    ```

    Where PROJECT_ID is the project ID for the project you created when you registered for
    Business Messages.

    ```bash
    gcloud app deploy
    ```

1.  On your mobile device, use the test business URL associated with the
    Business Messages agent you created. Open a conversation with your agent
    and follow the prompts to book an appointment.

    See the [Test an agent](https://developers.google.com/business-communications/business-messages/guides/set-up/agent#test-agent) guide if you need help retrieving your test business URL.