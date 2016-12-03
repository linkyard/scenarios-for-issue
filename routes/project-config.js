module.exports = function (app, addon) {
  app.get('/project-config', addon.authenticate(), function (req, res) {
    res.render('project-config', {
      owner: 'owner',
      slug: 'repo',
      user: 'user'
    });
  });

  app.get('/project-config-updated', addon.checkValidToken(), function (req, res) {
    console.log('Configuration for the project ' + req.query.project + ' was updated');
    res.status(200).send('ok')
  });
}