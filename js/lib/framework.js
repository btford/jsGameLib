/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, devel: true */

/*global Raphael: false, game: true */

var Level = function (proto) {
    var i, j,
        grass_elts = [],
        gem_elts = [],
        plr_elts = [],
        level = {
            sta: {},
            dyn: {}
        };
    
    for (i = 0; i < proto.length; i += 1) {
        for (j = 0; j < proto[i].length; j += 1) {
            switch (proto[i].charAt(j)) {
                // grass
                case 'g':
                    grass_elts.push({
                        x: 50 * j,
                        y: 50 * i,
                        src: {def: ["res/img/tile.png"]}
                    });
                break;
                // player
                case 'p':
                    plr_elts.push({
                        x: 50 * j,
                        y: 50 * i,
                        src: {
                            def: ["res/img/squirrel.png"],
                            run: ["res/img/squirrel.png"]
                        }
                    });
                break;
                // gem (acorn)
                case 'r':
                    gem_elts.push({
                        x: 50 * j,
                        y: 50 * i,
                        src: {def: ["res/img/acorn.png"]}
                    });
                break;
                default:
                break;
            }
        }
    }
    
    level.dyn.players = new Group({
        update: function () {
            var speed = 1;

            this.animate = false;
        
            this.dy = 0;
            this.dx = 0;
        
            if (controller.getState(KEY.UP)) {
                this.dy += -speed;
                this.animate = "run";
            }
            if (controller.getState(KEY.DOWN)) {
                this.dy += speed;
                this.animate = "run";
            }
            if (controller.getState(KEY.RIGHT)) {
                this.dx += speed;
                this.animate = "run";
            }
            if (controller.getState(KEY.LEFT)) {
                this.dx += -speed;
                this.animate = "run";
            }
            
            if (this.animate) {
                this.frame += 1;
                if (this.frame > this.src[this.animate].length) {
                    this.frame = 0;
                }
            }
            this.x += this.dx;
            this.y += this.dy;
            
        }, // update
        draw: function () {
            this.node.attr("x", this.x);
            this.node.attr("y", this.y);
            if (this.animate) {
                this.node.attr("src", this.src[this.animate][this.frame]);
            }
        }, // draw
        init: function () {
            this.node = game.canvas.image(this.src["def"][this.frame], this.x, this.y, this.width, this.height);
            this.animate = false;
            this.dx = 0;
            this.dy = 0;
        },
        elts: plr_elts
    });
    
    level.sta.grass = new Group({
        update: function () {}, // update
        draw: function () {}, // draw
        init: function () {
            this.node = game.canvas.image(this.src["def"][this.frame], this.x, this.y, this.width, this.height);
        },
        remove: function () {
            if (this.node) {
                this.node.remove();
            }
        },
        elts: grass_elts
    });
    
    level.sta.gems = new Group({
        update: function () {}, // update
        draw: function () {}, // draw
        init: function () {
            this.node = game.canvas.image(this.src["def"][this.frame], this.x, this.y, this.width, this.height);
        },
        remove: function () {
            if (this.node) {
                this.node.remove();
            }
        },
        elts: gem_elts
    });
    
    return level;
};

// Interface for various states within a game.
var State = function () {
    // Private
    var state = {};
    
    // Public member functions
    state.start = function () {};
    state.end = function () {};
    
    return state;
    
};

var Menu = (function () {

}());

// This object represents the gameloop for realtime games
var Gameloop = function () {

    // Private
    var gl = {}, // gameloop; returned object
        cont = true, // Continue: whether or not to continue to the next frame in the gameloop
        // Private member functions
        init,
        update,
        draw,
        loop,
        loopTimeout,
        pause;
        

    gl.init = null;
    
    // Private member functions
    ///////////////////////////////////////////////////////////////////////////
    init = function () {
    
        var i;
    
        gl.level = {
            dyn: {}, // Entities that need to be updated/checked each frame
            sta: {} // Entities that do not need to be updated/checked each frame
        };
        gl.inter = []; // holds interactions between objects
    
        if (gl.init) {
            gl.init();
        }

        // Draw initial state
        for (i in gl.level.dyn) {
            if (typeof gl.level.dyn[i] !== 'function') {
                gl.level.dyn[i].init();
            }
        }
        for (i in gl.level.sta) {
            if (typeof gl.level.sta[i] !== 'function') {
                gl.level.sta[i].init();
            }
        }

        controller.setMap(KEY.PAUSE, function () {
            if (gl.isPaused()) {
                 gl.unpause();
            } else {
                gl.pause();
            }
        });
        
    };
    
    update = function () {
        var i, j;
        
        // update dynamic entity groups
        for (j in gl.level.dyn) {
            if (typeof gl.level.dyn[j] === 'object') {
                gl.level.dyn[j].update();
            }
        }
        
        // update interactions between classes of objects
        for (i = 0; i < gl.inter.length; i += 1) {
            gl.inter[i].update();
        }
    };
    
    draw = function () {
        var i;
    
        // update dynamic entities
        for (i in gl.level.dyn) {
            if (typeof gl.level.dyn[i] === 'object') {
                gl.level.dyn[i].draw();
            }
        }
    };
    
    loop = function () {
    
        // call each dynamic object's update function
        // perform interaction functions on each object pair
        update();
        
        // re-draw each object (update the Raphael nodes)
        draw();
        
    };
    
    pause = function () {
        // Show pause screen. A sub-state within gameloop
    };
    
    
    // Public member functions
    gl.start = function () {
        init();
        gl.unpause();
    };
    
    gl.end = function () {
        
        // clear the timeout function
        clearInterval(loopTimeout);
        cont = false;
        
        game.canvas.clear();
        
        
        controller.resetMap();
    };
    
    gl.pause = function () {
        if (gl.pauseHandle) {
            gl.pauseHandle();
        }
        cont = false;
        clearInterval(loopTimeout);
        pause();
    };
    
    gl.unpause = function () {
        if (gl.unpauseHandle) {
            gl.unpauseHandle();
        }
        cont = true;
        loopTimeout = setInterval(loop, 1);
    };
    
    gl.isPaused = function () {
        return !cont;
    };
    
    return gl;
};

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
    
    
    return game;
    
}());
