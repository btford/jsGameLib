/*global angular:false*/
'use strict';

angular.module('gameApp').controller('LobbyListCtrl', function ($scope, socket) {

  socket.emit('leave:lobby');
  socket.emit('get:lobbies');

  socket.on('update:lobbies', function (message) {
    $scope.lobbies = message;
  });

  $scope.newLobby = function () {
    socket.emit('create:lobby', {
      name: $scope.newLobbyName
    });
  };

  $scope.joinLobby = function (id) {
    socket.emit('join:lobby', {
      id: id
    });
  };

});
