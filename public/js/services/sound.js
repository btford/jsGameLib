/*global angular:false, io:false, buzz:false*/
'use strict';

angular.module('gameApp').factory('sound', function ($http) {

  // TODO: create a pool of sounds (maybe ~3 each?)
  var sounds = {};

  // create a pool of sounds
  $http.get('/json/sounds.json')
    .success(function (data) {
      angular.forEach(data, function (soundUrl, soundName) {
        sounds[soundName] = new buzz.sound(soundUrl, {
          formats: ["mp3", "wav"],
          preload: true
        });
      });
    });

  return {
    play: function (soundName, volume) {
      if (sounds[soundName]) {
        sounds[soundName].setVolume(volume || 80)
          .play();
      }
    }
  };
});
