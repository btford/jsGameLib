/* module implementing rendering the game state to a canvas */
/*global angular:false*/

'use strict';

// draws a sprite on the isometric grid
angular.module('gameApp').factory('spriteRenderer', function ($http, dataLoader, imageLoader) {

  // load and cache all sprites
  var spriteData = dataLoader.get('/json/sprites.json');
  angular.forEach(spriteData, function (sprite) {
    sprite.imageObj = imageLoader.get(sprite.img);
    sprite.scaleWidth = sprite.scaleWidth || sprite.width;
    sprite.scaleHeight = sprite.scaleHeight || sprite.height;
  });

  return {
    render: function (spriteName, positionObj, action, frame, canvas, scrollX, scrollY) {
      var context = canvas.getContext('2d');
      var sprite = spriteData[spriteName];

      var rasterizedPositionX = scrollX - 64*(positionObj.y - positionObj.x)/2 + canvas.width/2 + (63 - sprite.scaleWidth)/2;
      var rasterizedPositionY = 32*(positionObj.y + positionObj.x)/2 - 32/2 - (sprite.scaleHeight - 32)/2 + scrollY;

      context.drawImage(sprite.imageObj,
        frame*sprite.width, (Math.floor(positionObj.rotation / 8) || action)*sprite.height,
        sprite.width, sprite.height,
        rasterizedPositionX, rasterizedPositionY,
        sprite.scaleWidth, sprite.scaleHeight);

      // give the sprite a health bar if it should have one
      if (positionObj.health) {
        context.fillStyle = "rgba(200, 10, 10, 0.8)";
        context.fillRect(rasterizedPositionX, (rasterizedPositionY - 10), Math.round(positionObj.health * sprite.scaleWidth / positionObj.maxHealth), 10);
      }
    }
  };
});
