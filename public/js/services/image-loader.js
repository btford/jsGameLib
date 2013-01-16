/*global angular:false, Image:false*/
'use strict';

angular.module('gameApp').factory('imageLoader', function (dataLoader, $rootScope) {

  var cache = {};
  var callback = function () {};
  var toLoad = 1;

  var api = {
    get: function (src) {
      return cache[src];
    },

    load: function (src, cb) {
      var img = new Image();
      cache[src] = img;
      img.src = src;
      if (cb) {
        img.onload = cb;
      }
    },

    preLoad: function () {

      var spritesData = dataLoader.get('/json/sprites.json');
      angular.forEach(spritesData, function (sprite) {
        toLoad += 1;
      });
      
      // load and cache all sprites
      var completeOne = function () {
        toLoad -= 1;
        if (toLoad === 0) {
          $rootScope.$apply(callback);
        }
      };

      angular.forEach(spritesData, function (sprite) {
        api.load(sprite.img, completeOne);
      });
      
      return api;
    },
    ready: function (cb) {
      if (toLoad === 0) {
        cb();
      } else {
        callback = cb;
      }
    }
  };

  return api;
});
