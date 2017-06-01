const Promise = require('bluebird');
const hljs = require('highlight.js');

module.exports = function (app, addon) {
  const jira = require('../lib/jira-connector')(addon);
  const repoFactory = require('./../lib/repo');

  function gherkinToHtml(gherkin) {
    if (!gherkin) return;
    return hljs.highlight('gherkin', gherkin).value;
  }

  app.get("/scenarios", addon.authenticate(), function (req, res) {
    Promise.all([
      jira.loadSettings(req, req.query.project),
      jira.getIssueInfo(req, req.query.issue)])
      .then(function (a) {
        settings = a[0];
        issue = a[1];
        const rev = issue.rev || 'master';
        if (!issue.file)
          return res.render('no-scenario');

        if (!settings.user) {
          return res.render('scenarios-error', {
            message: "Please configure the plugin first (in the project settings under 'Scenario Integration').",
          });
        }
        const repo = repoFactory(settings.type, settings.owner, settings.slug, {
          username: settings.user,
          password: settings.password
        });
        repo.getFile(issue.file, rev).then(function (data) {
          res.render('scenarios', {
            name: data.file,
            rev: rev,
            shortRev: rev.substr(0, 8),
            notFixedRev: rev.match(/^[0-9a-fA-F]{4,40}$/) == null,
            content: data.raw,
            formatted: gherkinToHtml(data.raw),
            link: repo.getUrl(issue.file, rev)
          });
        }, function (err) {
          console.info(err);
          res.render('scenarios-error', {
            message: 'Could not load source for ' + issue.file + ' (rev ' + rev + ') from bitbucket.',
            details: err.toString()
          });
        });
      }, function (err) {
        console.info(err);
        res.render('scenarios-error', {
          message: 'Could not get data from JIRA.',
          details: err.toString()
        });
      });
  });
};
