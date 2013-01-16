// todo: pooling

angular.module('gameApp').directive('gameOver',
    function ($window, renderGame, gameController, shared, socket, $http, MapRenderer) {

  var canvasWidth = 1000,
    canvasHeight = 600;

  return {
    template: '<canvas width="' + canvasWidth + '" height="' + canvasHeight + '"></canvas>',
    restrict: 'E',
    link: function (scope, elm, attrs) {
      var canvas = elm.find('canvas')[0];
      var context = canvas.getContext('2d');
      var map;

      var tileWidth = 64;
      var tileHeight = 32;

      var dist = function (x1, y1, x2, y2) {
        return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
      };

      angular.element(canvas).bind('click', function (ev) {

        var centerPlayer = shared.get().players[0];

        // convert from isometric to orthogonal

        // Take into account the offset on the X axis caused
        // by centering the grid horizontally
        var gridOffsetY = (canvas.height / 2) - (tileHeight / 2);
        var gridOffsetX = (canvas.width / 2) - (tileWidth / 2);

        //Using these two variables, we can start translating the coordinates for the column:
        var col = (ev.layerY - gridOffsetY) * 2;
        col = ((gridOffsetX + col) - ev.layerX) / 2;
        //And having the column, we can do the same for the rows:
        var row = ((ev.layerX + col) - tileHeight) - gridOffsetX;
        //We finally finish by dividing both results by the tile height and rounding the result:
        row = row / tileHeight + centerPlayer.ship.x;
        col = col / tileHeight + centerPlayer.ship.y;

        var selected = null;

        shared.get().players.forEach(function (player, index) {
          if (player === shared.get().players[0]) {
            return;
          } else if (dist(row, col, player.ship.x, player.ship.y) < 1) {
            selected = index;
          }
        });

        socket.getRaw().emit('lockon:ship', selected);
      });
      
      var render = function () {
        //context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgb(128, 128, 128)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        map.render(canvas);
        renderGame(canvas);

        // send the data to the server without causing a digest.
        // todo: only send if dirty
        var controller = gameController.get();
        if (controller) {
          socket.getRaw().emit('controls', controller);
        }
        $window.requestAnimationFrame(render);
      };

      $http.get('/json/map.json')
        .success(function (data) {
          map = new MapRenderer(data);
          $window.requestAnimationFrame(render);
        });

      scope.$on('$destroy', function () {
        render = function () {};
        shared.tearDown();
      });
    }
  };
});
