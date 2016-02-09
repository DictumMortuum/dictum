var db = require('../src/db.js')('http://localhost:5984/work')
var moment = require('moment')

db.info().then(function(info) {
  var query = require('../src/query.js')(db)

  query.day(moment().startOf('day') , moment()).then(function(response) {
    query.type(moment().startOf('day') , moment(), response).then(function(response) {
      console.log(response)
    }, function(error) {
      console.error(error)
    })
  }, function(error) {
    console.error(error)
  })
})
