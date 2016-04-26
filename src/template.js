"use strict";

(function() {
  var unit = function(path) {
    var api = {}

    api.render = function(selector, data, callback) {
      get(path + selector + '.mustache.html', function(err, template) {
        Mustache.parse(template.toString())
        var rendered = Mustache.render(template.toString(), data)
        if(callback !== undefined) {
          callback(rendered)
        } else {
          return rendered
        }
      })
    }

    return api
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    var get = require('fs').readFile
    var Mustache = require('mustache')
    module.exports = unit
  } else {
    var get = function(theUrl, callback) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          callback(null, xmlHttp.responseText);
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send(null);
    }
    var Mustache = window.Mustache
    window.dictum = window.dictum || {}
    window.dictum.template = unit
  }
})();
