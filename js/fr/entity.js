// Representing visible game item
var Entity = function (proto) {
    if (typeof proto === "undefined") {
        proto = {parent: null};
    }
    
    // inherit properties from prototype, then parent, or default.
    var entity = {
        x: (proto.x || 0),
        y: (proto.y || 0),
        width: ((proto.width || proto.parent.width) || 50),
        height: ((proto.height || proto.parent.width) || 50),
        v: 0,
        id: proto.id || 0,
        parent: proto.parent || null,
        src: ((proto.src || proto.parent.src) || {def: ["res/img/ruby.png"]}),
        frame: (proto.frame || 0),
        animate: (proto.animate || false)
    };
    
    entity.remove = function () {
        entity.parent.removeOne(entity.id);
    };
    
    return entity;
};