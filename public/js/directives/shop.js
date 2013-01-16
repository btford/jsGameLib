/*global angular:false*/

angular.module('gameApp').directive('shop',
    function ($window, sharedModel, $rootScope) {

  return {
    templateUrl: '/directives/shop',
    restrict: 'E',
    scope:{
      'active': '='
    },
    link: function (scope, elm, attrs) {

      elm.addClass('hidden');

      scope.$watch('active', function (val) {
        if (val) {
          elm.removeClass('hidden');
        } else {
          elm.addClass('hidden');
        }
      });
    },
    controller: function ($scope, socket, dataLoader) {
      $scope.buy = function (type) {
        socket.emit('buy:upgrade', type);
        setTimeout(function () {
          $scope.$apply();
        }, 100);
      };

      $scope.upgrades = [];
      angular.forEach(dataLoader.get('/json/stats.json'), function (value, key) {
        if (key === 'ship') {
          return;
        }
        var upgrade = value;
        upgrade.name = key;
        $scope.upgrades.push(upgrade);
      });

      // determines which upgrades a player can do
      $scope.disabled = function (upgrade) {
        var shipType = sharedModel.getMe().ship.type;
        // no upgrade.names after final

        if (upgrade.cost > sharedModel.getMe().notoriety) {
          return true;
        }
        if (shipType.substr(-5) === 'Final') {
          return true;
        }
        if (upgrade.name.substr(-5) === 'Final') {
          return shipType + 'Final' !== upgrade.name;
        } else if (shipType !== 'ship') {
          return true;
        }

        return false;
      };

    }
  };
});
