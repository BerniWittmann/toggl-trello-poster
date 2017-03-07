var moment = require('moment');
var Trello = require("trello");
var fs = require('fs');
var request = require('request');
var Dropbox = require('dropbox');

function errorHandler(desc, error) {
    console.error('ERROR: ' + desc);
    if (error) {
        console.error(error);
    }
    process.exit(1);
}

var config = require('./config.json') || {};

config.TOGGL_DATE_FORMAT = 'YYYY-MM-DD';

if (!config.MOMENT_FORMAT) {
    config.MOMENT_FORMAT = 'DD.MM.YYYY';
}

var until = moment().day('SUNDAY');
var passedInUntilDate = process.env.until || config.until;
if (passedInUntilDate) {
    until = moment(passedInUntilDate, config.MOMENT_FORMAT, true);
    if (!until.isValid()) {
        return errorHandler('Given until date is not valid', undefined);
    }
}

var since = until.clone().subtract(6, 'd');

var passedInSinceDate = process.env.since || config.since;
if (passedInSinceDate) {
    since = moment(passedInSinceDate, config.MOMENT_FORMAT, true);
    if (!since.isValid()) {
        return errorHandler('Given since date is not valid', undefined);
    }
}

if (!config.FILE_URL) {
    config.FILE_URL = "/reports/toggl_report_kw_" + since.format('ww') + '.pdf';
}
if (!config.LOCAL_FILE_URL) {
    config.LOCAL_FILE_URL = '/tmp/toggl_report_kw_' + since.format('ww') + '.pdf';
}

var requiredKeys = ['TRELLO_APP_KEY', 'TRELLO_API_TOKEN', 'TRELLO_LIST_ID', 'DROPBOX_ACCESS_TOKEN', 'TOGGL_AUTH_USERNAME', 'TOGGL_AUTH_PASSWORD', 'TOGGL_WORKSPACE_ID', 'TOGGL_PROJECT_IDS'];

requiredKeys.forEach(function (key) {
    if (!config[key] && !process.env[key]) {
        return errorHandler('No ' + key + ' was given', undefined);
    }

    if (process.env[key]) {
        config[key] = process.env[key];
    }
});


var trello = new Trello(config.TRELLO_APP_KEY, config.TRELLO_API_TOKEN);
var dbx = new Dropbox({accessToken: config.DROPBOX_ACCESS_TOKEN});

console.log('Generating Report from ' + since.format(config.MOMENT_FORMAT) + ' to ' + until.format(config.MOMENT_FORMAT));

var options = {
    auth: {'username': config.TOGGL_AUTH_USERNAME, 'pass': config.TOGGL_AUTH_PASSWORD},
    encoding: 'binary'
};
var url = 'https://www.toggl.com/reports/api/v2/summary.pdf?since=' + since.format(config.TOGGL_DATE_FORMAT) + '&until=' + until.format(config.TOGGL_DATE_FORMAT) + '&workspace_id=' + config.TOGGL_WORKSPACE_ID + '&project_ids=' + config.TOGGL_PROJECT_IDS + '&user_agent=b.wittmann@mail.de';

request.get(url, options, function (err, response, body) {
    if (err) {
        return errorHandler('Getting Toggl Report', err);
    }

    fs.writeFile(config.LOCAL_FILE_URL, body, 'binary', function (err) {
        if (err) {
            return errorHandler('Saving Toggl Report', err);
        }

        fs.readFile(config.LOCAL_FILE_URL, function (err, data) {
            if (err) {
                return errorHandler('Reading Toggl Report', err);
            }


            dbx.filesUpload({
                contents: data,
                path: config.FILE_URL,
                mode: {'.tag': 'add'},
                autorename: true
            }).then(function (res) {
                console.log('File Saved to Dropbox');

                dbx.sharingCreateSharedLink({path: res.path_lower}).then(function (res) {
                    console.log('Dropbox Link generated: ' + res.url);
                    var url = res.url;

                    trello.addCard('Toggl Report KW ' + since.format('ww'), 'Toggl Report von ' + since.format(config.MOMENT_FORMAT) + ' bis ' + until.format(config.MOMENT_FORMAT), config.TRELLO_LIST_ID, function (err, res) {
                        if (err) {
                            return errorHandler('Creating Trello Card', err);
                        }

                        if (res.id) {
                            console.log('Card created with id: ' + res.id);

                            trello.addAttachmentToCard(res.id, url, function (err) {
                                if (err) {
                                    return errorHandler('Adding Attachment to card', err);
                                }

                                console.log('Attachment attached to card');
                            });
                        }
                    });
                }).catch(function (error) {
                    return errorHandler('Creating Shared Link', error);
                })
            }).catch(function (error) {
                return errorHandler('Saving Report to Dropbox', error);
            });
        });
    });
});