/*jslint white: true, onevar: true, undef: true, newcap: true, nomen: true, regexp: true, plusplus: true, bitwise: true, browser: true, devel: true */

/*global Group: false */

var Level = function (proto, ent, rules) {
    var i, j,
        group_elts = {},
        current_group = null,
        level = {
            sta: {},
            dyn: {}
        };
        
    //DEBUG:
    //console.log(rules);
    
    for (i = 0; i < proto.length; i += 1) {
        for (j = 0; j < proto[i].length; j += 1) {
        
            if (ent[proto[i].charAt(j)]) {
                current_group = ent[proto[i].charAt(j)];
                if (!group_elts[current_group.name]) {
                    group_elts[current_group.name] = [];
                }
                group_elts[current_group.name].push({
                    x: 50 * j,
                    y: 50 * i,
                    src: (rules[current_group.name].src || {def: ["res/img/tile.png"]})
                });
            }
        }
    }

    //DEBUG:
    //console.log(group_elts);

    for (i in group_elts) {
        if (typeof group_elts[i] === 'object') {
        
            //DEBUG:
            //console.log(group_elts[i]);
        
            level[rules[i].type][i] = new Group({
                update: rules[i].update, // update
                draw: rules[i].draw, // draw
                init: rules[i].init,
                remove: rules[i].remove,
                elts: group_elts[i]
            });
        }
    }

    console.log(level);

    return level;
};