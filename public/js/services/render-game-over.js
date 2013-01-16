/* module implementing rendering the game over state to a canvas */
/*global angular:false*/

'use strict';

angular.module('gameApp').factory('renderGameOver', function (shared) {

  return function (canvas) {

    // render game over
    var context = canvas.getContext('2d');
    context.font = "bold 12px sans-serif";
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillText('Game over', 30, 30);

  };
});
