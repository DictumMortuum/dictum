const Fs = require('jsonfile')
var Git = require('simple-git')

module.exports = (config, payload) => {
  var git = Git(config.url)

  git.checkout(config.db)
  .then(() => {
    Fs.writeFileSync(config.url + 'latest.json', payload)
  })
  .add('.')
  .commit(JSON.stringify(payload))

  if(config.push) {
    git.raw(['pull', 'origin', config.db, '--rebase', '--strategy=ours'])
    .push('origin', config.db)
  }
}
