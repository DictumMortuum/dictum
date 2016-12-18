#!/usr/bin/env node

const conf = require('rc')('dictum', { 'push': false })
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

for(var i = 0; i < conf.endpoints.length; i++) {
  var c = Object.assign(conf.endpoints[i], { 'push': conf.push })

  if(c.skip === undefined) {
    api[c.type](c, payload)
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
