
(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .service("spa-demo.subjects.TagThing", TagThing);

  function TagThing() {
    var service = this;
    service.images = null;
    service.getImages = getImages;
    service.setImages = setImages;
    return;

    function getImages(){
      return service.images;
    }

    function setImages(images){
      service.images = images;
    }
  }
})();