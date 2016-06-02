#!/usr/bin/nodejs

var nan1 = require('nano')('http://192.168.1.2:5555');
var from = nan1.db.use('work');
var nan2 = require('nano')('http://192.168.1.2:5555');
var to   = nan2.db.use('work_backup');

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

from.list(function(err, body) {
    if (!err) {
    	body.rows.forEach(function(doc) {
            from.get(doc.id, { revs_info: false }, function(err, body) {
                if (!err) {
                    if(body.date !== undefined) {
                        var date = new Date(
                            body.date.year,
                            body.date.month - 1,
                            body.date.day,
                            randomInt(9,18),
                            randomInt(0,59),
                            randomInt(0,59),
                            randomInt(0,999));

                        if(body.date.full !== undefined) {
                            body._id = body.date.full;
                        } else {
                            body._id = date.toJSON();
                        }

                        delete body._rev;
                        delete body.date;

                        if(body.lang !== undefined) {
                            var temp = body.lang;
                            body.lang = [];
                            body.lang.push(temp);
                        }
                    }
                    to.insert(body);
                }
                console.log(body);
        	});
        });
    }
});
