var db = require('../src/db.js')('http://localhost:5984/work')

function countDay(startTime, endTime) {
  var lookup = []

  function callback(doc) {
    var day = doc._id.slice(0,10)

    if(lookup[day] === undefined) {
      lookup[day] = 1
    } else {
      lookup[day]++
    }
  }

  return new Promise(function(resolve, reject) {
    db.query(callback, {}).then(function() {
      resolve(lookup)
    })
  })
}

function countTool(startTime, endTime) {
  var lookup = []

  function callback(doc) {
    if(doc.lang !== undefined) {
      for(var i = 0; i < doc.lang.length; i++) {
        var lang = doc.lang[i].toLowerCase()

        if(lookup[lang] === undefined) {
          lookup[lang] = 1
        } else {
          lookup[lang]++
        }
      }
    }
  }

  return new Promise(function(resolve, reject) {
    db.query(callback, {}).then(function() {
      resolve(lookup)
    })
  })
}

function countType(startTime, endTime, weight) {
  var lookup = []

  function callback(doc) {
    if(doc.type !== undefined) {
      var day = doc._id.slice(0,10)
      var w = 1 / weight[day] || 1

      if(lookup[doc.type] === undefined) {
        lookup[doc.type] = w
      } else {
        lookup[doc.type] += w
      }
    }
  }

  return new Promise(function(resolve, reject) {
    db.query(callback, {}).then(function() {
      resolve(lookup)
    })
  })
}

countDay().then(function(response) {
  countType(null, null, response).then(function(response) {
    console.log(response)
  }, function(error) {
    console.error(error)
  })
}, function(error) {
  console.error(error)
})

countTool().then(function(response) {
  console.log(response)
}, function(error) {
  console.error(error)
})

countDay().then(function(response) {
  console.log(response)
}, function(error) {
  console.error(error)
})
