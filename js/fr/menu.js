/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, devel: true */


/*
Structure of prototype

var proto = {
    elts: [
        {
            name: '', // Name the group of elts
            nodes: [] // This is where constructed nodes go?
        }
    ]
};

*/

// Menu is a state.
var Menu = function (proto) {

    if (typeof proto === 'undefined') {
        proto = {};
    }

    // Private
    var menu = {},
        elts = proto.elts || [];
    
    // Public member functions
    menu.start = function () {
        for (i = 0; i < elts.length; i += 1) {
            nodes = elts[i].nodes;
            for (j = 0; j < nodes.length; j += 1) {
                nodes[j].remove();
            }
        }
    };
    
    menu.end = function () {
        var i, j, nodes;
        
        for (i = 0; i < elts.length; i += 1) {
            nodes = elts[i].nodes;
            for (j = 0; j < nodes.length; j += 1) {
                nodes[j].remove();
            }
        }
    };
    
    
    
    return menu;
};
