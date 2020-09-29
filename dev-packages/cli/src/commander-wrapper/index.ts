import { Command } from 'commander'
import { CommanderWrapper } from '../types/internal'

const { createCommand } = require('commander')

let program: Command = null

module.exports = (mainCommandName: string): CommanderWrapper => {
  if (!program) {
    program = createCommand(mainCommandName)
  }

  const declareCommand = (command: Command) => (
    ...params: ((cmd?: Command) => Command)[]
  ): Command => params.reduce((cmd, param) => param(cmd), command)

  const subCommand = (cmd: string, description?: string, config?: unknown) => (
    parent: Command
  ): Command => parent.command(cmd, description, config)

  const command = (cmd: string, description?: string, config?: unknown): Command =>
    subCommand(cmd, description, config)(program)

  const option = (
    opt: string,
    description: string,
    options?: {
      required?: boolean
      parser?: Function
      defaultValue?: unknown
    }
  ) => (cmd?: Command) => {
    cmd = cmd || program
    if (!options) {
      return cmd.option(opt, description)
    }

    let restArgs = []
    if (options.parser) restArgs = [options.parser]
    if (options.defaultValue) restArgs = [...restArgs, options.defaultValue]
    return options.required
      ? cmd.requiredOption(opt, description, ...restArgs)
      : cmd.option(opt, description, ...restArgs)
  }

  const alias = (...aliases) => (cmd: Command) => {
    if (aliases.length === 0) {
      return cmd
    }

    if (aliases.length === 1) {
      return cmd.alias(aliases[0])
    }
    return cmd.aliases(aliases)
  }

  const handleCommand = (command?: Command) => (
    actionHandler: (...args: (string | Command)[]) => void | Promise<void>
  ) => (command ? command.action(actionHandler) : program.action(actionHandler))

  const run = () => program.parse(process.argv)
  const runAsync = async () => program.parseAsync(process.argv)

  return {
    declareCommand,
    subCommand,
    command,
    option,
    alias,
    handleCommand,
    run,
    runAsync
  }
}
