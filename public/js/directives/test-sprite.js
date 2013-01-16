/*global angular:false*/

angular.module('gameApp').directive('testSprite',
    function ($window) {

  return {
    template: '<canvas></canvas>',
    restrict: 'E',
    scope: {
      sprite: '=',
      action: '='
    },
    link: function (scope, elm, attrs) {
      var canvas = elm.find('canvas')[0];
      var context = canvas.getContext('2d');
      
      var frameProgress = 1;
      var frame = 0;
      var action = 0;

      var imageObj = new Image();

      scope.$watch('sprite.img', function (dataURL) {
        imageObj.src = dataURL;
      });

      scope.$watch('action', function (newAction) {
        action = parseInt(newAction, 10) || 0;
        scope.action = action.toString();
      });

      var render = function () {
        // clear the canvas
        canvas.width = scope.sprite.width;
        canvas.height = scope.sprite.height;

        if (frameProgress === 0) {
          frame = (frame + 1) % scope.sprite.animations[action].frames;
        }
        frameProgress = (frameProgress + 1) % (scope.sprite.animations[action].duration || 1);

        context.drawImage(imageObj,
          frame*scope.sprite.width, action*scope.sprite.height,
          scope.sprite.width, scope.sprite.height,
          0, 0,
          scope.sprite.width, scope.sprite.height);

        // get rendering context

        $window.requestAnimationFrame(render);
      };
      $window.requestAnimationFrame(render);
      
    }
  };
});
