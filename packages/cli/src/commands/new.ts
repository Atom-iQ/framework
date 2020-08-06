module.exports = (command, option, alias) => (commandDeclaration: string) => {
  return option(
    '--no-cli', 'Create project with own webpack and babel config, without CLI control'
  )(alias('create-project')(command(commandDeclaration)))
}
