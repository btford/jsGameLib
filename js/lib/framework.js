/*jslint browser: true, indent: 4 */
/*global console: true */

// Interface for various states within a game.
var State = function () {
    // Private
    var state = {};
    
    // Public member functions
    state.start = function () {};
    state.end = function () {};
    
    return state;
    
};

Menu = (function () {

}());

var ProtoEntity = {

};

// Representing visible game item
var Entity = function () {
    var entity = {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        v: 0,
        src: "res/img/ruby.png"
    };
    
    entity.remove = function () {
    
    };
    
    return entity;
};

// Object representing a group of entities
// Provides enumeration over contained Entities
var Group = function (proto) {
    
    // Private
    var group = {},
        drawFn = proto.draw || null,
        updateFn = proto.update || null,
        elts = proto.elts || [],
        initFn = proto.init || null,
        remFn = proto.remove || null;
    
    // Provide public access to elts
    group.elts = elts;
    
    // public methods
    group.add = function (o) {
        elts.push(o);
    };
    
    group.setUpdate = function (fn) {
        updateFn = fn;
    };
    
    group.update = function () {
        for (var i = 0; i < elts.length; i += 1) {
            updateFn.apply(elts[i]);
        }
    };
    
    group.draw = function () {
        for (var i = 0; i < elts.length; i += 1) {
            drawFn.apply(elts[i]);
        }
    };
    
    group.init = function () {
        for (var i = 0; i < elts.length; i += 1) {
            initFn.apply(elts[i]);
        }
    };
    
    group.remove = function () {
        for (var i = 0; i < elts.length; i += 1) {
            remFn.apply(elts[i]);
        }
        delete elts[i];
    };
    
    return group;
};

// Constructor
var Interaction = function (g1, g2, func) {

    var inter = {},
        group1 = g1.elts,
        group2 = g2.elts,
        fn = func;
    
    // Public
    inter.update = function () {
    
        for (var i = 0; i < group1.length; i += 1) {
            for (var j = 0; i < group2.length; i += 1) {
                fn(group1[i], group2[j]);
            }
        }
        
    };
    return inter;
};

// This object represents the gameloop for realtime games
var Gameloop = function () {

    // Private
    var gl = {}, // gameloop; returned object
        cont = true; // Continue: whether or not to continue to the next frame in the gameloop

    gl.init = null;
    
    gl.dyn = {},   // Entities that need to be updated/checked each frame
    gl.sta = {}, // Entities that do not need to be updated/checked each frame
    gl.inter = []; // holds interactions between objects 
    
    // Private member functions
    ///////////////////////////////////////////////////////////////////////////
    var init = function () {
    
        if(gl.init) {
            gl.init();
        }

        // Draw initial state
        for (var j in gl.dyn) {
            if (typeof gl.dyn[j] !== 'function') {
                gl.dyn[j].init();
            }
        }
        
        controller.setMap(32, function() {
            if(gl.isPaused()) {
                 gl.unpause();
            } else {
                gl.pause();
            }
        });
        
    };
    
    var update = function () {
        var i, j, elt;
        
        // update dynamic entity groups
        for (j in gl.dyn) {
            if (typeof gl.dyn[j] === 'object') {
                gl.dyn[j].update();
            }
        }
        
        // update interactions between classes of objects
        for (i = 0; i < gl.inter.length; i += 1) {
            gl.inter[i].update();
        }
    };
    
    var draw = function () {
        var i, j, elt;
    
        // update dynamic entities
        for (j in gl.dyn) {
            if (typeof gl.dyn[j] === 'object') {
                gl.dyn[j].draw();
            }
        }
    };
    
    var loop = function () {
    
        update();
        draw();
    
        if(cont) {
            setTimeout(loop, 1);
        }
    };
    
    var pause = function () {
        // Show pause screen. A sub-state within gameloop
    };
    
    
    // Public member functions
    gl.start = function () {
        init();
        gl.unpause();
    };
    
    gl.end = function () {
        cont = false;
    };
    
    gl.pause = function () {
        if(gl.pauseHandle) {
            gl.pauseHandle();
        }
        cont = false;
        pause();
    };
    
    gl.unpause = function () {
        if(gl.unpauseHandle) {
            gl.unpauseHandle();
        }
        cont = true;
        loop();
    };
    
    gl.isPaused = function () {
        return !cont;
    };
    
    return gl;
    
};

// Root-level object for the game
var game = (function () {
    var game = {},
        initial="loop",
        active;
            
    // Raphael-based container
    // holder is part of the html
    game.canvas = Raphael("holder", 1000, 800);

    // Added in game definition
    game.states = {};
        
    game.bgm = null;
        
    // Public
    game.start = function () {
        active = initial;
        game.states[active].start();
    };
    
    game.switchState = function (state) {
        if(game.states[state]) {
            game.states[active].end();
            active = state;
            game.states[active].start();
        } else {
            console.log("Attempted to enter nonexistent state '"+state+"'");
        }
    };
    
    
    return game;
    
}());


/*
 * Keycodes
 *
 * w          119
 * a          97
 * d          100
 * s          115
 *
 * q          113
 * e          101
 * r          114
 * Space      32
 */

// This object contains the bindings for keypress events.
var controller = (function () {

    // Private members
    var codes = {}, cont = {};

    document.onkeypress = function (e) {
        var c = e.charCode;
        if(codes[c]) {
            codes[c]();
        }
        //Debug:
        //console.log("Keypress: " + c);
    };
    
    // Public member functions
    cont.setMap = function (key, fn) {
        codes[key] = fn;
    };
    
    cont.removeMap = function (key) {
        if(codes[key])
        {
            delete codes[key];
            console.log("Removed map to "+key);
            return true;
        } else {
            console.log("Attempted to remove nonexistent map to "+key);
            return false;
        }
    };
    
    cont.resetMap = function () {
        for (key in codes) {
            //TODO: filter these better, maybe wrap functions in an object
            if(key !== "superior") {
                cont.removeMap(key);
            }
        }
    };
    
    return cont;
}());