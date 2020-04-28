(function() {
  "use strict";

  angular
    .module("assg.cities")
    .directive("sdCities", CitiesDirective);

  CitiesDirective.$inject = ["assg.APP_CONFIG"];

  function CitiesDirective(APP_CONFIG) {
    var directive = {
        templateUrl: APP_CONFIG.cities_html,
        replace: true,
        bindToController: true,
        controller: "assg.cities.CitiesController",
        controllerAs: "citiesVM",
        restrict: "E",
        scope: {},
        link: link
    };
    return directive;

    function link(scope, element, attrs) {
    }
  }

})();