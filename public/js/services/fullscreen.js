/*global angular:false, Image:false*/
'use strict';

angular.module('gameApp').factory('fullscreen', function ($window, $rootScope) {

  var setting = false;
  var $body = angular.element($window.document.body);

  var api = {
    get: function () {
      return setting;
    },
    set: function (newSetting) {
      setting = newSetting;
      if (setting) {
        $body.addClass('fullscreen');
      } else {
        $body.removeClass('fullscreen');
      }
    },
    toggle: function () {
      api.set(!api.get());
    }
  };

  $window.document.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 27) {
      $rootScope.$apply(function () {
        api.set(false);
      });
    }
  });

  return api;
});
