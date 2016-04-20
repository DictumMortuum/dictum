"use strict";

(function() {
  var unit = function(name) {
    var api = {}
    var db = new PouchDB(name)

    api.query = function(callback, options) {

      if(options.include_docs !== undefined) {
        options.include_docs = true
      }

      db.allDocs(options).then(function (result) {
        for (var i = 0; i < result.total_rows; i++) {
          if (result.rows[i] !== undefined) {
            callback(result.rows[i].doc)
          }
        }
      })
    }

    api.insert = function(doc) {
      return db.put(doc)
    }

    api.delete = function(doc) {
      return db.delete(doc)
    }

    api.reference = function() {
      return db
    }

    return api
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    var PouchDB = require('pouchdb')
    module.exports = unit
  } else {
    var PouchDB = window.PouchDB
    window.dictum = window.dictum || {}
    window.dictum.db = unit
  }
})();
