module.exports = (command, option, alias) => (commandDeclaration: string) => {
  return option(
    '-e --env <environment>',
    'Specify environment configuration to use - default: production',
    {
      defaultValue: 'production'
    }
  )(alias('compile')(command(commandDeclaration)))
}
