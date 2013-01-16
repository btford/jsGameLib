/*
 * GET home page.
 */

var globsync = require('glob-whatev');

exports.index = function(req, res){

  // strip "public" from the front of files
  var preheaderLength = 'public'.length;

  // grab all the JS files
  var jsFiles = [
    'public/js/lib/**/*.js',
    'public/js/*.js',
    'public/js/controllers/*.js',
    'public/js/directives/*.js',
    'public/js/services/*.js'
  ].reduce(function (old, path) {
    return old.concat(globsync.glob(path).map(function (file) {
      return file.substr(preheaderLength);
    }));
  }, ['/socket.io/socket.io.js']);

  res.render('index', {
    jsFiles: jsFiles
  });
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.directives = function (req, res) {
  var name = req.params.name;
  res.render('directives/' + name);
};
