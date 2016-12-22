# Scenarios for JIRA Cloud

Extends Atlassian JIRA by including gherkin scenarios 
from a bitbucket repository into the issue view.

## Security
* this addon reads issue details from Jira
* this addon stores entity properties on the issue:
  * a flag whether the scenario fields are set
* this addon stores entity properties on the project:
  * bitbucket repository identification (owner, name/slug)
  * bitbucket account (user/password). The password is encrypted
    with a key that is stored in the database of the addon.

The JIRA instance never has access to your bitbucket app
password. The same goes for the client (browser) - except
when they configure a new password (only the one they
have typed in the field).


## For Developers
This addon may serve as an example for Atlassian Connect plugins.

It uses the following techniques:

* node.js express based server (atlassian-connect-express)
* embedding a webpanel (`ly-issue-scenarios`) into the view issue screen: `atlassian-connect.json`
* adding a settings screen (`projectconfig-panel`) to the project settings: `atlassian-connect.json`
* reacting to updates to an issue via a webhook: `issue-updated.js` and `atlassian-connect.json`
* adding custom fields to the JIRA instance: `atlassian-connect.json`
* using the JIRA REST API from our server: `jira-connector.js`
* using the JIRA REST API from the webbrowser: `getProjectProperty` in `js/project-config.js`
* using the bitbucket REST API from the server: `bitbucket-connector.js`
* calling our server from the browser
  * server part: `encrypt` in `routes/project-config.js`
  * client part:
    * `setProjectEntityPropertyEncrypted` in `js/project-config.js`
    * jwt in `page-context.js` and `layout.hbs` (meta tag)
* storing settings in JIRA as entity properties
  * server part (reading): `loadSettings` in `jira-connector.js`
  * client part (reading and writing): `js/project-config.js`
* storing sensitive data: see the handling of the password entity property (above)
  * server generates unique encryption key per tenant and stores it in its database
  * the encrypted passwords are stored as entity properties in JIRA
  * they can only be decrypted by the server and not in the browser
* deployment using docker: `Dockerfile`