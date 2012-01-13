// Base class for Lobby and Game;
// includes utils for handling multiple sockets

// must have an array of players

var Model = require('./model.js').Model;
var _ = require('underscore');

var SocketGroup = exports.SocketGroup = Model.extend({

  // if overwritten, players array must still be populated.
  // you can call jsGameLib.SocketGroup.initialize, or add that one line to
  // your initializer
  initialize: function (args) {
    this.players = args.players;
  },

  emit: function (eventName, eventData) {
    _.each(this.players, function (player) {
      player.emit(eventName, eventData);
    });
  },

  emitWithout: function (withoutPlayer, eventName, eventData) {
    var players = _.without(this.players, withoutPlayer);
    _.each(players, function (player) {
      player.emit(eventName, eventData);
    });
  }
});
