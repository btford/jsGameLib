
var NPCState = require('./npc-state'),
  PlayerState = require('./player-state'),
  StatePool = require('./state-pool'),
  TownState = require('./town-state');

// Data
// ----
var map = require('../public/json/map-v0.1.0.json');

var spawnPositions = [
  { x: 1,  y: 11 },
  { x: 81, y: 23 },
  { x: 13, y: 85 },
  { x: 92, y: 74 }
];

var townPositions = [
  { x: 70, y: 92 },
  { x: 81, y: 20 },
  { x: 11, y: 93 },
  { x: 16, y: 14 }
];

var upgrades = require('../public/json/stats.json');

// Helpers
// -------
var dist = function (a, b) {
  return Math.sqrt( (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y) );
};

var mapHit = function (x, y) {
  var index = map.layers[0].width*Math.round(y) + Math.round(x);
  var datum = map.layers[1].data[index] || map.layers[0].data[index];

  return datum === 176 ||
    datum === 175;
};

// Constructor
// -----------
var GameState = module.exports = function () {

  // in ms (?) 5min * 60sec * 1000ms
  this.timer = 5 * 60 * 1000;
  var i;

  this.treasure = {
    onMap: false,
    x: 0,
    y: 0,
    toAppear: 1000,
    owner: 0
  };

  // Players
  this.players = [];
  this.players.length = 4;
  for (i = 0; i < 4; i++) {
    this.players[i] = new PlayerState(spawnPositions[i].x, spawnPositions[i].y);
  }

  // Towns
  this.towns = [];
  this.towns.length = 4;
  for (i = 0; i < 4; i++) {
    this.towns[i] = new TownState(townPositions[i].x, townPositions[i].y);
  }

  var npcs = this.npcs = new StatePool(200, NPCState);
  this.__defineGetter__('npcs', function () {
    return npcs.collection;
  });
};


// calculate changes in game state,
// returns a map of changes
GameState.prototype.calculate = function (delta, privateState) {

  var diff = {
    effects: []
  };

  // game is over
  if (this.timer <= 0) {
    return false;
  }

  var before = Math.round(this.timer/1000);
  this.timer -= delta;
  var after = Math.round(this.timer/1000);

  // only send timer updates once per second
  // TODO: client-side granularity ms -> seconds ?
  if (before !== after) {
    diff.timer = this.timer;
  }

  this._calculateTowns(delta, diff);

  this._calculateTreasure(delta, diff);

  this._calculatePlayersUpgrade(delta, diff, privateState);
  this._calculatePlayersPillage(delta, diff, privateState);
  this._calculatePlayersAttack(delta, diff, privateState);
  this._calculatePlayersMove(delta, diff, privateState);

  this._calculatePlayersRegen(delta, diff, privateState);

  // only send a diff if there's something to send
  if (diff.effects.length === 0) {
    delete diff.effects;
  }
  for (var thing in diff) {
    if (diff.hasOwnProperty(thing)) {
      return diff;
    }
  }
  return false;
};


// Helpers
// -------

var radians = 64;

var ptsToRadians = function (a, b) {
  var target = 0,
    dX = b.x - a.x,
    dY = b.y - a.y;

  if (dX > 0 && Math.abs(dY) < 1) {
    target = 3*radians/8;
  } else if (dX < 0 && Math.abs(dY) < 1) {
    target = 7*radians/8;
  } else if (Math.abs(dX) < 1 && dY > 0) {
    target = 5*radians/8;
  } else if (Math.abs(dX) < 1 && dY < 0) {
    target = radians/8;
  } else if (dX > 0 && dY > 0) {
    target = radians/2;
  } else if (dX < 0 && dY > 0) {
    target = 3*radians/4;
  } else if (dX < 0 && dY < 0) {
    target = 0;
  } else if (dX > 0 && dY < 0) {
    target = radians/4;
  }

  return target;
};

