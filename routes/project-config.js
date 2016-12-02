module.exports = function (app, addon) {
  app.get("/project-config", addon.authenticate(), function (req, res) {
    res.render('project-config', {
      owner: 'owner',
      slug: 'repo',
      user: 'user'
    });
  });
}