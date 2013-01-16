'use strict';

// based largely on: https://github.com/btford/html5-game-tutorial/blob/master/game.js

angular.module('gameApp').factory('gameController', function ($window) {

  // define a "controller" that keeps track of key states
  var controller = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  var dirty = true;

  // map key codes to directions
  var keyCodes = {
    65: 'left',
    68: 'right',
    87: 'up',
    83: 'down'
  };

  // update key states on key events
  $window.document.addEventListener('keydown', function (ev) {
    var key = ev.keyCode;
    if (keyCodes[key]) {
      controller[keyCodes[key]] = true;
      dirty = true;
    }
  });
  $window.document.addEventListener('keyup', function (ev) {
    var key = ev.keyCode;
    if (keyCodes[key]) {
      controller[keyCodes[key]] = false;
      dirty = true;
    }
  });

  return {
    get: function () {
      return dirty ? controller : null;
    }
  };

});
