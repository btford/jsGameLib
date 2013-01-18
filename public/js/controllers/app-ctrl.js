/*global angular:false*/
'use strict';

angular.module('gameApp').controller('AppCtrl',
    function ($scope, $location, fullscreen, dataLoader, imageLoader, remoteRouter) {

  // TODO
  // var originalTarget = $location.url();
  $location.url('/loading');

  dataLoader.preLoad().ready(function () {
    imageLoader.preLoad().ready(function () {
      // TODO
      // $location.url(originalTarget);
      $location.url('/');
    });
  });

  $scope.toggleFullscreen = function () {
    fullscreen.toggle();
  };
});
