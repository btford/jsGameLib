var State = require('./state.js').Model;
var _ = require('underscore');

var ActionState = exports.ActionState = State.excend({
  initialize: function (args) {
    this.game = args.game;
  },

  start: function () {
    this.resume();
  },

  // overwrite this
  run: function () {},
  pause: function () {
    if (this._timerId) {
      clearTimeout(this._timerId);
    }
  },

  resume: function () {
    var that = this;
    this._timerId = setInterval(function () {
      that.run();
    });
  },

  stop: function() {
    this.pause();
  }
});
