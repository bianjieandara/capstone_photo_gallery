(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .factory("spa-demo.subjects.ThingSearch", ThingSearch);

  ThingSearch.$inject = ["$resource", "spa-demo.config.APP_CONFIG"];
  function ThingSearch($resource, APP_CONFIG) {
    return $resource(APP_CONFIG.server_url + "/api/things/search");
  }

})();