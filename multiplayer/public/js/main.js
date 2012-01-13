var socket = io.connect('/');

var LobbyView = Backbone.View.extend({
  tagName: 'option',

  initialize: function (args) {
    this.model = args.model;
    this.model.bind('remove', this.remove, this);
  },

  render: function () {
    $(this.el).html(this.model.name);
    $(this.el).attr('value', this.model.id);
    return this;
  }
});

var LobbyModel = Backbone.Model.extend({
  initialize: function (args) {
    this.name = args.name;
    this.leader = args.leader;
    this.players = args.players;
    this.id = this.leader;
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
    'click #lobbysubmit': 'emitNewLobby',
    'click #lobbyjoin': 'joinLobby'
  },

  initialize: function () {
    lobbies.bind('add', this.addOne, this);
  },

  joinLobby: function () {
    var id = this.$('select').val();
    socket.emit('lobby:join', {
      id: id
    });
  },

  addOne: function (lobby) {
    var view = new LobbyView({
      model: lobby
    });

    this.$('select').append(view.render().el);
  },

  emitNewLobby: function () {
    var name = this.$('#newlobbyname').val();
    socket.emit('lobby:new', {
      name: name
    });
  }
});

// In a lobby waiting for players
// -------------------------------------------------

var LobbyScreenView = Backbone.View.extend({
  elt: $('#lobby'),

  // idk
  initialize: function (args) {
    //this.model = args.model;

    socket.on('lobby:join', function (player) {
      console.log(player);
    });
  },

  // idk
  render: function () {
    $('#lobbyname').html(this.model.name);
    console.log(this.model.players);
    $('#lobbyplayers').html(_.reduce(this.model.players, function (memo, player) {
      return memo + "<li>" + player.name + "</li>";
    }, ''));
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
    var that = this;
    this.main = new JoinView();
    var lobby = new LobbyScreenView();

    socket.on('lobby:list', function (data) {
      lobbies.add(data);
    });

    socket.on('lobby:new', function (data) {
      lobbies.add(data);
    });

    socket.on('lobby:destroy', function (data) {
      lobbies.remove(lobbies.get(data.id));
    });

    socket.on('lobby:new:success', function (data) {
      console.log(data);
      lobby.model = new LobbyModel(data);
      lobby.render();
      that.show('lobby');
    });

    socket.on('lobby:join:success', function (data) {
      lobby.model = new LobbyModel(data);
      lobby.render();
      that.show('lobby');
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
