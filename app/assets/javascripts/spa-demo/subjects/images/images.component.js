(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdImageSelector", {
      templateUrl: imageSelectorTemplateUrl,
      controller: ImageSelectorController,
      bindings: {
        authz: "<"
      },
    })
    .component("sdImageEditor", {
      templateUrl: imageEditorTemplateUrl,
      controller: ImageEditorController,
      bindings: {
        authz: "<"
      },
      require: {
        imagesAuthz: "^sdImagesAuthz"
      }
    });


  imageSelectorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function imageSelectorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.image_selector_html;
  }    
  imageEditorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function imageEditorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.image_editor_html;
  }    

  ImageSelectorController.$inject = ["$scope",
                                     "$stateParams",
                                     "spa-demo.authz.Authz",
                                     "spa-demo.subjects.Image","spa-demo.geoloc.currentOrigin"];
  function ImageSelectorController($scope, $stateParams, Authz, Image, currentOrigin) {
var vm=this;
    vm.getOrigin = getOrigin;
    vm.getOriginAddress = getOriginAddress;
    vm.getDistance = getDistance;
    vm.selectAll = selectAll;
    vm.deselectAll = deselectAll;
    vm.filter = filter;
    vm.showAll = showAll;

    vm.$onInit = function() {
      console.log("ImageSelectorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); },
                    loadItems );
      $scope.$watch(function(){ return currentOrigin.getLocation(); },
                    loadItems );
      $scope.$watch(function(){ return currentOrigin.getDistance(); },
                    loadItems );
    }
    return;
    //////////////

    function loadItems() {
      var queryParams = {};
      loadItemsWithParams(queryParams);
    }

    function loadItemsSelected(selectedImages) {
      if(selectedImages.length==0) {
        vm.items = [];
      }
      else {
        var queryParams = {};
        queryParams["exclude[]"] = selectedImages;
        loadItemsWithParams(queryParams);
      }
    }

    function loadItemsWithParams(queryParams) {
      if (!$stateParams.id) {
        if(getOrigin()) {
          queryParams["lng"] = currentOrigin.getPosition().lng.toString();
          queryParams["lat"] = currentOrigin.getPosition().lat.toString();
          if(getDistance()) {
            queryParams["limit"] = currentOrigin.getDistance().toString();
          }
        }
        console.log(queryParams);
        vm.items = Image.query(queryParams);
      }
    }

    function getOrigin() {
      return currentOrigin.getLocation();
    }

    function getOriginAddress() {
      return currentOrigin.getFormattedAddress();
    }

    function getDistance() {
      return currentOrigin.getDistance();
    }

    function selectAll() {
      for (var i=0; vm.items && i<vm.items.length; i++) {
        vm.items[i].selected = true;
      }
    }

    function deselectAll() {
      for (var i=0; vm.items && i<vm.items.length; i++) {
        vm.items[i].selected = false;
      }
    }

    function filter() {
      var selectedImages = [];
      for (var i=0; vm.items && i<vm.items.length; i++) {
        if(vm.items[i].selected) {
          selectedImages.push(vm.items[i].id);
        }
      }
      loadItemsSelected(selectedImages);
    }

    function showAll() {
      loadItems();
    }
  }


  ImageEditorController.$inject = ["$scope","$q",
                                   "$state", "$stateParams",
                                   "spa-demo.authz.Authz",
                                   "spa-demo.layout.DataUtils",
                                   "spa-demo.subjects.Image",
                                   "spa-demo.subjects.ImageThing",
                                   "spa-demo.subjects.ImageLinkableThing",
                                   "spa-demo.geoloc.geocoder",
                                   ];
  function ImageEditorController($scope, $q, $state, $stateParams, 
                                 Authz, DataUtils, Image, ImageThing,ImageLinkableThing,
                                 geocoder) {
    var vm=this;
    vm.selected_linkables=[];
    vm.create = create;
    vm.clear  = clear;
    vm.update  = update;
    vm.remove  = remove;
    vm.linkThings = linkThings;
    vm.setImageContent = setImageContent;
    vm.locationByAddress = locationByAddress;

    vm.$onInit = function() {
      console.log("ImageEditorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if ($stateParams.id) {
                        reload($stateParams.id);
                      } else {
                        newResource();
                      }
                    });
    }
    return;
    //////////////
    function newResource() {
      console.log("newResource()");
      vm.item = new Image();
      vm.imagesAuthz.newItem(vm.item);
      return vm.item;
    }

    function reload(imageId) {
      var itemId = imageId ? imageId : vm.item.id;
      console.log("re/loading image", itemId);
      vm.item = Image.get({id:itemId});
      vm.things = ImageThing.query({image_id:itemId});
      vm.linkable_things = ImageLinkableThing.query({image_id:itemId});
      vm.imagesAuthz.newItem(vm.item);
      $q.all([vm.item.$promise,
              vm.things.$promise]).catch(handleError);
      vm.item.$promise.then(function(image) {
        vm.location=geocoder.getLocationByPosition(image.position);
      });
    }

    function clear() {
      if (!vm.item.id) {
        $state.reload();
      } else {
        $state.go(".", {id:null});
      }
    }

    function setImageContent(dataUri) {
      console.log("setImageContent", dataUri ? dataUri.length : null);      
      vm.item.image_content = DataUtils.getContentFromDataUri(dataUri);
    }    

    function create() {
      vm.item.$save().then(
        function(){
           $state.go(".", {id: vm.item.id}); 
        },
        handleError);
    }

    function update() {
      vm.item.errors = null;
      var update=vm.item.$update();
      linkThings(update);
    }

    function linkThings(parentPromise) {
      var promises=[];
      if (parentPromise) { promises.push(parentPromise); }
      angular.forEach(vm.selected_linkables, function(linkable){
        var resource=ImageThing.save({image_id:vm.item.id}, {thing_id:linkable});
        promises.push(resource.$promise);
      });

      vm.selected_linkables=[];
      console.log("waiting for promises", promises);
      $q.all(promises).then(
        function(response){
          console.log("promise.all response", response); 
          $scope.imageform.$setPristine();
          reload(); 
        },
        handleError);    
    }

    function remove() {
      vm.item.errors = null;
      vm.item.$delete().then(
        function(){ 
          console.log("remove complete", vm.item);          
          clear();
        },
        handleError);      
    }

    function locationByAddress(address) {
      console.log("locationByAddress for", address);
      geocoder.getLocationByAddress(address).$promise.then(
        function(location){
          vm.location = location;
          vm.item.position = location.position;
          console.log("location", vm.location);
        });
    }

    function handleError(response) {
      console.log("error", response);
      if (response.data) {
        vm.item["errors"]=response.data.errors;          
      } 
      if (!vm.item.errors) {
        vm.item["errors"]={}
        vm.item["errors"]["full_messages"]=[response]; 
      }      
      $scope.imageform.$setPristine();
    }    
  }

})();
