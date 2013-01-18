/**
 * Isometric Map Renderer
 */

/*global angular:false*/
'use strict';

angular.module('gameApp').factory('MapRenderer', function (imageLoader) {

  var MapRenderer = function (mapData) {
    this.mapData = mapData;

    var imageObj = this.imageObj = [];
    this.mapData.tilesets.forEach(function (tileset, index) {
      imageObj[index] = imageLoader.get(tileset.image);
    });
  };

  MapRenderer.prototype.render = function (canvas) {

    var mapData = this.mapData;
    var context = canvas.getContext('2d');

    var maxWindowX = mapData.width,
      maxWindowY = mapData.height;

    var that = this;
    // TODO: multiple layers/tilesets???
    // TODO: isometric
    mapData.layers.forEach(function (layer, layerIndex) {

      var i,
        x, y,
        tileX, tileY,
        tileType;

      var tileset = mapData.tilesets[layerIndex] || mapData.tilesets[0];

      var tileSpriteWidth = Math.floor(tileset.imagewidth / (tileset.tilewidth + tileset.spacing) );
      for (x = 0; x < maxWindowX; x++) {
        for (y = 0; y < maxWindowY; y++) {

          i = Math.floor(x*mapData.width + y);

          tileType = layer.data[i];

          tileY = tileset.margin +
            (tileset.tileheight + tileset.spacing)*Math.floor((tileType-1) / tileSpriteWidth);
          tileX = tileset.margin +
            (tileset.tilewidth + tileset.spacing)*((tileType-1) % tileSpriteWidth);

          context.drawImage(that.imageObj[0],
            tileX, tileY,
            tileset.tilewidth, tileset.tileheight,
            mapData.tilewidth*(y - x)/2 + canvas.width/2,
            mapData.tileheight*(x + y)/2,
            tileset.tilewidth, tileset.tileheight);

        }
      }
    });
  };

  return function (map) {
    return new MapRenderer(map);
  };

});
