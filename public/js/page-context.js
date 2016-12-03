define([], function () {
  var projectRegexp = /project=([A-Z0-9]*)&/

  function loadPageContext() {
    var uri = window.location.href;
    var pageContext = {
      project: projectRegexp.exec(uri)[1],
      jwt: AJS.$("meta[name='token']").attr('content')
    };
    return pageContext;
  }

  return {
    load: loadPageContext
  };
});