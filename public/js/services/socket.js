/*global angular:false, io:false*/
'use strict';

angular.module('gameApp').factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    
    on: function (eventName, callback) {
      var augmentedCallback = function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      };
      callback._augmented = augmentedCallback;
      socket.on(eventName, augmentedCallback);
    },

    off: function (eventName, callback) {
      return socket.removeListener(eventName, callback._augmented);
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },

    getRaw: function () {
      return socket;
    },

    getId: function () {
      return socket.socket.socketid;
    }
  };
});
