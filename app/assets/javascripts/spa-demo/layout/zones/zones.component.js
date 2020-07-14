(function() {
  "use strict";

  angular
    .module("spa-demo.layout")
    .component("sdZones", {
      templateUrl: zonesTemplateUrl,
      controller: ZonesController,
      transclude: true,
      //bindings: {},
    })
    .component("sdZone", {
      templateUrl: zoneTemplateUrl,
      controller: ZoneController,
      transclude: true,
      bindings: {
        label: "@",
        position: "@"        
      },
      require: {
        zonesController: "^^sdZones"
      }
    })
    .directive("sdZonesSide", [function(){
      return {
        controller: ZonesSideController,
        controllerAs: "sideVM",
        bindToController: true,
        restrict: "A",
        scope: false,
        require: {
          zones: "^sdZones"
        }
      }
    }])
    ;

  zonesTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function zonesTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.zones_html;
  }    
  zoneTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function zoneTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.zone_html;
  }    

  ZonesController.$inject = ["$scope","spa-demo.subjects.topics"];
  function ZonesController($scope,topics) {
    var vm=this;
    vm.zones=[];
    vm.zonesLeft = [];
    vm.zonesRight = [];

    return;
 
    //////////////
  }
  ZonesController.prototype.addZone = function(zone) {
    this.zones.push(zone);
    if (zone.position==="left") {
      this.zonesLeft.push(zone);
    } else if (zone.position==="right") {
      this.zonesRight.push(zone);
    }
  }  
  ZonesController.prototype.getZones = function(position) {
    var collection = null;
    if (position==="left") {
      collection=this.zonesLeft;
    } else if (position==="right") {
      collection=this.zonesRight;
    }
    return collection;
  }  
  ZonesController.prototype.countActive = function(position) {
    var collection = this.getZones(position);
    var zonesActive=0;
    angular.forEach(collection, function(zone){
      if (zone.show) { zonesActive += 1; }
    })
    //console.log("countActive", collection, zonesActive);
    return zonesActive;
  }

  ZonesController.prototype.show = function(position) {
    var collection = this.getZones(position);
    for (var i = 0; i < collection.length; i++) {
      collection[i].show = true;
    }
  }


  ZoneController.$inject = ["$scope"];
  function ZoneController($scope) {
    var vm=this;
    vm.show=true;
    vm.isExpanded = isExpanded;

    vm.$onInit = function() {
      if(vm.position==="right"){
        vm.show=false;
      }
      vm.zonesController.addZone(vm);
    }
    return;
    //////////////
    function isExpanded() {
      var result = vm.show && vm.zonesController.countActive(vm.position)===1;
      //console.log("isExpanded", vm.position, result);
      return result;
    }
  }


  ZonesSideController.$inject = [];
  function ZonesSideController() { 
    var vm = this;
    vm.isHidden = isHidden;

    return;
    /////////////////
    function isHidden(position) {
      var result=vm.zones.countActive(position)===0;  
      //console.log("isHidden", position, result);
      return result;
    }
  }

})();
