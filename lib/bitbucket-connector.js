const Promise = require('bluebird');
const hljs = require('highlight.js');
const bitbucket_api = Promise.promisifyAll(require('bitbucket-api'));

module.exports = function (org, repo_slug, credentials) {
  const bitbucket = Promise.promisifyAll(bitbucket_api.createClient(credentials));

  return {
    getFile: function (file, rev) {
      return bitbucket
        .getRepositoryAsync({owner: org, slug: repo_slug})
        .then(function (repo) {
          return repo.sources(file, rev);
        })
        .then(Promise.promisifyAll)
        .then(function (src) {
          return src.infoAsync();
        })
        .then(function (file) {
          return {
            file: file.path,
            raw: file.data,
          };
        }, function(err) {
          throw err;
        });
    },
    getUrl: function(file, rev) {
      return 'https://bitbucket.org/' + org + '/' + repo_slug + '/src/' + rev + '/' + file;
    }
  }
}

