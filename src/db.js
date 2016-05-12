"use strict";

(function() {
  var unit = function(name) {
    var api = {}
    var db = new PouchDB(name)

    function parse(options) {
      if(options.start !== undefined) {
        options.startkey = moment(options.start).toISOString()
        delete options.start
      }

      if(options.end !== undefined) {
        options.endkey = moment(options.end).toISOString()
        delete options.end
      }

      if(options.include_docs === undefined) {
        options.include_docs = true
      }

      return options
    }

    api.changes = function() {
      return db.changes({
        since: 'now',
        live: true,
        include_docs: true
      })
    }

    api.query = function(callback, options) {
      return db.allDocs(parse(options)).then(function (result) {
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
      return db.remove(doc)
    }

    api.remove = function(id, rev) {
      return db.remove(id, rev)
    }

    api.reference = function() {
      return db
    }

    api.init = function() {
      return db.info()
    }

    return api
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    var PouchDB = require('pouchdb')
    var moment = require('moment')
    module.exports = unit
  } else {
    var PouchDB = window.PouchDB
    var moment = window.moment
    window.dictum = window.dictum || {}
    window.dictum.db = unit
  }
})();
