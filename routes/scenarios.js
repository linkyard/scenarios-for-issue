const Promise = require('bluebird');

module.exports = function (app, addon) {
  app.get("/scenarios", addon.authenticate(), function (req, res) {
    function loadIssueData(issueNumber) {
      const httpClient = Promise.promisifyAll(addon.httpClient(req));

      return httpClient.getAsync({
        uri: '/rest/api/2/issue/' + issueNumber + '?fieldsByKeys=true&fields=ly-scenarios__scenario-rev-field,ly-scenarios__scenario-file-field',
        json: true
      }).then(function (r) {
        return {
          issue: r.body.key,
          rev: r.body.fields['ly-scenarios__scenario-rev-field'],
          file: r.body.fields['ly-scenarios__scenario-file-field']
        };
      })
    }

    //TODO from settings
    const bc = require('./../lib/bitbucket-connector');
    const creds = {
      username: 'mariosiegenthaler',
      password: 'LD25tSm5Nky5RStsWLeV'
    };
    const bitbucket = bc('linkyard', 'dynamic-processes', creds);

    loadIssueData(req.query['issue'])
      .then(function (issue) {
        bitbucket.getFile(issue.file, issue.rev).then(function (data) {
          res.render('scenarios', {
            name: data.file,
            rev: issue.rev,
            shortRev: issue.rev.substr(0, 8),
            notFixedRev: issue.rev.match(/^[0-9a-fA-F]{4,40}$/) == null,
            content: data.raw,
            formatted: data.formatted
          });
        }, function (err) {
          console.info(err);
          res.render('scenarios-not-found', {
            message: err,
            name: issue.file,
            rev: issue.rev
          });
        });
      });
  });
};