GameState.prototype._calculateTreasure = function (delta, diff) {
  if (this.treasure.toAppear > 0) {
    this.treasure.toAppear -= delta;
    if (this.treasure.toAppear <= 0) {
      this.treasure.onMap = true;
      this.treasure.x = 50;
      this.treasure.y = 50;
      diff.treasure = this.treasure;
    }
  } else if (this.treasure.onMap) {
    var thatTreasure = this.treasure;
    this.players.forEach(function (player, playerIndex) {
      if (dist(player.ship, thatTreasure) < 2) {
        thatTreasure.onMap = false;
        player.ship.treasure = true;

        diff['treasure.onMap'] = false;
        diff['players.' + playerIndex + '.ship.treasure'] = player.ship.treasure;
      }
    });
  }
};

GameState.prototype._calculateTowns = function (delta, diff) {
  this.towns.forEach(function (town, townIndex) {

    var before = town.pillagable();
    town.calculate(delta);
    var after = town.pillagable();

    if (before !== after) {
      diff['towns.' + townIndex + '.pillagable'] = after;
    }
  });
};

GameState.prototype._calculatePlayersUpgrade = function (delta, diff, privateState) {
  var thatGame = this;
  this.players.forEach(function (player, playerIndex) {

    var myPrivateState = privateState.players[playerIndex];

    if (!myPrivateState.upgrade) {
      return;
    }
    console.log(myPrivateState.upgrade);
    var chosenUpgrade = upgrades[myPrivateState.upgrade];

    // if the ship is too far away, it shouldn't be locked on
    if (!chosenUpgrade || chosenUpgrade.cost > player.notoriety) {
      myPrivateState.upgrade = null;
      return;
    }

    player.notoriety -= chosenUpgrade.cost;
    player.ship.upgrade(myPrivateState.upgrade);

    // un-lockon to town
    myPrivateState.upgrade = null;

    diff['players.' + playerIndex] = diff['players.' + playerIndex] || {};
    diff['players.' + playerIndex].notoriety = player.notoriety;

    diff['players.' + playerIndex + '.ship'] = diff['players.' + playerIndex + '.ship'] || {};
    diff['players.' + playerIndex + '.ship'].type = player.ship.type;
    diff['players.' + playerIndex + '.ship'].health = player.ship.health;
    diff['players.' + playerIndex + '.ship'].maxHealth = player.ship.maxHealth;

  });
};

GameState.prototype._calculatePlayersPillage = function (delta, diff, privateState) {
  var thatGame = this;
  this.players.forEach(function (player, playerIndex) {

    var myPrivateState = privateState.players[playerIndex];
    var lockedOnTown = thatGame.towns[myPrivateState.lockOnTown];

    if (!lockedOnTown) {
      return;
    }

    // if the ship is too far away, it shouldn't be locked on
    if (dist(player.ship, lockedOnTown) > 3*player.ship.range) {
      myPrivateState.lockOnTown = null;
      return;
    }

    // if the player is reloaded, town pillagable, and pointed in the right direction
    if (player.ship.toFire <= 0 &&
        lockedOnTown.pillagable() &&
        ptsToRadians(player.ship, lockedOnTown) === Math.round(player.ship.rotation)) {


      // reset the toFire count
      player.ship.fire();

      // if the town is not in range, splash or explode
      if (dist(player.ship, lockedOnTown) > 1.2 * player.ship.range){
        // create effect
        var ratio = player.ship.range / dist(player.ship, lockedOnTown);
        var hitX = player.ship.x + ratio * (lockedOnTown.x - player.ship.x),
          hitY = player.ship.y + ratio * (lockedOnTown.y - player.ship.y);
        // splash if it hits on water
        if (mapHit(hitX, hitY)){
          diff.effects.push({
          x: hitX + (0.5 - Math.random()),
          y: hitY + (0.5 - Math.random()),
          dur: 11,
          type: 'splash'
          });
        }
        // explode if it hits on land
        else {
          diff.effects.push({
            x: hitX,
            y: hitY,
            dur: 4,
            type: 'explosion'
          });
        }
        return;
      }

      player.notoriety += (1 + ~~player.ship.treasure)*lockedOnTown.pillage();

      diff['towns.' + myPrivateState.lockOnTown + '.pillagable'] = false;

      // un-lockon to town
      myPrivateState.lockOnTown = null;

      // create effect
      diff.effects.push({
        x: lockedOnTown.x,
        dur: 4,
        y: lockedOnTown.y,
        type: 'explosion'
      });

      diff['players.' + playerIndex] = diff['players.' + playerIndex] || {};
      diff['players.' + playerIndex].notoriety = player.notoriety;

    }

  });
};

