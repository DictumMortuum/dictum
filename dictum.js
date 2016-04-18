"use strict";

(function(exports){

  var api = {}
  var db = {}

  if(typeof require !== undefined) {
    var Mustache = require('mustache')
    var PouchDB = require('pouchdb')
    var moment = require('moment')
    api.get = require('fs').readFile
  } else {
    api.get = function(theUrl, callback) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send(null);
    }
  }

  exports.template = function(selector, data, callback) {
    api.get('./templates/' + selector + '.mustache.html', function(err, template) {
      if (err) throw err
      Mustache.parse(template.toString())
      var rendered = Mustache.render(template.toString(), data)
      callback(rendered)
    })
  }

  exports.database = function(local, remote) {
    var db.local = new PouchDB(local)
    var db.remote = new PouchDB(remote)
    db.local.sync(db.remote)
    return db.local
  }

  exports.range = function(callback, start, end) {
    var options = {
      include_docs: true
    }

    if(typeof start !== undefined) {
      options.startKey = moment(start).toJSON()
    }

    if(typeof end !== undefined) {
      options.endKey = moment(end).toJSON()
    }

    db.local.allDocs(options).then(function (result) {
      for (var i = 0; i < result.total_rows; i++) {
        if (result.rows[i] !== undefined) {
          callback(result.rows[i].doc)
        }
      }
    }
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

  console.log(moment().startOf('year').format())
  exports.template('btn', {}, console.log)

})(typeof exports === undefined ? this['dictum'] = {} : exports);
