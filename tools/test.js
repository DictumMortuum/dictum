var http = require('http')
var pouch = require('pouchdb')
var req = http.get("http://www.w3schools.com/xml/note.xml", function(res) {
  // save the data
  var xml = '';
  res.on('data', function(chunk) {
    xml += chunk;
  });

  res.on('end', function() {
	var db = new pouch("http://localhost:5984/demo")
	var attachment = new Buffer(xml)
	db.putAttachment('d004e8bf', 'blabla.xml', attachment, 'text/xml').then(function(result) { console.log(result) }).catch(function (err) { console.log(err) })
	//db.put({ _id: "poutses", xml: xml })
  });
});

req.on('error', function(err) {
  // debug error
});
