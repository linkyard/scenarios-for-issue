const Promise = require('bluebird');

module.exports = function (addon) {
  return {
    getIssueInfo: function (req, issueKey) {
      const httpClient = Promise.promisifyAll(addon.httpClient(req));

      return httpClient.getAsync({
        uri: '/rest/api/2/issue/' + issueKey + '?fieldsByKeys=true'
        + '&fields=ly-scenarios__scenario-rev-field,ly-scenarios__scenario-file-field'
        + '&properties=ly-scenario-visible',
        json: true
      }).then(function (r) {
        return {
          issue: r.body.key,
          rev: r.body.fields['ly-scenarios__scenario-rev-field'],
          file: r.body.fields['ly-scenarios__scenario-file-field'],
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
    }
  }
};