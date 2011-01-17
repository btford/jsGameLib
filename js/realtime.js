/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, devel: true */
/*global Raphael: false, Gameloop: false, Group: false, game: false, Entity: false, State: false, Interaction: false, Audio: false, collision: false, controller: false, KEY: false, Level: false */

// Example game file

// State: gameloop
///////////////////////////////////////////////////////////////////////////////
var gameloop = new Gameloop();

game.levels = [
    [
        "                    ",
        "                    ",
        "                    ",
        "               r    ",
        "                    ",
        "         r          ",
        "                    ",
        "     r              ",
        "                    ",
        "p                   ",
        "gggggggggggggggggggg",
        "gggggggggggggggggggg"
    ],
    [
        "             r      ",
        "                    ",
        "                    ",
        "      r           r ",
        "                    ",
        "   r      r         ",
        "                    ",
        "      r         r   ",
        "                    ",
        "                   p",
        "gggggggggggggggggggg",
        "gggggggggggggggggggg"
    ],
    [
        "             r      ",
        "                    ",
        "                    ",
        "      r           r ",
        "                    ",
        "   r      r         ",
        "                    ",
        "      r     r    r  ",
        "                    ",
        "         p          ",
        "gggg  gggggg   ggggg",
        "gggggggggggggggggggg"
    ]
];

gameloop.init = function () {

    // Define dynamic groups here
    //gameloop.level.dyn.enemies = theEnemies;
    
    // Define static groups here
    gameloop.level = new Level(game.levels[game.level]); // tiles on the level
    
    // Define interactions here
    gameloop.inter = [
        new Interaction(
            gameloop.level.dyn.players, // targets
            gameloop.level.sta.grass,
            function (player, grass) {
                if (collision(player, grass)) {
                    console.log("get off my lawn");
                    
                    //TODO: optimize this
                    player.x -= player.dx; // y:0, x:-
                    if(!collision(player, grass)) {
                        return;
                    }
                    
                    player.x += player.dx; // y:0, x:0
                    player.y -= player.dy; // y:-, x:0
                    if(!collision(player, grass)) {
                        return;
                    }
                    
                    player.x -= player.dx; // y:-, x:-
                }
            }
        ),
        new Interaction(
            gameloop.level.dyn.players, // targets
            gameloop.level.sta.gems,
            function (player, gem) {
                if (collision(player, gem)) {
                    game.score += 10;
                    gem.remove();
                    if (gameloop.level.sta.gems.elts.length == 0) {
                        game.level += 1;
                        if (game.level >= game.levels.length) {
                            game.level = 0;
                        }
                        game.switchState("loop");
                    }
                }
            }
        )
    ];
    
    // Define additional actions to take place when the game is paused.
    gameloop.pauseHandle = function () {
        game.bgm.pause();
    };
    
    gameloop.unpauseHandle = function () {
        game.bgm.play();
    };
};

// Setup game states
game.states = {
    menu: new State(), // main menu state
    loop: gameloop, // game loop state
    pause: new State() // paused sub-state for gameloop
};

// Audio file not included
game.bgm = new Audio(); //("res/aud/bgm.mp3");

game.start();