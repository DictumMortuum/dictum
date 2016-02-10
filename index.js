var fs = require('fs')
var m  = require('mustache')

function parse(dir) {
	var data = JSON.parse(fs.readFileSync(dir + 'dictum.json'))
	var html = ''

	for(var i = 0; i < data.length; i++) {
		if(data[i].name.startsWith('[')) {
			var subdir = data[i].name.substring(1,data[i].name.length-1)
			html += parse(dir + subdir + '/')
		} else {
			html += fs.readFileSync(dir + data[i].name + '.md').toString()
		}
	}

	return html
}

console.log(parse('../content/'))
