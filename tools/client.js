#!/usr/bin/nodejs

var PouchDB = require('pouchdb')
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    _id: new Date().toJSON(),
    dictum_db: 'work',
    dictum_couch: 'http://localhost:5984/'
  }
})

var db = new PouchDB(argv.dictum_couch + argv.dictum_db)

if(argv.lang !== undefined) {
  argv.lang = argv.lang.split(',')
}

delete argv._
delete argv.dictum_db
delete argv.dictum_couch

db.put(argv).then(function(info){
  console.log(info)
})
