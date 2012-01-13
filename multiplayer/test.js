// gonna test some stuff

var Model = require('./shared/model.js').Model;

var Player = Model.extend({
  initialize: function (prop) {
    this.name = prop.name;
  },
  doStuff: function () {
    return this.name;
  }
});

var SuperMegaPlayer = Player.extend({});

var bob = new SuperMegaPlayer({
  name: "bob"
});

console.log(bob.doStuff());
