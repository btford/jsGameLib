
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration
// ----------------------------------------------------------------------------

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
// ----------------------------------------------------------------------------

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Browserify Middleware
// ----------------------------------------------------------------------------

app.use(require('browserify')(__dirname + '/client.js'));

// Sockets
// ----------------------------------------------------------------------------

var io = require('socket.io').listen(app);

var server = {
  nextId: 0,
  lobbies: []
};

var Lobby = require('./shared/lobby.js').Lobby;
var Player = require('./shared/player.js').Player;
var _ = require('underscore');

io.sockets.on('connection', function (socket) {

  /*
  socket.on('lobby:join', function (data) {
    that.join(data.player);
  });

  socket.on('lobby:start:game', function (data) {
    that.start();
  });
  */

  socket.emit('lobby:list',
    _.map(server.lobbies, function (lobby) {
      return lobby.toSend();
    }));

  var player = socket.player = new Player({
    socket: socket
  });

  // Create, Update, Destroy
  socket.on('lobby:new', function (data) {

    if (_.any(server.lobbies, function(lobby) {
      return lobby.name === data.name;
    })) {
      socket.emit('error', 'A lobby with that name already exists');
    } else {
      var lobby = new Lobby({
        name: data.name,
        leader: player
      });
      player.lobby = lobby;
      server.lobbies.push(lobby);

      socket.emit('lobby:new:success');

      // notify all clients
      socket.broadcast.emit('lobby:new', lobby.toSend());
    }
  });

  socket.on('disconnect', function () {
    player.destroy();
  });
});
