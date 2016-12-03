module.exports = function (app, addon) {
  const jira = require('../lib/jira-connector')(addon);

  app.post("/issue-updated", addon.authenticate(), function (req, res) {
    const issue = req.body.issue;

    jira.getIssueInfo(req, issue.key)
      .then(function (data) {
        const changed = !data.file != !data.scenariosVisible;
        if (changed)
          return jira.updateScenariosVisible(req, issue.key, !!data.file);
        else
          return undefined; //already correct, no need to update
      })
      .then(function() {
        res.status(204).send();
      }, function(err) {
        console.log(err);
        res.status(500).send();
      });
  });
};