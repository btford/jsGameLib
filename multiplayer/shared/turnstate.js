var State = require('./state.js').Model;
var _ = require('underscore');

var TurnState = exports.TurnState = State.excend({
  initialize: function (args) {
    this.game = args.game;
    this.activePlayer = game.players[0];

  },

  start: function () {

  },

  // overwrite this
  run: function () {
    this.activePlayer

  },

  stop: function() {
    // cleanup
  }
});
