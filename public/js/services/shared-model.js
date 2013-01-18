/* module implementing shared state */
/* state is shared one-way from server to client. */
/*global angular:false, console:false*/

'use strict';

angular.module('gameApp').factory('sharedModel', function (socket) {

  // unwrapped socket; will not cause digest cycles in AngularJS
  var rawSocket = socket.getRaw();

  var shared = {
    effects: []
  };

  var set = function (obj, path, value) {
    if (!shared) {
      return;
    }
    var lastObj = obj;
    var property;
    path.split('.').forEach(function (name) {
      if (name) {
        lastObj = obj;
        obj = obj[property=name];
        if (!obj) {
          lastObj[property] = obj = {};
        }
      }
    });
    lastObj[property] = value;
  };

  rawSocket.on('init:shared', function (message) {
    shared = message;
  });

  rawSocket.on('update:shared', function (message) {
    angular.forEach(message, function (pairs, path) {
      if (pairs === 'effects') {
        // TODO: better manage effects
        shared.effects.append(path);
      } else if (typeof pairs === 'object') {
        angular.forEach(pairs, function (value, subPath) {
          set(shared, path + '.' + subPath, value);
        });
      } else {
        set(shared, path, pairs);
      }
    });
  });

  return {
    get: function () {
      return shared;
    },
    getMe: function () {
      return shared.players[socket.getId()];
    }
  };
});
