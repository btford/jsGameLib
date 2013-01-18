
/**
 * Module Dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  states = require('./states/');

var app = module.exports = express();
var server = require('http').createServer(app);

// Hook Socket.io into Express
var io = require('socket.io').listen(server);


/**
 * Configuration
 */

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


/**
 * Express Routes
 */

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('/directives/:name', routes.directives);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Socketron States
 */

states.init(io);


/**
 * Start Server
 */

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
