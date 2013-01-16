// compile proxy for shared model
var sjs = require('sweet.js');
var fs = require('fs');

fs.writeFileSync(__dirname + '/shared-model.compiled.js',
  sjs.compile(
    fs.readFileSync(__dirname + '/shared-model.sjs')));

module.exports = require('./shared-model.compiled.js');
