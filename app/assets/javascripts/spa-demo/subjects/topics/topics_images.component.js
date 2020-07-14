(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdTopicsImages", {
      templateUrl: imagesTemplateUrl,
      controller: TopicsImagesController,
    });

  imagesTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function imagesTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.topics_images_html;
  }      

  TopicsImagesController.$inject = ["$scope",
                                     "spa-demo.subjects.topics"];
  function TopicsImagesController($scope, topics) {
    var vm=this;
    vm.imageClicked = imageClicked;
    vm.isCurrentImage = topics.isCurrentImageId;
    

    vm.$postLink = function() {
      $scope.$watch(
        function() { return topics.getImages(); }, 
        function(images) { vm.images = images; }
      );
    }  
      
    return;
    //////////////
    function imageClicked(index) {
      topics.setCurrentImage(index);
      $scope.$parent.$parent.$parent.$ctrl.zonesController.show("right");
    }
  }

})();
