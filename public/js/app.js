'use strict';

// Declare app level module
angular.module('gameApp', []).config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'partials/lobby-list',
      controller: 'LobbyListCtrl'
    })
    .when('/lobby/:id', {
      templateUrl: 'partials/lobby',
      controller: 'LobbyCtrl'
    })
    .when('/game/:id', {
      templateUrl: 'partials/game',
      controller: 'GameCtrl'
    })
    .when('/game-over/:id', {
      templateUrl: 'partials/game-over',
      controller: 'GameOverCtrl'
    })
    .when('/test-sprite', {
      templateUrl: 'partials/test-sprite',
      controller: 'TestSpriteCtrl'
    })
    .when('/loading', {
      templateUrl: 'partials/loading'
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
