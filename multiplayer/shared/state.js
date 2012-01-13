var Model = require('./model.js').Model;
var _ = require('underscore');

var State = exports.State = Model.extend({
  initialize: function (args) {
    this.game = args.game;

    // aliases
    this.players = this.game.players;
    this.emit = this.game.emit;
  }
});