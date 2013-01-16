/*global angular:false*/
'use strict';

angular.module('gameApp').controller('AppCtrl', function ($scope, $location, fullscreen, dataLoader, imageLoader) {

  $location.url('/loading');

  dataLoader.preLoad().ready(function () {
    imageLoader.preLoad().ready(function () {
      $location.url('/');
    });
  });

  $scope.toggleFullscreen = function () {
    fullscreen.toggle();
  };
});
