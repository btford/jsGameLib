/*global angular:false*/
'use strict';

angular.module('gameApp').controller('TestSpriteCtrl', function ($scope, $http) {
  $http.get('/json/sprites.json').success(function (data) {
    $scope.sprites = data;
  });
});
