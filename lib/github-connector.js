const Client = require('github');
const Promise = require('bluebird');
const github = new Client({
  debug: false,
  Promise: Promise
});

module.exports = function (org, repo, credentials) {
  github.authenticate({
    type: 'basic',
    username: credentials.username,
    password: credentials.password
  });

  return {
    getFile: function (file, ref) {
      return github.repos.getContent({
        owner: org,
        repo: repo,
        path: file,
        ref: ref
      }).catch(function (error) {
        if (error.code === 404) {
          throw new Error('File ' + file + ' not found')
        } else throw new Error(error.message)
      }).then(function (res) {
        var content = res.data.content
        if (res.data.encoding === 'base64') {
          content = Buffer.from(res.data.content, 'base64').toString();
        }
        return {
          file: res.data.path,
          raw: content
        }
      })
    },
    getUrl: function (file, rev) {
      return 'https://github.com/' + org + '/' + repo + '/blob/' + rev + '/' + file;
    }
  }
}

