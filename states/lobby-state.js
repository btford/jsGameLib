
var util = require('util');

var SocketronState = require('socketron').State;
var GameState = require('./game-state');

var LobbyState = module.exports = function (config) {
  SocketronState.apply(this, arguments);

  this.maxPlayers = 4;
  this.numberOfPlayers = 0;

  this.on('start:game', function (message, state, socket) {
    if (socket !== state.leader) {
      return;
    }
    var newGameState = state.substate({
      type: GameState
    });
    this.gameState = newGameState;
    state.moveAllTo(newGameState);
  });
  
  this.on('leave:lobby',function (message, state, socket) {
    state.remove(socket);
  });

  this.on('get:lobby', function (message, state, socket) {
    socket.emit('update:lobby', this.repr());
  });

};

util.inherits(LobbyState, SocketronState);

LobbyState.prototype.add = function (socket) {

  // limit the number of sockets that can join
  if (this.numberOfPlayers >= this.maxPlayers) {
    return false;
  }

  if (this.numberOfPlayers === 0) {
    this.leader = socket;
  }

  this.numberOfPlayers += 1;

  if (!SocketronState.prototype.add.apply(this, arguments)) {
    return false;
  }

  socket.emit('change:route', '/lobby/' + this._name);
  this.broadcast('update:lobby', this.repr());

  return true;
};

LobbyState.prototype.remove = function (socket) {

  this.numberOfPlayers -= 1;
  if (this.numberOfPlayers < 0) {
    this.numberOfPlayers = 0;
  }

  if (!SocketronState.prototype.remove.apply(this, arguments)) {
    return false;
  }
  this._router.getSubstate('globalLobby').add(socket);
  this.broadcast('update:lobby', this.repr());

  return true;
};

// return a representation to be sent to the client
LobbyState.prototype.repr = function () {
  var ret = {
    name: this._name,
    players: [],
    leader: true
  };

  for (var socketName in this._sockets) {
    if (this._sockets.hasOwnProperty(socketName)) {
      ret.players.push(socketName);
    }
  }
  return ret;
};
