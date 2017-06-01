const bitbucket = require('./bitbucket-connector')
const github = require('./github-connector')

module.exports = function (type, org, repo_slug, credentials) {
  switch (type) {
    case 'github':
      return github(org, repo_slug, credentials);

    case 'bitbucket':
    default: // to be backwards compatible
      return bitbucket(org, repo_slug, credentials)
  }
}

