"use strict";

(function(exports){

  var db = {}
  var web = true
  db.prefix = ''

  if(typeof require !== undefined) {
    var PouchDB = require('pouchdb')
    var moment = require('moment')
    var argv = require('minimist')(process.argv.slice(2), {
      default: {
        _id: moment().toJSON()
      }
    })

    if(argv.lang !== undefined) {
      argv.lang = argv.lang.split(',')
    }

    delete argv._
    db.prefix = '/tmp/'
    web = false
  }

  exports.init = function(local, remote) {
    db.local = new PouchDB(db.prefix + local)

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

    return db.local
  }

  exports.query = function(callback, options) {

    if(options.include_docs !== undefined) {
      options.include_docs = true
    }

    /*
    if(typeof start !== undefined) {
      options.startKey = moment(start).toJSON()
    }

    if(typeof end !== undefined) {
      options.endKey = moment(end).toJSON()
    }*/

    db.local.allDocs(options).then(function (result) {
      for (var i = 0; i < result.total_rows; i++) {
        if (result.rows[i] !== undefined) {
          callback(result.rows[i].doc)
        }
      }
    })
  }

  exports.insert = function(doc) {
    if(argv.desc !== undefined) {
      return db.local.put(doc)
    }
  }

  exports.delete = function(doc) {
    return db.local.delete(doc)
  }

  exports.count = {}

  exports.count.day = function(start, end) {
    return db.local.query({
      map: function (doc, emit) {
        emit(doc._id.slice(0, 10))
      },
      reduce: '_count'
    }, {
      group: true,
      reduce: true
    })
  }

  exports.count.tool = function(startTime, endTime) {
    return db.local.query({
      map: function (doc, emit) {
        if (doc._id > startTime && doc._id < endTime) {
          if (doc.lang !== undefined) {
            for (var i = 0; i < doc.lang.length; i++) {
              emit(doc.lang[i].toLowerCase())
            }
          }
        }
      },
      reduce: '_count'
    }, {
      group: true,
      reduce: true
    })
  }

  exports.count.type = function(startTime, endTime, weight) {
    return db.local.query({
      map: function (doc, emit) {
        if (doc._id > startTime && doc._id < endTime) {
          emit(doc.type, 1 / (weight[doc._id.slice(0, 10)] || 1))
        }
      },
      reduce: '_sum'
    }, {
      group: true,
      reduce: true
    })
  }

  if(!web) {
    exports.init('http://localhost:5984/work')
    exports.insert(argv).then(function(info){
      console.log(info)
    })
  }

})(typeof exports === undefined ? this['dictum']['db'] = {} : exports);
