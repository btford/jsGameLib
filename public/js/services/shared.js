/* module implementing shared state */
/* state is shared one-way from server to client. */
/*global angular:false, console:false*/

'use strict';

angular.module('gameApp').factory('shared', function (socket) {

  socket = socket.getRaw();
  var shared = {
      effects: []
    },
    active = false;

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

  var onSharedUpdate = function (message) {
    //console.log(message);
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
  };

  var onSharedInit = function (message) {
    shared = message;
    shared.towns.forEach(function (town) {
      if (town.pillagable === undefined) {
        town.pillagable = true;
      }
    });
    shared.effects = [];
  };

  var myShipIndex = 0;

  var onDeclareShipIndex = function (message) {
    myShipIndex = message;
  };

  var init = function () {
    if (!active) {
      socket.on('shared:update', onSharedUpdate);
      socket.on('shared:init', onSharedInit);
      socket.on('shared:shipIndex', onDeclareShipIndex);
      active = true;
    }
  };

  return {
    init: init,
    get: function () {
      init();
      return shared;
    },
    getMe: function () {
      init();
      return shared.players[myShipIndex];
    },
    tearDown: function () {
      //socket.off('shared:update', onSharedUpdate);
      //socket.off('shared:init', onSharedInit);
      //shared = null;
    }
  };
});
