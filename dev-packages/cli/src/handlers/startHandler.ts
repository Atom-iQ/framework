import { CommandActionHandler } from '../types/internal'
import { Command } from 'commander'

module.exports =
  (path, fs): CommandActionHandler =>
  (cmd: Command) => {
    const { start } = require('../webpack-wrapper/compiler')(path, fs)('development')

    start(cmd.port)
  }
