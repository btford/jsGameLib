/*
 * Setup root Socketron State
 */

var socketron = require('socketron');
var LobbyState = require('./lobby-state');

exports.init = function (io) {

  socketron.init(io).state({
    name: 'globalLobby',
    default: true,
    model: {
      lobbies: {},
      repr: function () {
        var ret = {};
        for (var lobbyName in this.lobbies) {
          ret[lobbyName] = this.lobbies[lobbyName].repr();
        }
        return ret;
      },
      addLobby: function (state) {
        this.lobbies[state._name] = state;
      },
      removeLobby: function (state) {
        delete this.lobbies[state._name];
      }
    },
    on: {
      'create:lobby': function (message, state, socket) {
        var newLobby = state.state({
          type: LobbyState
        });
        newLobby.add(socket);
        this.model.addLobby(newLobby);
        this.broadcast('update:lobbies', this.model.repr());
        console.log(this.model.repr());
      },
      'join:lobby': function (message, globalLobbyState, socket) {
        try {
          if (!this.model.lobbies[message.id].add(socket)) {
            throw new Error('Cannot join lobby');
          }
          this.broadcast('update:lobbies', this.model.repr());
        }
        catch (e) {
          console.error(e.message);
          this.broadcast('change:route', '/');
        }
      },
      'get:lobbies': function (message, state, socket) {
        socket.emit('update:lobbies', this.model.repr());
      }
    }
  });
};
