const path = require('path')
const fs = require('fs')

const createCommanderWrapper = require('./commander-wrapper')

const { command, option, alias, handleCommand, run } = createCommanderWrapper('iq')

const newCommand = require('./commands/new')(command, option, alias)
const newHandler = require('./handlers/newHandler')(path, fs)
const startCommand = require('./commands/start')(command, option, alias)
const startHandler = require('./handlers/startHandler')(path, fs)

module.exports = ((): void => {
  handleCommand(newCommand('project <project-name>'))(newHandler)

  handleCommand(startCommand('start'))(startHandler)

  run()
})()
