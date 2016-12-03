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