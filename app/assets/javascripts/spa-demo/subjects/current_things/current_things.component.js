(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdCurrentThings", {
      templateUrl: thingsTemplateUrl,
      controller: ThingsController,
    })
    .component("sdCurrentThingInfo", {
      templateUrl: thingInfoTemplateUrl,
      controller: ThingInfoController,
    })
    ;

  thingsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_things_html;
  }    
  thingInfoTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingInfoTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.current_thing_info_html;
  }    

  ThingsController.$inject = ["$scope",
                                     "spa-demo.subjects.currentSubjects"];
  function ThingsController($scope,currentSubjects) {
    var vm=this;
    vm.thingClicked = thingClicked;
    vm.isCurrentThing = currentSubjects.isCurrentThingIndex;

    vm.$onInit = function() {
      console.log("CurrentThingsController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentSubjects.getThings(); }, 
        function(things) { vm.things = things; }
      );
    }    
    return;
    //////////////
    function thingClicked(index) {
      currentSubjects.setCurrentThing(index);
    }    
  }

  ThingInfoController.$inject = ["$scope",
                                        "spa-demo.subjects.currentSubjects",
                                        "spa-demo.subjects.Thing",
                                        "spa-demo.authz.Authz"];
  function ThingInfoController($scope,currentSubjects, Thing, Authz) {
    var vm=this;
    vm.nextThing = currentSubjects.nextThing;
    vm.previousThing = currentSubjects.previousThing;

    vm.$onInit = function() {
      console.log("CurrentThingInfoController",$scope);
    }
    vm.$postLink = function() {
      $scope.$watch(
        function() { return currentSubjects.getCurrentThing(); }, 
        newThing 
      );      
    }    
    return;
    //////////////
    function newThing(link) {
      vm.link = link; 
      vm.thing = null;
      if (link && link.thing_id) {
        vm.thing=Thing.get({id:link.thing_id});
      }
    }

  }
})();
