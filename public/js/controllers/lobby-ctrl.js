/*global angular:false*/
'use strict';

angular.module('gameApp').controller('LobbyCtrl',
    function ($scope, socket, shared, remoteRouter, $routeParams) {

  socket.emit('join:lobby', {
    id: $routeParams.id
  });
  
  socket.emit('get:lobby');
  
  $scope.start = function () {
    socket.emit('start:game');
  };

  socket.on('update:lobby', function (message) {
    $scope.lobby = message;
  });

  shared.init();
});
