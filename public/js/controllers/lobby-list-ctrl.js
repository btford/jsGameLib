/*global angular:false*/
'use strict';

angular.module('gameApp').controller('LobbyListCtrl', function ($scope, socket) {

  /**
   * Define event handlers
   */

  var onUpdateLobbies = function (message) {
    $scope.lobbies = message;
  };


  /**
   * Bind handlers to events
   */

  socket.on('update:lobbies', onUpdateLobbies);


  /**
   * Unbind events when out of this scope
   */

  $scope.$on('$destroy', function () {
    socket.off('update:lobbies', onUpdateLobbies);
  });


  /**
   * Expose other fns to $scope
   */

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


  /**
   * Alert server that we've left our lobby
   * and ask for the list of lobbies
   */

  socket.emit('leave:lobby');
  socket.emit('get:lobbies');

});
