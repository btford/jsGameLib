var socket = io.connect('/');

socket.on('listlobbies', function (data) {
  console.log(data);
});

socket.on('newlobby', function (data) {
  console.log(data);
});


var JoinView = Backbone.View.extend({
  el: $('#join'),

  events: {
    'click #lobbysubmit': 'newLobby'
  },

  newLobby: function () {
    var name = this.$('#lobbyname').val();
    console.log(name);

    socket.emit('newlobby', {
      name: name
    });
  }
});

var main = new JoinView();
