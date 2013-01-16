/*global angular:false*/
'use strict';

angular.module('gameApp').controller('AppCtrl',
    function ($scope, $location, fullscreen, dataLoader, imageLoader, remoteRouter) {

  /**
   * When first loaded, take the player to a loading screen
   * After loading, re-route the player to their original destination
   */

  var originalTarget = $location.url();
  if (originalTarget === '/loading') {
    originalTarget = '/';
  }
  $location.url('/loading');

  dataLoader.preLoad().ready(function () {
    imageLoader.preLoad().ready(function () {
      $location.url(originalTarget);
    });
  });


  /**
   * Expose other fns to $scope
   */

  $scope.toggleFullscreen = function () {
    fullscreen.toggle();
  };

});