GameState.prototype._calculatePlayersRegen = function (delta, diff, privateState) {
  this.players.forEach(function (player, index) {
    if (player.ship.health < player.ship.maxHealth &&
        player.ship.sinceDamage > 5000 &&
        player.ship.sinceHeal > 1000) {

      player.ship.health += Math.floor(player.ship.sinceDamage / 1000)-4;
      if (player.ship.health > player.ship.maxHealth) {
        player.ship.health = player.ship.maxHealth;
      }
      diff['players.' + index + '.ship.health'] = player.ship.health;

      player.ship.sinceHeal = 0;

    } else {
      player.ship.sinceHeal += delta;
    }
  });
};

// also handles commandeer
GameState.prototype._calculatePlayersAttack = function (delta, diff, privateState) {
  var thatGame = this;
  this.players.forEach(function (player, index) {
    player.ship.sinceDamage += delta;
  });
  this.players.forEach(function (player, index) {

    var myPrivateState = privateState.players[index];
    var lockedOnPlayer = thatGame.players[myPrivateState.lockOn];

    if (!lockedOnPlayer) {
      return;
    }

    // if the ship is too far away, it shouldn't be locked on
    if (dist(player.ship, lockedOnPlayer.ship) > 3*player.ship.range) {
      myPrivateState.lockOn = null;
      return;
    }

    // if the player is reloaded, and pointed in the right direction
    if (player.ship.toFire <= 0 &&
        ptsToRadians(player.ship, lockedOnPlayer.ship) === Math.round(player.ship.rotation)) {

      // reset the toFire count
      player.ship.fire();

      // if the ship is not in range, splash
      if (dist(player.ship, lockedOnPlayer.ship) > player.ship.range){
        // create effect
        var ratio = player.ship.range / dist(player.ship, lockedOnPlayer.ship);
        diff.effects.push({
        x: player.ship.x + ratio * (lockedOnPlayer.ship.x - player.ship.x)+ 2*(0.5 - Math.random()),
        y: player.ship.y + ratio * (lockedOnPlayer.ship.y - player.ship.y)+ 2*(0.5 - Math.random()),
        dur: 11,
        type: 'splash'
        });
        return;
      }

      // commandeer if you are the ghost ship, and there ship is neither basic nor ghost
      if (player.ship.type === 'ghostShip' &&
          lockedOnPlayer.ship.type !== 'ghostShip' &&
          lockedOnPlayer.ship.type !== 'ship') {

        // TODO: take into account other ship's health
        if (Math.random() <= (player.ship.accuracy / 2)) {
          player.ship.commandeer(lockedOnPlayer.ship);
          lockedOnPlayer.ship.respawn();

          diff['players.' + index + '.ship'] = diff['players.' + index + '.ship'] || {};
          diff['players.' + index + '.ship'].x = player.ship.x;
          diff['players.' + index + '.ship'].y = player.ship.y;
          diff['players.' + index + '.ship'].type = player.ship.type;
          diff['players.' + index + '.ship'].health = player.ship.health;
          diff['players.' + index + '.ship'].rotation = player.ship.rotation;
          diff['players.' + index + '.ship'].treasure = player.ship.treasure;


          diff['players.' + myPrivateState.lockOn + '.ship'] = diff['players.' + myPrivateState.lockOn + '.ship'] || {};
          diff['players.' + myPrivateState.lockOn + '.ship'].x = lockedOnPlayer.ship.x;
          diff['players.' + myPrivateState.lockOn + '.ship'].y = lockedOnPlayer.ship.y;
          diff['players.' + myPrivateState.lockOn + '.ship'].type = lockedOnPlayer.ship.type;
          diff['players.' + myPrivateState.lockOn + '.ship'].health = lockedOnPlayer.ship.health;
          diff['players.' + myPrivateState.lockOn + '.ship'].maxHealth = lockedOnPlayer.ship.maxHealth;
          diff['players.' + myPrivateState.lockOn + '.ship'].rotation = lockedOnPlayer.ship.rotation;
          diff['players.' + myPrivateState.lockOn + '.ship'].treasure = lockedOnPlayer.ship.treasure;

          diff.effects.push({
            x: lockedOnPlayer.ship.x,
            y: lockedOnPlayer.ship.y,
            dur: 9,
            type: 'swordclash-flash'
          });
        } else {
          // TODO: create a different effect
          diff.effects.push({
            x: lockedOnPlayer.ship.x,
            y: lockedOnPlayer.ship.y,
            dur: 5,
            type: 'swordclash'
          });
        }

      // otherwise do a normal attack and check if it hits if the ship hits
      } else if (Math.random() <= player.ship.accuracy) {

        lockedOnPlayer.ship.health -= player.ship.attack;
        if (lockedOnPlayer.ship.health < 0) {
          lockedOnPlayer.ship.health = 0;
        }
        lockedOnPlayer.ship.sinceDamage = 0;

        // you get 5 notoriety every time you hit someone, 10 if you have the treasure
        player.notoriety += 5*(1 + ~~player.ship.treasure);


        var tempLockOn = myPrivateState.lockOn;

        diff['players.' + tempLockOn + '.ship'] = diff['players.' + tempLockOn + '.ship'] || {};

        // if the ship dies, put it back at spawn position
        if (lockedOnPlayer.ship.health <= 0) {

            // create effect
            diff.effects.push({
              x: lockedOnPlayer.ship.x,
              y: lockedOnPlayer.ship.y,
              dur: 4,
              type: 'sink'
            });

          // if the ship we killed has the treasure, drop it
          if (lockedOnPlayer.ship.treasure) {
            lockedOnPlayer.ship.treasure = false;
            diff['players.' + tempLockOn + '.ship.treasure'] = lockedOnPlayer.ship.treasure;

            thatGame.treasure.onMap = true;
            thatGame.treasure.x = lockedOnPlayer.ship.x;
            thatGame.treasure.y = lockedOnPlayer.ship.y;
            diff['treasure'] = thatGame.treasure;
          }

          player.notoriety += 25*(1 + ~~player.ship.treasure);

          lockedOnPlayer.ship.respawn();
          lockedOnPlayer.ship.x = spawnPositions[tempLockOn].x;
          lockedOnPlayer.ship.y = spawnPositions[tempLockOn].y;

          diff['players.' + tempLockOn + '.ship'].x = lockedOnPlayer.ship.x;
          diff['players.' + tempLockOn + '.ship'].y = lockedOnPlayer.ship.y;
          diff['players.' + tempLockOn + '.ship'].type = lockedOnPlayer.ship.type;
          diff['players.' + tempLockOn + '.ship'].maxHealth = lockedOnPlayer.ship.maxHealth;

          // remove lockon
          myPrivateState.lockOn = null;
        } else {
          // create effect
          diff.effects.push({
            x: lockedOnPlayer.ship.x,
            y: lockedOnPlayer.ship.y,
            dur: 4,
            type: 'explosion'
          });
        }

        diff['players.' + tempLockOn + '.ship'].health = lockedOnPlayer.ship.health;

        diff['players.' + index] = diff['players.' + index] || {};
        diff['players.' + index].notoriety = player.notoriety;

      } else {

        // create effect
        diff.effects.push({
          x: lockedOnPlayer.ship.x + 2*(0.5 - Math.random()),
          y: lockedOnPlayer.ship.y + 2*(0.5 - Math.random()),
          dur: 11,
          type: 'splash'
        });

      }

    }
  });
};

