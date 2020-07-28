(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdTags", {
      templateUrl: tagsTemplateUrl,
      controller: TagsController
    })
    .component("sdTagsMap", {
      template: "<div class='tags-map col-xs-10' id='map'></div>",
      controller: TagsMapController,
      bindings: {
        zoom: "@"
      }
    });

  tagsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];

  function tagsTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.tags_html;
  }

  TagsController.$inject = ['$scope',
                              "spa-demo.subjects.Tag",
                              "spa-demo.subjects.Thing",
                              "spa-demo.subjects.ThingSearch",
                              "spa-demo.subjects.TagThing",
                              "spa-demo.subjects.ThingImage"];
                              
  function TagsController($scope, Tag, Thing, ThingSearch, TagThing, ThingImage) {
    var vm = this;
    vm.tags = [];
    vm.things = [];
    vm.thingId = null;
    vm.thingClicked = thingClicked;
    vm.tagClicked = tagClicked;
    vm.isCurrentThing = isCurrentThing;

    load();
    return;

    function load(){
      Tag.query().$promise
        .then(function(response){
          vm.tags = response;
        });
    }

    function tagClicked(tag){

      angular.forEach(vm.tags, function(tag){
        tag.selected=false;
      });
      
      tag.selected=true;

      ThingSearch.query({tag_id:tag.id}).$promise
        .then(function(things){
          vm.things = things;
        });
    }

    function thingClicked(id){
      vm.thingId = id;
      ThingImage.query({thing_id:id}).$promise
        .then(function(images){
          TagThing.setImages(images);
        });
      }

      function isCurrentThing(id){
        return vm.thingId == id;
      }

    }


  TagsMapController.$inject = ["$scope",
                                  "$q",
                                  "$element",
                                  "spa-demo.geoloc.currentOrigin",
                                  "spa-demo.geoloc.myLocation",
                                  "spa-demo.geoloc.Map",
                                  "spa-demo.subjects.currentSubjects",
                                  "spa-demo.config.APP_CONFIG",
                                  "spa-demo.subjects.TagThing"];
  function TagsMapController($scope, $q, $element,
                            currentOrigin, myLocation, Map, 
                            currentSubjects, APP_CONFIG, TagThing) {
    var vm=this;

    vm.$postLink = function() {
      var element = $element.find('div')[0];
      getLocation().then(
        function(location){
          vm.location = location;
          initializeMap(element, location.position);
        });

      $scope.$watch(
        function(){ return TagThing.getImages(); },
        function(images) {
          if (images === null) {
            return;
          }
          
          vm.images = images;
          displayImages();
        });

      $scope.$watch(
        function() { return currentOrigin.getLocation(); },
        function(location) { 
          vm.location = location;
          vm.updateOrigin(); 
        });  
    }


    return;
    //////////////
    function getLocation() {
      var deferred = $q.defer();
      //use current address if set
      var location = currentOrigin.getLocation();
      if (!location) {
        //try my location next
        myLocation.getCurrentLocation().then(
          function(location){
            deferred.resolve(location);
          },
          function(){
            deferred.resolve({ position: APP_CONFIG.default_position});
          });
      } else {
        deferred.resolve(location);
      }

      return deferred.promise;
    }


    function initializeMap(element, position) {
      vm.map = new Map(element, {
        center: position,
        zoom: vm.zoom || 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      vm.map.clearMarkers();
    }


    function displayImages(){
      if (!vm.map) { return; }
      vm.lat=null;
      vm.lng=null;
      vm.a=360.0 / vm.images.length

      vm.map.clearMarkers();
      vm.map.displayOriginMarker(vm.originInfoWindow(vm.location));
    
      angular.forEach(vm.images, function(image,i){
        displayImage(image,i);
      });
    }


    function displayImage(ti,i) {
      console.log("ti",ti)
     var markerOptions = {
        position: {
          lng: ti.position.lng,
          lat: ti.position.lat
        },
        thing_id: ti.thing_id,
        image_id: ti.image_id          
      };

      if(vm.lat==ti.position.lat&&vm.lng==ti.position.lng){ 
        markerOptions.position.lng=ti.position.lng + -.00004 * Math.cos((+vm.a*i) / 180 * Math.PI);
        markerOptions.position.lat=ti.position.lat + -.00004 * Math.sin((+vm.a*i) / 180 * Math.PI);
      }

      if (ti.thing_id && ti.priority===0) {
        markerOptions.title = ti.thing_name;
        markerOptions.icon = APP_CONFIG.thing_marker;
        markerOptions.content = vm.imageInfoWindow(ti);
        vm.lng=ti.position.lng;
        vm.lat=ti.position.lat;
      } else {
        markerOptions.title = ti.thing_name;
        markerOptions.icon = APP_CONFIG.secondary_marker;
        markerOptions.content = vm.imageInfoWindow(ti);
      } 

      vm.map.displayMarker(markerOptions);    
    }
  }


  TagsMapController.prototype.updateOrigin = function() {
    if (this.map && this.location) {
      this.map.center({
        center: this.location.position
      });
      this.map.displayOriginMarker(this.originInfoWindow(this.location));
    }
  }


  TagsMapController.prototype.originInfoWindow = function(location) {
    console.log("originInfo", location);
    var full_address = location ? location.formatted_address : "";
    var lng = location && location.position ? location.position.lng : "";
    var lat = location && location.position ? location.position.lat : "";
    var html = [
      "<div class='origin'>",
        "<div class='full_address'>"+ full_address + "</div>",
        "<div class='position'>",
          "lng: <span class='lng'>"+ lng +"</span>",
          "lat: <span class='lat'>"+ lat +"</span>",
        "</div>",
      "</div>",
    ].join("\n");

    return html;
  }


  TagsMapController.prototype.imageInfoWindow = function(image) {
    console.log("imageInfo", image);
    var html ="<div class='image-marker-info'><div>";
      html += "<span class='id image_id'>"+ image.image_id+"</span>";
      if (image.image_caption) {
        html += "<span class='image-caption'>"+ image.image_caption + "</span>";
      }
      html += "</div><img src='"+ image.image_content_url+"?width=150'>";
      html += "</div>";
    return html;
  }


})();