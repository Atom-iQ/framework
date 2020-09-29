module.exports = (declareCommand, command, option, alias) => (commandDeclaration: string) => {
  return declareCommand(command(commandDeclaration))(
    alias('new'),
    option('--no-cli', 'Create project with own webpack and babel config, without CLI control')
  )
}
