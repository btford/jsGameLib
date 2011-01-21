
//TODO: move this to its own file
var gameloopConfig = (function () {

    var interactions,
        levels,
        rules,
        levelConstructorConfig,
        gameloopConfig;

    interactions = [
        {
            g1: {type: "dyn", name: "player"}, // targets
            g2: {type: "sta", name: "grass"},
            fn: function (player, grass) {
                if (collision(player, grass)) {
                
                    //DEBUG:
                    //console.log("get off my lawn");
                    
                    //TODO: optimize this
                    player.y -= player.dy; // y:0, x:-
                    if (!collision(player, grass)) {
                        return;
                    }
                    
                    player.y += player.dy; // y:0, x:0
                    player.x -= player.dx; // y:-, x:0
                    if (!collision(player, grass)) {
                        return;
                    }
                    
                    player.y -= player.dy; // y:-, x:-
                }
            }
        },
        {
            g1: {type: "dyn", name: "player"}, // targets
            g2: {type: "sta", name: "gems"},
            fn: function (player, gem) {
                if (collision(player, gem)) {
                    game.score += 10;
                    gem.remove();
                    if (gameloop.level.sta.gems.elts.length === 0) {
                        game.level += 1;
                        
                        //TODO: improve API for this.
                        if (game.level >= gameloop.levels) {
                            game.level = 0;
                        }
                        game.switchState("loop");
                    }
                }
            }
        }
    ];

    levels = [
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
    
    rules = {
        player: {
            name: "player",
            type: "dyn",
            src: {
                def: ["res/img/squirrel.png"],
                run: ["res/img/squirrel.png"]
            },
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
                this.node = game.canvas.image(this.src.def[this.frame], this.x, this.y, this.width, this.height);
                this.animate = false;
                this.dx = 0;
                this.dy = 0;
            },
            remove: function () {
                if (this.node) {
                    this.node.remove();
                }
            }
        },
        
        gems: {
            name: "gems",
            type: "sta",
            src: {def: ["res/img/acorn.png"]},
            update: function () {}, // update
            draw: function () {}, // draw
            init: function () {
                this.node = game.canvas.image(this.src.def[this.frame], this.x, this.y, this.width, this.height);
            },
            remove: function () {
                if (this.node) {
                    this.node.remove();
                }
            }
        },
    
        grass: {
            name: "grass",
            type: "sta",
            src: {def: ["res/img/tile.png"]},
            update: function () {}, // update
            draw: function () {}, // draw
            init: function () {
                this.node = game.canvas.image(this.src.def[this.frame], this.x, this.y, this.width, this.height);
            },
            remove: function () {
                if (this.node) {
                    this.node.remove();
                }
            }
        }
    };
    
    levelConstructorConfig = {
        // grass
        g: {
            name: "grass"
        },
        
        // player
        p: {
            name: "player"
        },
        // gem (acorn)
        r: {
            name: "gems"
        }
    };

    gameloopConfig = {

        init: function () {
            // Define dynamic groups here
            //gameloop.level.dyn.enemies = theEnemies;
            
            
            // Define additional actions to take place when the game is paused.
            gameloop.pauseHandle = function () {
                game.bgm.pause();
            };
            
            gameloop.unpauseHandle = function () {
                game.bgm.play();
            };
        },
        
        inter: interactions,
        
        levels: levels,
        levelConstruct: levelConstructorConfig,
        rules: rules
    };

    return gameloopConfig;

}());