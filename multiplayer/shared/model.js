// Backbone.js-like Model
// ----------------------------------------------------------------------------

var _ = require('underscore');

// Stealin' stuff from Backbone.js
// ----------------------------------------------------------------------------

// Shared empty constructor function to aid in prototype-chain creation.
var ctor = function (){};

var Model = function (attributes) {
  if (!attributes) {
    attributes = {};
  }
  this.initialize(attributes);
};

_.extend(Model.prototype, Events, {

  // Overwrite this
  initialize: function () {},

  // Get the value of an attribute.
  get: function (attr) {
    return this.attributes[attr];
  }
});

// Prototype hacks
// ----------------------------------------------

var inherits = function(parent, protoProps, staticProps) {
  var child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call `super()`.
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function () {
      return parent.apply(this, arguments);
    };
  }

  // Inherit class (static) properties from parent.
  _.extend(child, parent);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function.
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) _.extend(child.prototype, protoProps);

  // Add static properties to the constructor function, if supplied.
  if (staticProps) _.extend(child, staticProps);

  // Correctly set child's `prototype.constructor`.
  child.prototype.constructor = child;

  // Set a convenience property in case the parent's prototype is needed later.
  child.__super__ = parent.prototype;

  return child;
};

// The self-propagating extend function that Backbone classes use.
var extend = function (protoProps, classProps) {
  var child = inherits(this, protoProps, classProps);
  child.extend = this.extend;
  return child;
};

Model.extend = extend;

// Events
// ----------------------------------------------------------------------------

var Events = {

  // Bind an event, specified by a string name, `ev`, to a `callback`
  // function. Passing `"all"` will bind the callback to all events fired.
  bind : function(ev, callback, context) {
    var calls = this._callbacks || (this._callbacks = {});
    var list  = calls[ev] || (calls[ev] = {});
    var tail = list.tail || (list.tail = list.next = {});
    tail.callback = callback;
    tail.context = context;
    list.tail = tail.next = {};
    return this;
  },

  // Remove one or many callbacks. If `context` is null, removes all callbacks
  // with that function. If `callback` is null, removes all callbacks for the
  // event. If `ev` is null, removes all bound callbacks for all events.
  unbind : function(ev, callback, context) {
    var calls, node, prev;
    if (!ev) {
      this._callbacks = null;
    } else if (calls = this._callbacks) {
      if (!callback) {
        calls[ev] = {};
      } else if (node = calls[ev]) {
        while ((prev = node) && (node = node.next)) {
          if (node.callback !== callback) continue;
          if (context && (context !== node.context)) continue;
          prev.next = node.next;
          node.context = node.callback = null;
          // break;
        }
      }
    }
    return this;
  },

  // Trigger an event, firing all bound callbacks. Callbacks are passed the
  // same arguments as `trigger` is, apart from the event name.
  // Listening for `"all"` passes the true event name as the first argument.
  trigger : function(eventName) {
    var node, calls, callback, args, ev, events = ['all', eventName];
    if (!(calls = this._callbacks)) return this;
    while (ev = events.pop()) {
      if (!(node = calls[ev])) continue;
      args = ev == 'all' ? arguments : slice.call(arguments, 1);
      while (node = node.next) {
        if (callback = node.callback) {
          callback.apply(node.context || this, args);
        }
      }
    }
    return this;
  }
};


exports.Model = Model;
