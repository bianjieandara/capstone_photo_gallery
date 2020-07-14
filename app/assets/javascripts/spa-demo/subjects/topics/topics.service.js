(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .service("spa-demo.subjects.topics", Topics);

  Topics.$inject = ["$rootScope","$q",
                             "$resource",
                             "spa-demo.config.APP_CONFIG"];

  function Topics($rootScope, $q, $resource, APP_CONFIG) {
    var subjectsResource = $resource(APP_CONFIG.server_url + "/api/subjects",{},{
      query: { cache:false, isArray:true }
    });

     var thingsResource = $resource(APP_CONFIG.server_url + "/api/images/:image_id/thing_images",
      { image_id: '@image_id' },
      {}
    );
    var service = this;
    service.images = [];
    service.imageIdx = null;
    service.things = [];
    service.thingIdx = null;
    service.params = {};
    service.isCurrentImageId = isCurrentImageId;

    //refresh();
    refreshImages();

    
      $rootScope.$watch(
        function() { return service.imageIdx; },
        function(i) { refreshThings(i); }
      );        
       
    return;
    ////////////////

  function refreshImages() {
      var result=subjectsResource.query(angular.copy(APP_CONFIG.default_position));
      result.$promise.then(
        function(images){
          var unique = [];
          for (var i=0; i<images.length; i++) {
            var image = images[i];
            if(unique.indexOf(image["image_id"]) == -1) {
              unique.push(image["image_id"]);
              service.images.push(image);
            }
          }
          console.log("refreshImages", service);
        });
      return result.$promise;
    }
    function refreshThings(index) {
      if(index!=null){
      service.params["image_id"] = index;
      var result=thingsResource.query(service.params);
      result.$promise.then(
        function(things){
          service.things=things;
          service.thingIdx=0;
        });
      return result.$promise;
      }
    }

    function isCurrentImageId(imageId) {
      return service.imageIdx === imageId;
    }
   
  }

  Topics.prototype.getImages = function() {
    return this.images;
  }
  Topics.prototype.getThings = function() {
    return this.things;
  }
  Topics.prototype.getCurrentImageId = function() {
     return this.imageIdx;
  }
  Topics.prototype.getCurrentThingId = function() {
    return this.thingIdx;
  }

  Topics.prototype.setCurrentImage = function(index) {
    this.imageIdx = index;
  }

  Topics.prototype.setCurrentThing = function(index) {
    this.thingIdx = index;
  }


  })();
