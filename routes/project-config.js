module.exports = function (app, addon) {
  const encryption = require('../lib/encryption')(addon);

  app.get('/project-config', addon.authenticate(), function (req, res) {
    res.render('project-config', {
      owner: 'owner',
      slug: 'repo',
      user: 'user'
    });
  });

  //use addon.checkValidToken because we call from our client-side javascript.
  app.get('/project-config-updated', addon.checkValidToken(), function (req, res) {
    console.log('Configuration for the project ' + req.query.project + ' was updated');
    res.status(200).send('ok')
  });

  app.post('/encrypt', addon.checkValidToken(), function (req, res) {
    const input = req.body.value;
    encryption.encrypt(req, input).then(function (enc) {
      res.status(200).send(enc);
    }, function (err) {
      res.status(500).send(err);
    });
  });
};