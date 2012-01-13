var Model = require('./model.js').Model;
var _ = require('underscore');

var Player = exports.Player = Model.extend({
  initialize: function (args) {
    this.state = 'waiting';
    this.socket = args.socket;
    this.socket.player = this;

    // alias
    this.id = this.socket.id;

    this.game = args.game;

    this.socketBindings();
  },

  // alias for player.socket.emit; I'm lazy
  emit: function (name, data) {
    this.socket.emit(name, data);
  },

  socketBindings: function () {
    var that = this;
    this.socket.on('disconnect', function() {
      that.destroy();
    });
  },

  // destroy this, emitting
  destroy: function() {
    var that = this;
    _.each(this.models, function (model) {
      model.destroy();
    });

    this.emit('destroy');
  }
});
