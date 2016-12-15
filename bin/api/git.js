const fs = require('jsonfile')

module.exports = (config, payload) => {
  var git = require('simple-git')('/space/openbet/work')
  fs.writeFileSync('/space/openbet/work/latest.json', payload)
  return git.pull('origin', config.db).add('.').commit(JSON.stringify(payload))
}
