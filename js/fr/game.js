// Root-level object for the game
var game = (function () {
    var game = {},
        initial = "loop",
        active;
            
    // Raphael-based container
    // holder is part of the html
    game.canvas = new Raphael("holder", 1000, 600);

    // Added in game definition
    game.states = {};
    
    game.level = 0;
    game.score = 0;
        
    game.bgm = null;
    
    game.levels = [];
        
    // Public
    game.start = function () {
        active = initial;
        game.states[active].start();
    };
    
    game.switchState = function (state) {
        if (game.states[state]) {
            game.states[active].end();
            active = state;
            game.states[active].start();
        } else {
            console.log("Attempted to enter nonexistent state '" + state + "'");
        }
    };
    
    game.getState = function () {
        return game.states[active];
    }
    
    return game;
    
}());