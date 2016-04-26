"use strict";

(function() {
  var unit = function(path) {
    var api = {}

    api.func = function(selector, data, callback) {

    }

    return api
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = unit
  } else {
    window.dictum = window.dictum || {}
    window.dictum.template = unit
  }
})();
