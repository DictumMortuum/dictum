var moment = require('moment')
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    _id: moment().toJSON()
  }
})
var db = require('./db.js')('http://localhost:5984/work')
argv.lang = argv.lang === undefined ? undefined : argv.lang.split(',')
delete argv._
api.insert(argv).then(function(info){
  console.log(info)
})
