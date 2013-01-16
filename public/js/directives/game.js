/*global angular:false*/

angular.module('gameApp').directive('game',
    function ($window, renderGame, fullscreen, gameController, sharedModel) {

  var canvasWidth = 1000,
    canvasHeight = 600;

  return {
    templateUrl: '/directives/game',
    restrict: 'E',
    link: function (scope, elm, attrs) {
      var canvas = elm.find('canvas')[0];

      var mapCanvas = elm.find('canvas')[1];

      var context = canvas.getContext('2d');
      var map;

      var tileWidth = 64;
      var tileHeight = 32;

      mapCanvas.width = 100*tileWidth;
      mapCanvas.height = 100*tileHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      scope.$watch(function () {
        return fullscreen.get();
      }, function (fullscreenSetting) {
        if (fullscreenSetting) {
           canvas.width = $window.document.width;
           canvas.height = $window.document.height;
        } else {
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
        }
      });

      angular.element(canvas).bind('click', function (ev) {
        // on click ...
      });
      
      var render = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);
        renderGame(canvas, map);

        // send keystrokes

        if (controller) {
          socket.getRaw().emit('controls', controller);
        }

        $window.requestAnimationFrame(render);
      };

      // stop rendering when out of scope

      scope.$on('$destroy', function () {
        render = function () {};
      });
    }
  };
});
