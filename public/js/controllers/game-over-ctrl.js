/*global angular:false*/
'use strict';

angular.module('gameApp').controller('GameOverCtrl',
    function ($scope, socket, sharedModel) {

  $scope.players = [];

  sharedModel.get().players.forEach(function (player, index) {
    $scope.players.push({
      name: 'Player ' + (index + 1),
      notoriety: player.notoriety + 500*(!!player.ship.treasure)
    });
  });

  $scope.players.sort(function (a, b) {
    if (a.notoriety > b.notoriety) {
      return -1;
    }
    return 1;
  });

});
