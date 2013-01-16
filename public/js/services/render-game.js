/* module implementing rendering the game state to a canvas */
/*global angular:false*/

'use strict';

angular.module('gameApp').factory('renderGame', function (shared, sound, spriteRenderer, renderGameOver) {

  var dist = function (a, b) {
    return Math.sqrt( (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y) );
  };

  return function (canvas, map) {

    if (!shared.get()) {
      return;
    }
    var scrollX = 0,
      scrollY = 0;

    var tileWidth = 64,
      tileHeight = 32;

    // player around which to center the map
    var centerPlayer = shared.getMe();

    var context = canvas.getContext('2d');
    

    if (shared.get().players) {
      scrollX = tileWidth*(centerPlayer.ship.y - centerPlayer.ship.x)/2 - tileWidth/2;
      scrollY = canvas.height/2 - tileHeight*(centerPlayer.ship.y + centerPlayer.ship.x)/2 - tileHeight/2;
    }

    if (shared.get().treasure.onMap) {
      spriteRenderer.render('treasure', shared.get().treasure, 0, 0, canvas, scrollX, scrollY);
    }

    shared.get().towns.forEach(function (town) {
      var action = (town.pillagable === undefined) ? 0 : (1 - ~~town.pillagable);
      spriteRenderer.render('town', town, action, 0, canvas, scrollX, scrollY);
    });

    shared.get().players.forEach(function (player) {
      spriteRenderer.render(player.ship.type, player.ship, 0, 0, canvas, scrollX, scrollY);
    });

    // effects
    var effectsToRemove = [];
    shared.get().effects.forEach(function (effect) {
      effect.frame = effect.frame || 0;
      if (effect.frame === 0 && dist(centerPlayer.ship, effect) < 100) {
        sound.play(effect.type, Math.round(100 - dist(centerPlayer.ship, effect)));
      }
      spriteRenderer.render(effect.type, effect, 0, effect.frame, canvas, scrollX, scrollY);
      effect.frame += 1;
      if (effect.frame > effect.dur) {
        effectsToRemove.push(effect);
      }
    });
    effectsToRemove.forEach(function (effect) {
      delete shared.get().effects[shared.get().effects.indexOf(effect)];
    });

    // render timer
    context.font = "bold 18px sans-serif";
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillText(translteSec(Math.round(shared.get().timer / 1000))+" left!", 30, 30);

    function translteSec(seconds) {
      var mm = Math.floor(seconds/60);
      var ss = seconds%60;
      if(ss < 10) {
        ss = "0"+ss;
      }
      if(mm < 1) {
        return (ss+" seconds");
      } else {
        return mm+":"+ss;
      }
    }

    // render health
    context.fillText('Health: ' + shared.getMe().ship.health, canvas.width - 125, 30);

    // render all player's notoriety
    context.font = "bold 16px sans-serif";
    context.fillText('Notoriety', canvas.width - 110, 59);
    shared.get().players.forEach(function (player, index) {
      if (player === shared.getMe()) {
        context.font = "bold 12px sans-serif";
      } else {
        context.font = "normal 12px sans-serif";
      }
      context.fillText('Player ' + (index + 1) + ': ' + player.notoriety, canvas.width - 110, 75 + (14*index));
    });

    if (shared.getMe().ship.treasure) {
      context.font = "bold 14px sans-serif";
      context.fillText('You\'ve got', canvas.width - 115, 150);
      context.fillText('the treasure!', canvas.width - 110, 165);
    }

    // render mini map
    var miniMapW = 200,
      miniMapH = 100;

    context.beginPath();
    context.moveTo(canvas.width - miniMapW/2 - 10, canvas.height - miniMapH - 10);
    context.lineTo(canvas.width - 10, canvas.height - miniMapH/2 - 10);
    context.lineTo(canvas.width - miniMapW/2 - 10, canvas.height - 10);
    context.lineTo(canvas.width - miniMapW - 10, canvas.height - miniMapH/2 - 10);
    context.closePath();
    context.fillStyle = "rgba(64, 64, 64, 0.2)";
    context.fill();

    var i,
      x, y,
      tileType,
      minimapStartX = canvas.width - miniMapW/2 - 10,
      minimapStartY = canvas.height - miniMapH - 10;

    map = map.mapData;

    context.fillStyle = "rgba(34, 139, 34, 0.8)";

    for (x = 0; x < map.width; x++) {
      for (y = 0; y < map.height; y++) {
        i = Math.floor(x*map.width + y);
        tileType = map.layers[1].data[i] || map.layers[0].data[i];
        if (tileType !== 176 && tileType !== 175) {
          context.fillRect(minimapStartX + (y - x), minimapStartY + (x + y)/2, 1, 1);
        }
      }
    }

    var treasure = shared.get().treasure;
    if (treasure && treasure.onMap) {
      context.fillStyle = "rgb(255, 255, 0)";
      
      var miniX = canvas.width - miniMapW - 10 - 2*(treasure.y - treasure.x)/2 + miniMapW/2  - 4/2;
      var miniY = (treasure.y + treasure.x)/2 - 4/2 + canvas.height - miniMapH - 10;

      context.fillRect(miniX, miniY, 4, 4);
    }
  
    shared.get().players.forEach(function (player) {
      var miniX = canvas.width - miniMapW - 10 - 2*(player.ship.y - player.ship.x)/2 + miniMapW/2  - 4/2;
      var miniY = (player.ship.y + player.ship.x)/2 - 4/2 + canvas.height - miniMapH - 10;
      
      if (player.ship.treasure) {
        context.fillStyle = "rgb(255, 255, 0)";
      } else if (player === centerPlayer) {
        context.fillStyle = "rgb(255, 0, 0)";
      } else {
        context.fillStyle = "rgb(0, 0, 0)";
      }
      context.fillRect(miniX, miniY, 4, 4);
    });

    shared.get().towns.forEach(function (town) {
      var miniX = canvas.width - miniMapW - 10 - 2*(town.y - town.x)/2 + miniMapW/2  - 4/2;
      var miniY = (town.y + town.x)/2 - 4/2 + canvas.height - miniMapH - 10;
      
      if (town.pillagable) {
        context.fillStyle = "rgb(20, 235, 20)";
      } else {
        context.fillStyle = "rgb(100, 20, 20)";
      }
      context.fillRect(miniX, miniY, 4, 4);
    });

  };
});
