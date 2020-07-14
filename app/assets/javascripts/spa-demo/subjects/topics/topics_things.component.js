(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdTopicsThings", {
      templateUrl: thingsTemplateUrl,
      controller: TopicsThingsController,
    })
    .component("sdTopicsThingInfo", {
      templateUrl: thingInfoTemplateUrl,
      controller: TopicsThingInfoController,
    })
    ;

  thingsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.topics_things_html;
  }    
  thingInfoTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingInfoTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.topics_thing_info_html;
  }    

  TopicsThingsController.$inject = ["$scope",
                                     "spa-demo.subjects.topics"];
  function TopicsThingsController($scope,topics) {
    var vm=this;
    vm.thingClicked = thingClicked;
    vm.isCurrentThing = topics.isCurrentThingIndex;

    vm.$postLink = function() {
      $scope.$watch(
        function() { return topics.getThings(); }, 
        function(i) { setThings(i); }
      );
    }    
    return;
    //////////////
    function setThings(things){
    vm.things = things;
      if(things.$promise){
      vm.things.$promise.then(
          function(things){
               $scope.$parent.$parent.$ctrl.show = (things.length > 0);

          }
        )
      }
    }
    function thingClicked(index) {
      topics.setCurrentThing(index);
    }    
  }

  TopicsThingInfoController.$inject = ["$scope",
                                        "spa-demo.subjects.topics",
                                        "spa-demo.subjects.Thing",
                                        "spa-demo.subjects.ThingImage"];
  function TopicsThingInfoController($scope,topics, Thing, ThingImage) {
    var vm=this;
    vm.nextThing = topics.nextThing;
    vm.previousThing = topics.previousThing;
    vm.thing_image = null;
    vm.showImage=true;

    vm.$onInit = function() {
      console.log("CurrentThingInfoController",$scope);
    }
    vm.$postLink = function() {
    $scope.$watch(
        function() { return topics.getCurrentThingId(); }, 
        function(i) { newThing(i); }
    ); 
    $scope.$watch(
        function() { return topics.getCurrentImageId(); }, 
        function() { clean(); }
    ); 
    }      
    return;
    //////////////

    function clean() {
     vm.showImage = false;
     console.log("clean",vm.showImage);
    }
    function newThing(id) {
      vm.thing_image = null; 
      vm.thing = null;
      if (id) {
        vm.thing=Thing.get({id:id});
        vm.images = ThingImage.query({thing_id:id});
        vm.images.$promise.then(
        function(){
          angular.forEach(vm.images, function(ti){
            if (ti.priority===0){
              vm.showImage = true;
              vm.thing_image = ti;
            }
          });                     
        });
      }
    }
  }
})();