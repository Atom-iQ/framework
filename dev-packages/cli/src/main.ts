const path = require('path')
const fs = require('fs')

const createCommanderWrapper = require('./commander-wrapper')

const { command, option, alias, handleCommand, run } = createCommanderWrapper('iq')

const startCommand = require('./commands/start')(command, option, alias)
const startHandler = require('./handlers/startHandler')(path, fs)
const buildCommand = require('./commands/build')(command, option, alias)
const buildHandler = require('./handlers/buildHandler')(path, fs)

module.exports = ((): void => {
  // handleCommand(newCommand('project <project-name>'))(newHandler)

  handleCommand(startCommand('start'))(startHandler)
  handleCommand(buildCommand('build'))(buildHandler)
  run()
})()
