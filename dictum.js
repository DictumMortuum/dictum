"use strict";

(function(exports){

  var api = {}

  if(typeof require !== undefined) {
    var Mustache = require('mustache')
    var PouchDB = require('pouchdb')
    var moment = require('moment')
    api.get = require('fs').readFile
  } else {
    api.get = function httpGetAsync(theUrl, callback) {
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
    var localDB = new PouchDB(local)
    var remoteDB = new PouchDB(remote)
    localDB.sync(remoteDB)
    return localDB
  }

  console.log(moment().startOf('year').format())
  exports.template('btn', {}, console.log)

})(typeof exports === undefined ? this['dictum'] = {} : exports);
