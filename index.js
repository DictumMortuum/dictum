var fs = require('fs')
var m = require('mustache')

var _json = (dir, json) => {fs.writeFileSync(dir + 'dictum.json', JSON.stringify(json))}

function init(dir) {
	var content = fs.readdirSync(dir)

	try {
		var json = JSON.parse(fs.readFileSync(dir + 'dictum.json'))
	} catch(err) {
		var json = {}
	}

	for(var i = 0; i < content.length; i++) {
		var stat = fs.statSync(dir + content[i])
		var name = content[i]

		if(stat && stat.isDirectory()) {
			init(dir + content[i] + '/')
		}

		json.name = ''
	}

	fs.writeFileSync(dir + 'dictum.json', JSON.stringify(json))
}

function render(dir) {
	var content = fs.readdirSync(dir)
	var html = ""

	try {
		var json = JSON.parse(fs.readFileSync(dir + 'dictum.json'))
	} catch(err) {
		var json = {}
	}

	for(var i = 0; i < content.length; i++) {
		var stat = fs.statSync(dir + content[i])
		var name = content[i]

		if(stat && stat.isDirectory()) {
			html += render(dir + content[i] + '/')
		} else {
			html += fs.readFileSync(dir + name).toString()
		}
	}

	return html
}

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
