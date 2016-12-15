const PouchDB = require('pouchdb')
module.exports = (config, payload) => new PouchDB(config.url + config.db).put(payload)
