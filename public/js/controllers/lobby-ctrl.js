/*global angular:false*/
'use strict';

angular.module('gameApp').controller('LobbyCtrl',
    function ($scope, socket, sharedModel, $routeParams) {

  /**
   * Define handlers
   */

  var onUpdateLobby = function (message) {
    $scope.lobby = message;
  };


  /**
   * Bind handlers to events
   */

  socket.on('update:lobby', onUpdateLobby);


  /**
   * Unbind events when out of this scope
   */

  $scope.$on('$destroy', function () {
    socket.off('update:lobby', onUpdateLobby);
  });


  /**
   * Expose other fns to $scope
   */

  $scope.start = function () {
    socket.emit('start:game');
  };


  /**
   * Alert the server that we joined this lobby
   * Ask for the info for this lobby
   */

  socket.emit('join:lobby', {
    id: $routeParams.id
  });
  socket.emit('get:lobby');

});
