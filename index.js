var fs = require('fs')
var m = require('mustache')

function init(dir) {
	var content = fs.readdirSync(dir)

	try {
		var json = JSON.parse(fs.readFileSync(dir + 'dictum.json'))
	} catch(err) {
		var json = {}
	}

	for(var i = 0; i < content.length; i++) {
		var name = content[i]
		var stat = fs.statSync(dir + name)

		if(['.git', 'README.md', 'LICENSE'].indexOf(name) > -1) {
			continue
		}

		if(stat && stat.isDirectory()) {
			init(dir + name + '/')
		}

		if(json[name] === undefined) {
			json[name] = ''
		}
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
		var name = content[i]
		var stat = fs.statSync(dir + name)

		if(['.git', 'README.md', 'LICENSE'].indexOf(name) > -1) {
			continue
		}

		if(stat && stat.isDirectory()) {
			html += render(dir + name + '/')
		} else {
			html += fs.readFileSync(dir + name).toString()
		}
	}

	return html
}

function parse(dir) {
	var html = ""

	try {
		var json = JSON.parse(fs.readFileSync(dir + 'dictum.json'))
	} catch(err) {
		console.log("No dictum.json, use render")
		return
	}

	for(var name in json) {
		var stat = fs.statSync(dir + name)

		if(['.git', 'README.md', 'LICENSE'].indexOf(name) > -1) {
			continue
		}

		if(stat && stat.isDirectory()) {
			html += parse(dir + name + '/')
		} else {
			html += fs.readFileSync(dir + name).toString()
		}
	}

	return html
}

console.log(init('../content/'))
