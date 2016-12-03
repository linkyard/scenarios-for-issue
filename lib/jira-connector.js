const Promise = require('bluebird');

module.exports = function (addon) {
  return {
    getIssueInfo: function (req, issueKey) {
      const httpClient = Promise.promisifyAll(addon.httpClient(req));

      return httpClient.getAsync({
        uri: '/rest/api/2/issue/' + issueKey + '?fieldsByKeys=true'
        + '&fields=ch.linkyard.scenarios-jira__scenario-rev-field,ch.linkyard.scenarios-jira__scenario-file-field'
        + '&properties=ly-scenario-visible',
        json: true
      }).then(function (r) {
        return {
          issue: r.body.key,
          rev: r.body.fields['ch.linkyard.scenarios-jira__scenario-rev-field'],
          file: r.body.fields['ch.linkyard.scenarios-jira__scenario-file-field'],
          scenariosVisible: r.body.properties['ly-scenario-visible'] || false
        };
      })
    },

    updateScenariosVisible: function (req, issueKey, value) {
      const httpClient = Promise.promisifyAll(addon.httpClient(req));
      return httpClient.putAsync({
        uri: '/rest/api/2/issue/' + issueKey + '/properties/ly-scenario-visible',
        json: true,
        body: value
      }).then(function (res) {
        if (res.statusCode / 100 != 2)
          throw new Error("Setting property failed: " + res.status);
        return res.body;
      });
    },

    loadSettings: function (req, projectKey) {
      const httpClient = Promise.promisifyAll(addon.httpClient(req));
      function loadProperty(propertyKey) {
        return httpClient.getAsync({
          uri: '/rest/api/2/project/' + projectKey + '/properties/' + propertyKey,
          json: true
        }).then(function (resp) {
          return resp.body.value;
        });
      }

      var keys = ['ly-scenarios-repo-owner', 'ly-scenarios-repo-slug',
        'ly-scenarios-bitbucket-user', 'ly-scenarios-bitbucket-password']
      return Promise
        .all(keys.map(loadProperty))
        .then(function (values) {
          return {
            owner: values[0],
            slug: values[1],
            user: values[2],
            password: values[3]
          }
        });
    }
  }
};