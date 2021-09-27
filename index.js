const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const colors = require('colors')

const parser = require('./parser.js')

colors.setTheme({
  root: 'blue',
  error: 'red',
  ignored: 'magenta',
  format: 'cyan',
  pass: 'yellow',
  changed: 'green',
})

async function job(configFile, declareOutputFile) {
  try {
    let packagePath = path.resolve(configFile, '../', 'package.json')
    if (!fs.existsSync(packagePath)) {
      fs.writeFileSync(packagePath, `{"type": "module"}`)
    }
    let res = await import('file:///' + configFile + `?update=${Date.now()}`)
    let code = parser(res.default)
    fs.writeFileSync(declareOutputFile, code, { flag: 'w' })
    console.log(`Output: `.changed + `${declareOutputFile}`)
  } catch (e) {
    console.error(e)
  }
  console.log('--------------------')
}

const call = _.debounce(job, 200, {
  leading: true,
  trailing: false,
})

module.exports = class {
  constructor({ configFile, declareOutputFile }) {
    this.configFile = path.resolve(__dirname, configFile)
    this.declareOutputFile = path.resolve(__dirname, declareOutputFile)
    console.log(`Watching: `.root + `${this.configFile}`)
    call(this.configFile, this.declareOutputFile)
  }
  apply(compiler) {
    compiler.hooks.watchRun.tapAsync('Format', (watching, callback) => {
      const changedFiles = Object.keys(watching.watchFileSystem.watcher.mtimes)
      changedFiles.forEach((filepath) => {
        if (this.configFile === path.resolve(__dirname, filepath)) {
          try {
            call(this.configFile, this.declareOutputFile)
          } catch (e) {
            console.error(e)
          }
        }
      })
      callback()
    })
  }
}
