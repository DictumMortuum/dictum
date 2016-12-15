#!/usr/bin/env node

const conf = require('rc')('dictum', {})
const git = require('simple-git')
const api = {
  'git': require('./api/git'),
  'couchdb': require('./api/couchdb')
}
const argv = require('minimist')(process.argv.slice(2), {
  default: {
    _id: new Date().toJSON()
  }
})

var payload = parse(argv)

// http://radek.io/2015/10/27/nodegit/

for(var i = 0; i < conf.endpoints.length; i++) {
  var c = conf.endpoints[i]
  if(c.skip === undefined) {
    api[c.type](c, payload).then(info => console.log(info))
  }
}

function parse(v) {
  var ret = Object.assign({}, v)

  if(ret.lang !== undefined) {
    ret.lang = ret.lang.split(',')
  }

  delete ret._

  return ret
}
