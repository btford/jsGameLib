
var util = require('util');

/*
var GameState = require('./game-state'),
  PrivateState = require('./private-state');
*/

var SocketronState = require('socketron').State;

var LobbyState = module.exports = function (config) {
  SocketronState.apply(this, arguments);

  this.data = { /* ... */ };

  this.maxPlayers = 4;
  this.numberOfPlayers = 0;

  this.on('start:game', function (message, state, socket) {
    if (socket !== state.leader) {
      return;
    }
    state.state({
      type: GameState
    }).moveAllTo(newGameState);
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
    return;
  }

  if (this.numberOfPlayers === 0) {
    this.leader = socket;
  }

  this.numberOfPlayers += 1;

  var ret = SocketronState.prototype.add.apply(this, arguments);

  socket.emit('change:route', '/lobby/' + this._name);
  this.broadcast('update:lobby', this.repr());

  return ret;
};

LobbyState.prototype.remove = function (socket) {

  this.numberOfPlayers -= 1;

  if (this.numberOfPlayers <= 0) {
    // remove this lobby ?
  }

  var ret = SocketronState.prototype.remove.apply(this, arguments);
  this._router.getSubstate('globalLobby').add(socket);

  this.broadcast('update:lobby', this.repr());

  return ret;
};

// return a representation to be sent to the client
LobbyState.prototype.repr = function () {
  var ret = {
    name: this._name,
    players: [],
    leader: true
  };
  for (socketName in this._sockets) {
    if (this._sockets.hasOwnProperty(socketName)) {
      ret.players.push(socketName);
    }
  }
  return ret;
};

/*

var LobbyState = module.exports = function (leader, name, id) {
  this.leader = leader;
  this.name = name;
  this.id = id;

  this.maxPlayers = 4;
  this.playerSockets = [];
  this.numberOfPlayers = 0;
  
  this.join(leader);
  
  this.game = null;
  this.privateState = null;
};

// update data structs and announce to other playerSockets
LobbyState.prototype.join = function (socket) {
  if (this.playerSockets.length < this.maxPlayers &&
      this.playerSockets.indexOf(socket) === -1) {

    this.numberOfPlayers += 1;
    this.playerSockets.push(socket);
    socket.emit('change:route', '/lobby/' + this.id);
    this.broadcastLobbyInfo();

    return true;
  } else {
    return false;
  }
};

LobbyState.prototype.leave = function (socket) {

  if (this.playerSockets.indexOf(socket) === -1) {
    return false;
  }

  // not sure about this...
  this.playerSockets.splice(this.playerSockets.indexOf(socket), 1);

  // if the last player is leaving, stop the game if it's still running
  if (this.playerSockets.length === 1) {
    if (this.stop) {
      this.stop();
    }
  }

  // if the lobby leader left, assign a new leader
  var that = this;
  if (socket === this.leader) {
    this.playerSockets.forEach(function (player) {
      if (socket === that.leader && player !== that.leader) {
        that.leader = player;
      }
    });
  }

  this.numberOfPlayers -= 1;
  this.broadcastLobbyInfo();
};

LobbyState.prototype.start = function () {
  console.log('lobby started');
  var game = this.game = new GameState();
  this.broadcast('change:route', '/game/' + this.id);

  this.broadcast('shared:init', game);
  this.broadcastIndeces();

  var privateState = this.privateState = new PrivateState();

  this.playerSockets.forEach(function (playerSocket, playerIndex) {

    // handle private state
    var myIndex = playerIndex,
      mySocket = playerSocket;

    mySocket.on('controls', function (message) {
      privateState.players[myIndex].controls = message;
    });

    mySocket.on('lockon:ship', function (message) {
      privateState.players[myIndex].lockOn = message;
      privateState.players[myIndex].lockOnTown = null;
    });

    mySocket.on('pillage:town', function (message) {

      // you can only "lock on" if the village is pillegable
      if (game.towns[message].pillagable()) {
        privateState.players[myIndex].lockOnTown = message;
        privateState.players[myIndex].lockOn = null;
      }
    });
    mySocket.on('buy:upgrade', function (message) {
      privateState.players[myIndex].upgrade = message;
    });
  });

  var that = this;

  // last timestamp (in ms) since gamestate was updated
  var last = Date.now();
  var play = function () {
    var now = Date.now();
    var diff = game.calculate(now - last, privateState);
    if (diff) {
      that.broadcast('shared:update', diff);
    }
    last = now;
    if (game.timer > 0) {
      setTimeout(play, 15);
    } else {
      that.broadcast('change:route', '/game-over/' + that.id);
    }
  };
  play();

  // play is now a noop
  this.stop = function () {
    play = function () {};
  };
};

LobbyState.prototype.broadcast = function (name, message) {
  this.playerSockets.forEach(function (socket) {
    socket.emit(name, message);
  });
};

LobbyState.prototype.broadcastIndeces = function () {
  this.playerSockets.forEach(function (socket, index) {
    socket.emit('shared:shipIndex', index);
  });
};

LobbyState.prototype.broadcastLobbyInfo = function () {
  var i, players = [];
  for (i = 0; i < this.numberOfPlayers; i++) {
    players.push('Player ' + (i + 1));
  }

  var that = this;
  this.playerSockets.forEach(function (socket) {
    socket.emit('init:lobby', {
      players: players,
      leader: socket === that.leader
    });
  });
};
*/