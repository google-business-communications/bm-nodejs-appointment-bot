# BUSINESS MESSAGES: APPOINTMENT BOT

This sample demonstrates how to create an appointment setting agent
for the Business Messages platform using Dialogflow and the Node.js SDK.

This sample is setup to run on the Google App Engine.

See the Google App Engine (https://cloud.google.com/appengine/docs/nodejs/) standard environment
documentation for more detailed instructions.

## PREREQUISITES

You must have the following software installed on your development machine:

* [Google Cloud SDK](https://cloud.google.com/sdk/) (aka gcloud)
* [Node.js](https://nodejs.org/en/) - version 10 or above

## SETUP

Register with Business Messages:

    1.  Open [Google Cloud Console](https://console.cloud.google.com) with your
        Business Messages Google account and create a new project for your agent.

        Note the **Project ID** and **Project number** values.

    2.  Open the
        [Business Messages API](https://console.developers.google.com/apis/library/businessmessages.googleapis.com)
        in the API Library.

    3.  Click **Enable**.

    4.  [Register your project](https://developers.google.com/business-communications/business-messages/guides/set-up/register)
        with Business Messages. As the webhook URL, use https://PROJECT_ID.appspot.com/callback, where PROJECT_ID is the **Project ID**
        for the Google Cloud project you created in step 1.

    5.  Create a service account.

        1.   Navigate to [Credentials](https://console.cloud.google.com/apis/credentials).

        2.   Click **Create service account**.

        3.   For **Service account name**, enter your agent's name, then click **Create**.

        4.   For **Select a role**, choose **Project** > **Editor**, the click **Continue**.

        5.   Under **Create key**, choose **JSON**, then click **Create**.

             Your browser downloads the service account key. Store it in a secure location.

    6.  Click **Done**.

    7.  Copy the JSON credentials file into this sample's /resources
        folder and rename it to "bm-agent-service-account-credentials.json".

Create a Business Messages agent:

    *   Open the [Create an agent](https://developers.google.com/business-communications/business-messages/guides/set-up/agent)
        guide and follow the instructions to create a Business Messages agent.

Create a Dialogflow agent:

    1.  Open [Dialogflow Console](https://dialogflow.cloud.google.com/) with your Google account and create a new Dialogflow agent.

    2.  After the agent is created, click the great icon next to the name of your agent in the left navigation.

    3.  Click the **Service Account** email field. This will open the Service accounts page within the Google Cloud Console.

    4.  Download a service account key.

        1.    Click the three dots for see the overflow menu for the existing service account in the table.

        2.    Click **Create key**.

        3.    One the dialog that opens, click **Create** to download the service account key.

        4.    Copy the JSON credentials file into this sample's /resources
              folder and rename it to "df-agent-service-account-credentials.json".

    5.  Go back to the Dialogflow Console and from the agent configuration page, click **Export and Import**.

    6.  Click the **RESTORE FROM ZIP** button and select the zip file within this samples root directory called dialogflow-appointmentbot.zip.

    7.  Once the Dialogflow agent is imported, click **Fulfillment** from the left navigation.

    8.  Under **Webhook**, click the **Disabled** toggle onto **Enabled** and enter
        https://PROJECT_ID.appspot.com/fulfillment/dfCallback in the **URL** field. Replace PROJECT_ID with the Google Cloud project you created and registered with Business Messages.

    9.  Click **SAVE** at the bottom of this page.

Update the sample launch page Business Messages agent test URL:

    1.  Open the views/index.ejs file from the samples route directory.

    2.  Locate the **Chat now** anchor link and update the href value to your agent's test URL. You can retrieve your agent's test URL by issuing a [GET request](https://developers.google.com/business-communications/business-messages/guides/set-up/agent#get-agent)via Business Communications API for your agent.


## RUN THE SAMPLE

    1.  In a terminal, navigate to this sample's root directory.

    2.  Run the following commands:

        gcloud config set project PROJECT_ID

        Where PROJECT_ID is the project ID for the project you created when you registered for
        Business Messages

        gcloud app deploy

    3.  On your mobile device, use the test business URL associated with the
        Business Messages agent you created.
