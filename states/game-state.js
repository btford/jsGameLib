/*
 * Game State
 */

var util = require('util');

var SocketronState = require('socketron').State;

var GameState = module.exports = function (config) {
  SocketronState.apply(this, arguments);

  this.maxPlayers = 4;
  this.numberOfPlayers = 0;

  // TODO: name ? GameModel
  this.model = {}; // new GameStateData();
  //this.privateState = new PrivateState();

  this.on('controls', function (message, state, socket) {
    state.privateState.players[socket.id].controls = message;
  });
};

util.inherits(GameState, SocketronState);

GameState.prototype.add = function (socket) {

  // limit the number of sockets that can join
  if (this.numberOfPlayers >= this.maxPlayers) {
    return;
  }

  this.numberOfPlayers += 1;

  var ret = SocketronState.prototype.add.apply(this, arguments);

  socket.emit('change:route', '/game/' + this._name);
  socket.emit('init:game:model', this.repr());

  this.broadcast('update:game', this.repr());

  // when the first player joins, start the game
  if (this.numberOfPlayers === 1) {
    this.start();
  }

  return ret;
};

GameState.prototype.remove = function (socket) {

  this.numberOfPlayers -= 1;

  // when the last player leaves, stop the game
  if (this.numberOfPlayers <= 0) {
    this.stop();
  }

  var ret = SocketronState.prototype.remove.apply(this, arguments);
  this.broadcast('update:game', this.repr());
  return ret;
};

// return a representation to be sent to the client
GameState.prototype.repr = function () {
  return this.model;
};


GameState.prototype.start = function() {

  var game = this.model;
  var thisGameState = this;

  // last timestamp (in ms) since gamestate was updated
  var last = Date.now();
  var play = function () {
    var now = Date.now();
    var diff = game.calculate(now - last, privateState);
    if (diff) {
      thisGameState.broadcast('shared:update', diff);
    }
    last = now;
    if (game.timer > 0) {
      setTimeout(play, 15);
    } else {
      thisGameState.broadcast('change:route', '/game-over/' + thisGameState._name);
    }
  };
  play();

  // play is now a noop
  this.stop = function () {
    play = function () {};
  };
};

