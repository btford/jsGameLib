
var socket = io.connect('/');
socket.on('news', function (data) {
  console.log(data);
  
});

var _ = require('underscore');

var JoinView = Backbone.View.extend({
  el: $('#join'),

  events: {
    'click #lobbysubmit': 'newLobby'
  },

  newLobby: function () {
    var name = $('#lobbyname').val();
    console.log(name);
    socket.emit('newlobby', {
      name: name
    });
  }
});