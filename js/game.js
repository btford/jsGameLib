
// Example game file

// State: gameloop
///////////////////////////////////////////////////////////////////////////////
var gameloop = new Gameloop();

var thePlayers = new Group({
    update:function(){ this.x += this.v; }, // update
    draw:function(){ this.node.attr("x", this.x); }, // draw
    init:function() {
        this.node = game.canvas.image(this.src, this.x, this.y, this.width, this.height);
        this.v = Math.random()*2;
    },
    elts:[
        new Entity(),
        new Entity(),
        new Entity(),
        new Entity(),
        new Entity()
    ]
});

var theEnemies = {
    update:function(){}, // update
    draw:function(){}, // draw
    init:function(){},
    elts:[]
};

// Interaction function
var sameX = function (player, enemy) {
    if(player.x === enemy.x) {
        alert("same");
    }
};

gameloop.init = function () {

    // Define dynamic groups here
    gameloop.dyn.players = thePlayers;
    gameloop.dyn.enemies = theEnemies;
    
    // Define static groups here
    gameloop.sta.level = []; // tiles on the level
    
    // Define interactions here
    gameloop.inter = [
        new Interaction(
            gameloop.dyn.players, // targets
            gameloop.dyn.enemies,
            sameX // function
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
game.bgm = new Audio("res/aud/bgm.mp3");

game.start();