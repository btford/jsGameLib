
var util = require('util');

var SocketronState = require('socketron').State;
var GameStateData = require('./game-state-data');

var GameState = module.exports = function (config) {
  SocketronState.apply(this, arguments);

  this.maxPlayers = 4;
  this.numberOfPlayers = 0;

  // TODO: name ? GameModel
  this.model = new GameStateData();
  this.privateState = new PrivateState();

  this.on('controls', function (message, state, socket) {
    state.privateState.players[socket.id].controls = message;
  });

  this.on('lockon:ship', function (message, state, socket) {
    state.privateState.players[socket.id].lockOn = message;
    state.privateState.players[socket.id].lockOnTown = null;
  });

  this.on('pillage:town', function (message, state, socket) {
    // you can only "lock on" if the village is pillagable
    if (game.towns[message].pillagable()) {
      state.privateState.players[socket.id].lockOnTown = message;
      state.privateState.players[socket.id].lockOn = null;
    }
  });
  this.on('buy:upgrade', function (message, state, socket) {
    state.privateState.players[socket.id].upgrade = message;
  });
};

util.inherits(GameState, SocketronState);

GameState.prototype.add = function (socket) {

  // limit the number of sockets that can join
  if (this.numberOfPlayers >= this.maxPlayers) {
    return;
  }

  if (this.numberOfPlayers === 0) {
    this.leader = socket;
    // TODO: start the model
  }

  this.numberOfPlayers += 1;

  var ret = SocketronState.prototype.add.apply(this, arguments);

  //this.parent().broadcast(this.repr());

  socket.emit('change:route', '/game/' + this.id);

  this.broadcast('shared:init', game);

  return ret;
};

GameState.prototype.remove = function (socket) {
  var ret = SocketronState.prototype.remove.apply(this, arguments);

  this.numberOfPlayers -= 1;

  if (this.numberOfPlayers <= 0) {
    // TODO: stop the model
    // remove this game ?
    //this.parent().destroySubstate(this.name)
  }

  //this.parent().broadcast(this.repr());

  return ret;
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
      thisGameState.broadcast('change:route', '/game-over/' + thisGameState.id);
    }
  };
  play();

  // play is now a noop
  this.stop = function () {
    play = function () {};
  };
};

