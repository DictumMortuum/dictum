#!/usr/bin/nodejs

var req  = require('request');
var data = {}
var date = new Date();
var conf = {
	'db': 'work'
}
var db   = [/*{
	init: function(data, conf) {

		req('https://dl.dropboxusercontent.com/u/20183245/scripts/dyndns/ip.json', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				conf.url = 'http://' + JSON.parse(body).endpoint + ':5984/couch';
				init_db(data, conf)
			} else {
				console.log("Got an error: ", error, ", status code: ", response.statusCode);
			}
		});
	}
},*/{
	init: function(data, conf) {
		conf.url = 'http://localhost:5984'
	//	conf.url = 'http://couch.localtunnel.me'
		init_db(data,conf)
}}]

function startsWith(string, prefix) {
	return string.slice(0, prefix.length) == prefix;
}

function init_db(data, conf) {

	var nano = require('nano')({
		"url": conf.url,
		"parseUrl": false
	});
	var db   = nano.db.use(conf.db);

	db.insert(data, function(err, body) {
		if(!err) {
			console.log("Inserting in " + conf.url + "... Success");
		} else {
			console.log("Inserting in " + conf.url + "... Error");
		}
	});
}

if(process.argv.length % 2 != 0) {
	console.log("Error")
	return
}

for(var i = 2; i < process.argv.length; i+=2) {
	if(startsWith(process.argv[i], '--')) {
		if(process.argv[i] == '--db') {
			conf.db  = process.argv[i+1]
		}
	} else {
		data[process.argv[i]] = process.argv[i+1]
	}
}

if (data['lang'] !== undefined) {
	data['lang'] = data['lang'].split(',');
}

data['_id'] = date.toJSON()

for(var i = 0; i < db.length; i++) {
	if(db[i].init !== undefined) {
		db[i].init(data, conf);
	} else {
		conf.url = db[i].url;
		init_db(data, conf);
	}
}
