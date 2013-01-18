/*global angular:false*/

angular.module('gameApp').directive('game',
    function ($window, renderGame, fullscreen, gameController, shared, socket, $http, MapRenderer) {

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

      var dist = function (x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
      };

      angular.element(canvas).bind('click', function (ev) {

        var centerPlayer = shared.getMe();

        // convert from isometric to orthogonal
        var vx = (canvas.width/2 - ev.layerX) / tileWidth,
          vy = (canvas.height/2 - ev.layerY) / tileHeight;

        var x = -(vy + vx) + centerPlayer.ship.x,
          y = -(vy - vx) + centerPlayer.ship.y;

        shared.get().players.forEach(function (player, index) {
          if (player === shared.getMe()) {
            return;
          } else if (dist(x, y, player.ship.x, player.ship.y) < 1) {
            socket.getRaw().emit('lockon:ship', index);
          }
        });

        shared.get().towns.forEach(function (town, index) {
          if (town === shared.getMe()) {
            return;
          } else if (dist(x, y, town.x, town.y) < 1) {
            socket.getRaw().emit('pillage:town', index);
          }
        });

      });
      
      var render = function () {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // TODO: move map canvas left and top
        var scrollX = 0,
          scrollY = 0;
        if (shared.get().players) {
          var centerPlayer = shared.getMe();
          scrollX = tileWidth*(centerPlayer.ship.y - centerPlayer.ship.x)/2 - tileWidth/2 - mapCanvas.width/2 + canvas.width/2;
          scrollY = canvas.height/2 - tileHeight*(centerPlayer.ship.y + centerPlayer.ship.x)/2 - tileHeight/2;
          mapCanvas.style.left = Math.round(scrollX) + 'px';
          mapCanvas.style.top = Math.round(scrollY) + 'px';
        }

        renderGame(canvas, map);
        
        // send the data to the server without causing a digest.
        // todo: only send if dirty
        var controller = gameController.get();
        if (controller) {
          socket.getRaw().emit('controls', controller);
        }
        $window.requestAnimationFrame(render);
      };

      $http.get('/json/map-v0.1.0.json')
        .success(function (data) {
          map = new MapRenderer(data);
          map.render(mapCanvas);
          $window.requestAnimationFrame(render);
        });

      scope.$on('$destroy', function () {
        render = function () {};
      });
    }
  };
});
