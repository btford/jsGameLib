/*global angular:false*/
'use strict';

angular.module('gameApp').factory('remoteRouter', function (socket, $location) {
  socket.on('change:route', function (message) {
    $location.url(message);
  });
  return {};
});
