/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, devel: true */
/*global Raphael: false, Gameloop: false, Group: false, game: false, Entity: false, State: false, Interaction: false, Audio: false, collision: false, controller: false, KEY: false, Level: false */

// Example game file

// State: gameloop
///////////////////////////////////////////////////////////////////////////////

gameloop = new Gameloop(gameloopConfig);

// Setup game states
game.states = {
    menu: new State(), // main menu state
    loop: gameloop, // game loop state
    pause: new State() // paused sub-state for gameloop
};

// Audio file not included
game.bgm = new Audio(); //("res/aud/bgm.mp3");

game.start();