GameState.prototype._calculatePlayersMove = function (delta, diff, privateState) {
  // update each player
  var thatGame = this;
  this.players.forEach(function (player, index) {

    // this doesn't need to be added to the diff
    player.ship.toFire -= 1;

    var myPrivateState = privateState.players[index];
    var controller = myPrivateState.controls;

    // update player's ship
    var speed = player.ship.speed * delta/100;

    var dX = 0,
      dY = 0;

    var target = 0;

    if (controller.left && controller.up) {
      dX -= speed;
    } else if (controller.right && controller.up) {
      dY -= speed;
    } else if (controller.left && controller.down) {
      dY += speed;
    } else if (controller.right && controller.down) {
      dX += speed;
    } else if (controller.left) {
      dX -= speed/1.41;
      dY += speed/1.41;
    } else if (controller.right) {
      dX += speed/1.41;
      dY -= speed/1.41;
    } else if (controller.up) {
      dX -= speed/1.41;
      dY -= speed/1.41;
    } else if (controller.down) {
      dX += speed/1.41;
      dY += speed/1.41;
    }

    // rotational velocity; only applied if relevant
    var rotV = 1;

    if (dX !== 0 || dY !== 0) {

      if (dX > 0 && dY === 0) {
        target = 3*radians/8;
      } else if (dX < 0 && dY === 0) {
        target = 7*radians/8;
      } else if (dX === 0 && dY > 0) {
        target = 5*radians/8;
      } else if (dX === 0 && dY < 0) {
        target = radians/8;
      } else if (dX > 0 && dY > 0) {
        target = radians/2;
      } else if (dX < 0 && dY > 0) {
        target = 3*radians/4;
      } else if (dX < 0 && dY < 0) {
        target = 0;
      } else if (dX > 0 && dY < 0) {
        target = radians/4;
      }

      if (Math.round(player.ship.rotation) === target) {
        if (mapHit(player.ship.x + dX, player.ship.y + dY)) {
          player.ship.x += dX;
          player.ship.y += dY;

          // bounds checking on player movement
          if (player.ship.x < 0) {
            player.ship.x = 0;
          } else if (player.ship.x > (map.width - 1)) {
            player.ship.x = map.width - 1;
          }
          if (player.ship.y < 0) {
            player.ship.y = 0;
          } else if (player.ship.y > (map.height - 1)) {
            player.ship.y = map.height - 1;
          }

        }
      } else {
        if (target < player.ship.rotation && player.ship.rotation - target < radians/2 ||
            target > player.ship.rotation && target - player.ship.rotation > radians/2) {
          rotV = -1;
        }
        player.ship.rotation = Math.round(((player.ship.rotation + rotV) + radians) % radians);
      }

      diff['players.' + index + '.ship'] = diff['players.' + index + '.ship'] || {};
      diff['players.' + index + '.ship'].x = player.ship.x,
      diff['players.' + index + '.ship'].y = player.ship.y,
      diff['players.' + index + '.ship'].rotation = player.ship.rotation;

    } else {

      var lockedOnPlayer = thatGame.players[myPrivateState.lockOn];
      var lockedOnTown = thatGame.towns[myPrivateState.lockOnTown];
      var lockedOnTarget;

      if (lockedOnPlayer) {
       lockedOnTarget = lockedOnPlayer.ship;
      } else if (lockedOnTown) {
       lockedOnTarget = lockedOnTown;
      }

      if (lockedOnTarget) {
        var newTarget = ptsToRadians(player.ship, lockedOnTarget);
        if (lockedOnTarget &&
            Math.round(player.ship.rotation) !== newTarget) {

          target = newTarget;

          if (target < player.ship.rotation && player.ship.rotation - target < radians/2 ||
              target > player.ship.rotation && target - player.ship.rotation > radians/2) {
            rotV = -1;
          }
          player.ship.rotation = Math.round(((player.ship.rotation + rotV) + radians) % radians);

          diff['players.' + index + '.ship'] = diff['players.' + index + '.ship'] || {};
          diff['players.' + index + '.ship'].rotation = Math.round(player.ship.rotation);
        }
      }
    }

  });
};

// TODO: further refactor above fn
/*
GameState.prototype._calculatePlayersMoveController = function (delta, diff, privateState) {
GameState.prototype._calculatePlayersMoveTarget = function (delta, diff, privateState) {
*/
