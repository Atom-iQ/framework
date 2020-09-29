module.exports = (command, option, alias) => (commandDeclaration: string) => {
  return option(
    '-p --port <port>', 'Specify the port for development server to use', {
      defaultValue: '7777'
    }
  )(alias('serve')(command(commandDeclaration)))
}
