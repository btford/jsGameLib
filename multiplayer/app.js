
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

  socket.emit('listlobbies', _.pluck(server.lobbies, 'name'));

  var player = socket.player = new Player({
    socket: socket
  });

  // Create, Update, Destroy
  socket.on('newlobby', function (data) {
    var lobby = new Lobby({
      name: data.name,
      leader: player
    });
    server.lobbies.push(lobby);

    // notify other clients
    socket.broadcast.emit('newlobby', data);
  });

  socket.on('joinlobby', function (data) {});

  socket.on('startgame', function (data) {});
});
