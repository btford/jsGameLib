// players can leave/join lobbies, then start games from here

var SocketGroup = require('./socketgroup.js').SocketGroup;
var Game = require('./game.js').Game;

var _ = require('underscore');

var Lobby = exports.Lobby = SocketGroup.extend({

  // should be overwitten pending on the game
  game: Game,

  initialize: function (args) {
    this.started = false;
    this.leader = args.leader;
    this.id = args.leader.id;
    this.name = args.name;
    this.players = [args.leader];
  },

  join: function (newPlayer) {
    if (!this.started) {
      this.emit('lobby:join', newPlayer.publicInfo());
      this.players.push(newPlayer);

      newPlayer.emit('lobby:join:success', this.toSend());
    } else {
      newPlayer.emit('lobby:join:fail');
    }
  },

  leave: function (player) {
    this.players = _.without(this.players, player);
    this.emit('lobby:player:leave', player.toSend());
  },

  start: function () {
    var Game = this.game;

    this.started = true;
    this.emit('gamestarting');
    var game = new Game({
      players: this.players
    });
    game.start();
  },

  toSend: function () {
    return {
      name: this.name,
      leader: this.leader.id,
      players: _.map(this.players, function (player) {
        return player.toSend();
      })
    };
  },

  destroy: function() {
    this.emit('lobby:destroy');
    this.server.removeLobby(this);
  }
});
