define(['./page-context'], function (PC) {
  'using strict'

  const defaultPasswordValue = '__existing_password__'


  function getProjectProperty(projectKey, propertyKey) {
    return $.Deferred(function (self) {
      AP.require(['request'], function (request) {
        request({
          url: '/rest/api/2/project/' + projectKey + '/properties/' + propertyKey,
          type: 'GET',
          success: function (data) {
            self.resolve(JSON.parse(data));
          }, error: function () {
            self.reject();
          }
        });
      });
    });
  }

  function setProjectEntityProperty(projectKey, propertyKey, propertyValue) {
    return $.Deferred(function (self) {
      AP.require(['request'], function (request) {
        request({
          url: '/rest/api/2/project/' + projectKey + '/properties/' + propertyKey,
          type: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify(propertyValue),
          success: function (data) {
            self.resolve();
          }, error: function () {
            self.reject();
          }
        });
      });
    });
  }

  var pageContext = PC.load();
  var projectKey = pageContext.project;

  function loadProperty(name) {
    return getProjectProperty(projectKey, name).then(null, function () {
      return $.Deferred().resolve({key: name, value: ''});
    })
  }

  function loadSettings() {
    var properties = [
      loadProperty('ly-scenarios-repo-owner'),
      loadProperty('ly-scenarios-repo-slug'),
      loadProperty('ly-scenarios-bitbucket-user')]
    return AJS.$.when
      .apply(AJS.$, properties)
      .then(function (owner, slug, user) {
        AJS.$('#owner').val(owner.value);
        AJS.$('#slug').val(slug.value);
        AJS.$('#user').val(user.value);
        AJS.$('#password').val(user.value ? defaultPasswordValue : '');
        AJS.$('#form').show();
        AJS.$('#loading').hide();
        return [owner, slug, user]
      });
  }

  loadSettings();

  AJS.$('#update').click(function (e) {
    e.preventDefault();

    var owner = AJS.$('#owner').val();
    var slug = AJS.$('#slug').val();
    var user = AJS.$('#user').val();
    var password = AJS.$('#password').val();

    if (!owner || !slug || !user || !password) {
      AP.require('messages', function (messages) {
        messages.error('Missing value', 'Please enter a value for each setting.', {
          fadeout: true,
          delay: 5000
        });
      });
      return false;
    }

    const toUpdate = [
      setProjectEntityProperty(projectKey, 'ly-scenarios-repo-owner', owner),
      setProjectEntityProperty(projectKey, 'ly-scenarios-repo-slug', slug),
      setProjectEntityProperty(projectKey, 'ly-scenarios-bitbucket-user', user)];
    if (password != defaultPasswordValue) {
      toUpdate.push(
        //encrypt the password first
        AJS.$.ajax({
          type: 'POST',
          contentType: 'application/json',
          url: 'encrypt',
          data: JSON.stringify({
            value: password
          }),
          beforeSend: function (request) {
            request.setRequestHeader('Authorization', 'JWT ' + pageContext.jwt);
          }
        }).then(function (encrypted) {
          return setProjectEntityProperty(projectKey, 'ly-scenarios-bitbucket-password', encrypted);
        })
      );
    }
    AJS.$.when.apply(AJS.$, toUpdate)
      .then(function () {
        //notify the backend that the configuration has changed
        AJS.$.ajax({
          type: 'GET',
          dataType: 'json',
          url: 'project-config-updated?project=' + projectKey,
          beforeSend: function (request) {
            request.setRequestHeader('Authorization', 'JWT ' + pageContext.jwt);
          }
        });

        AP.require('messages', function (messages) {
            messages.success('Settings Updated', 'Your settings were saved.', {
              fadeout: true,
              delay: 2000
            });
          },
          function () {
            console.warn(arguments);
            AP.require('messages', function (messages) {
              messages.error('Error while Saving', 'There was an error saving your settings.', {
                fadeout: true,
                delay: 5000
              });
            });
          });
      });
    return false;
  });
})
;