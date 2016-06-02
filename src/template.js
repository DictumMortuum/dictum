"use strict";

(function() {
  var unit = function(path) {
    var api = {}
    var cache = {}

    api.load = function(selector) {
      return new Promise(function(resolve, reject) {
        get(path + selector + '.mustache.html', function(err, template) {
          if(err) {
            reject(err)
          } else {
            cache[selector] = template.toString()
            resolve(template)
          }
        })
      })
    }

    api.render = function(selector, data) {
      var template = cache[selector]
      Mustache.parse(template)
      return Mustache.render(template, data)
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
