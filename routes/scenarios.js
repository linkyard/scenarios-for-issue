module.exports = function (app, addon) {
  app.get("/scenarios", addon.authenticate(), function (req, res) {
    const jira = require('../lib/jira-connector')(addon);
    const bc = require('./../lib/bitbucket-connector');

    //TODO from settings
    const creds = {
      username: 'mariosiegenthaler',
      password: 'LD25tSm5Nky5RStsWLeV'
    };
    const bitbucket = bc('linkyard', 'dynamic-processes', creds);

    jira.getIssueInfo(req, req.query['issue'])
      .then(function (issue) {
        if (!issue.file)
          return res.render('no-scenario');

        const rev = issue.rev || 'master';
        bitbucket.getFile(issue.file, rev).then(function (data) {
          res.render('scenarios', {
            name: data.file,
            rev: rev,
            shortRev: rev.substr(0, 8),
            notFixedRev: rev.match(/^[0-9a-fA-F]{4,40}$/) == null,
            content: data.raw,
            formatted: data.formatted
          });
        }, function (err) {
          console.info(err);
          res.render('scenarios-not-found', {
            message: err,
            name: issue.file,
            rev: rev
          });
        });
      });
  });
};
