// Collision detection function based on rectangular model.
//TODO: optimize this
var collision = function (ob1, ob2) {
    
    if (!(
        (ob2.x >= ob1.x && ob2.x < (ob1.x + ob1.width)) ||
        (ob1.x >= ob2.x && ob1.x < (ob2.x + ob2.width))
    )) {
        return false;
    }
    
    if (!(
        (ob2.y >= ob1.y && ob2.y < (ob1.y + ob1.height)) ||
        (ob1.y >= ob2.y && ob1.y < (ob2.y + ob2.height))
    )) {
        return false;
    }
    return true;
};