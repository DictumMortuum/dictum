"use strict";

(function() {
  var db = function(local, remote) {
    var db = {}
    var api = {}
    db.local = new PouchDB(local)

    if (remote !== undefined) {
      db.remote = new PouchDB(remote)

      db.sync = db.local.sync(db.remote, {
        live: true,
        retry: true
      }).on('change', function(info) {
        console.log(info)
      }).on('complete', function (info) {
        console.log(info)
      }).on('error', function(err) {
        console.log(err)
      })

      db.changes = db.local.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', function (result) {
        console.log(result)
      }).on('complete', function (info) {
        console.log(info)
      }).on('error', function (err) {
        console.log(err)
      })
    }

    api.query = function(callback, options) {

      if(options.include_docs !== undefined) {
        options.include_docs = true
      }

      db.local.allDocs(options).then(function (result) {
        for (var i = 0; i < result.total_rows; i++) {
          if (result.rows[i] !== undefined) {
            callback(result.rows[i].doc)
          }
        }
      })
    }

    api.insert = function(doc) {
      if(argv.desc !== undefined) {
        return db.local.put(doc)
      }
    }

    api.delete = function(doc) {
      return db.local.delete(doc)
    }

    return api
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = db
  } else {
    window.dictum = window.dictum || {}
    window.dictum.db = db
  }
})();
