# Toggl Trello Poster

Simple Node.js script to download a weekly [toggl](https://toggl.com/) report, save it to [dropbox](https://dropbox.com/) and post a card with the report attached to [trello](https://trello.com/).

## Installation

1. download / `git clone` the project
2. navigate to the project directory (e.g. `cd path/to/dir/toggl-trello-poster`)
3. run `npm install` to install dependecies
4. update your config file. See [Configuration](#configuration)
5. run script with `npm start`

## Configuration

You have two methods to configure the script

1. Method config.json (Recommended)

  Add a `config.json` or rename [config.sample.json](https://github.com/BerniWittmann/toggl-trello-poster/blob/master/config.sample.json) accordingly.

  Youre `config.json` should then look like this:
  ```
  {
    "TRELLO_APP_KEY": "trello-app-key",
    "TRELLO_API_TOKEN": "trello-api-token",
    "TRELLO_LIST_ID": "trello-list-id the list to be posted to",
    "DROPBOX_ACCESS_TOKEN": "dropbox-access-token",
    "TOGGL_AUTH_USERNAME": "toggl-api-username",
    "TOGGL_AUTH_PASSWORD": "toggl-api-password",
    "TOGGL_PROJECT_IDS": "toggl-project-ids comma separated",
    "TOGGL_WORKSPACE_ID": "toggl-workspace-id",
    "MOMENT_FORMAT": "DD.MM.YYYY"
  }
  ```
  You can also check [config.sample.json](https://github.com/BerniWittmann/toggl-trello-poster/blob/master/config.sample.json).

2. Method Environment Variables

  Run the script and pass the environment variables
  ```
    since=05.03.2017 until=06.03.2017 npm start
  ```

----

- Trello Setup

    * [Generate your developer key](https://trello.com/1/appKey/generate) and use it as *TRELLO_APP_KEY*.
    * Then get a token by going to `https://trello.com/1/connect?key=<PUBLIC_KEY>&name=TogglTrelloPoster&response_type=token&expiration=never&scope=read,write` replacing, of course, &lt;PUBLIC_KEY&gt; with the public key obtained in the first step and use this one as *TRELLO_API_TOKEN*
    * Get the ID of the Trello List you want your cards posted to and use this as *TRELLO_LIST_ID*

- Dropbox Setup

    * You need to setup an app in dropbox: Go to [Create app](https://www.dropbox.com/developers/apps/create)
    * Choose Dropbox API, then App Folder and give it a name
    * Under OAuth2 generate and AccessToken and use this as *DROPBOX_ACCESS_TOKEN*

- Toggl Setup
    * Obtain your Toggl API Token from your Toggl Profile and use it as *TOGGL_AUTH_USERNAME*
    * Usually the *TOGGL_AUTH_PASSWORD* is `api_token`
    * Get your Workplace ID and put it in *TOGGL_WORKSPACE_ID* 
    * Get the Project IDs which you want to be included in the report (comma-separated) e.g. 1123,5813
  

## Usage

Usually the script gets the report from last week's monday to sunday.

But you can set the date range manually by passing the parameters `since` and `until` to the script in the given *MOMENT_FORMAT* (By default DD.MM.YYYY). This can be achieved either by adding it to `config.json or passing it in as an environment variable.

## Contribution

Fork it, Pull-Requests are welcome