#!/usr/bin/nodejs
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    _id: new Date().toJSON()
  }
})

var db = require('../src/db.js')('http://localhost:5984/work')

if(argv.lang !== undefined) {
  argv.lang = argv.lang.split(',')
}

delete argv._

db.insert(argv).then(function(info){
  console.log(info)
})
