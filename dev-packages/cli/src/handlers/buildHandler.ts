import { CommandActionHandler } from '../types/internal'
import { Command } from 'commander'

module.exports =
  (path, fs): CommandActionHandler =>
  (cmd: Command) => {
    const env = cmd.environment || 'production'

    const { build } = require('../webpack-wrapper/compiler')(path, fs)(env)

    build()
  }
