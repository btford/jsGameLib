var socket = io.connect('/');

var LobbyView = Backbone.View.extend({
  tagName: 'option',

  initialize: function (args) {
    this.model = args.model;
  },

  render: function () {
    $(this.el).html(this.model.name);
    return this;
  }
});

var LobbyModel = Backbone.Model.extend({
  initialize: function (args) {
    this.name = args.name;
    this.leader = args.leader;
  }
});

var LobbyCollection = Backbone.Collection.extend({
  model: LobbyModel
});


var lobbies = new LobbyCollection();

// Join Screen
// -------------------------------------------------
var JoinView = Backbone.View.extend({
  el: $('#join'),

  events: {
    'click #lobbysubmit': 'emitNewLobby'
  },

  initialize: function () {
    lobbies.bind('add', this.addOne, this);
  },

  addOne: function (lobby) {
    var view = new LobbyView({
      model: lobby
    });

    this.$('select').append(view.render().el);
  },

  emitNewLobby: function () {
    var name = this.$('#lobbyname').val();
    console.log(name);
    socket.emit('lobby:new', {
      name: name
    });
  }
});

var LobbyScreenView = Backbone.View.extend({
  elt: $('#lobby'),

  // idk
  initialize: function () {
    
  },

  // idk
  render: function () {
    
  }
});

// top level view
// -------------------------------------------------
var App = Backbone.View.extend({

  elts: {
    join: $('#join'),
    lobby: $('#lobby')
  },

  shown: $('#join'),

  initialize: function () {
    var that = this.main = new JoinView();
    var lobby = new LobbyScreenView();

    socket.on('lobby:list', function (data) {
      console.log(data);
      lobbies.add(data);
    });

    socket.on('lobby:new', function (lobby) {
      console.log(lobbies);
      lobbies.add(lobby);
    });

    socket.on('lobby:new:success', function () {
      this.show('lobby');
      lobby.render();
    });

    socket.on('error', function (error) {
      alert(error);
    });
  },

  show: function (what) {
    this.shown.addClass('hidden');
    this.shown = this.elts[what];
    this.shown.removeClass('hidden');
  }
});

var app = new App();
