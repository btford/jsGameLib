var SocketGroup = require('./socketgroup.js').SocketGroup;
var _ = require('underscore');

var Game = exports.Game = SocketGroup.extend({

  // Overwritten by extended games
  states: {},

  initialize: function (args) {
    this.players = args.players;
  },

  start: function () {
    this.startState('start');
  },

  startState: function (stateName) {
    this.stopState();
    var that = this;
    var State = this.states[stateName];
    this.currentState = new State({
      game: that
    });
  },

  stopState: function () {
    if (this.currentState) {
      this.currentState.stop();
      this.currentState = null;
    }
  },

  stop: function (data) {
    this.startState('gameover');
    this.emit('gameover', data);
  }
});
