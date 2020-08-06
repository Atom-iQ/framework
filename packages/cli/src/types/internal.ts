import { Command } from 'commander'

export { Command as CommandInterface } from 'commander'


export interface CommanderWrapper {
  subCommand: (
    cmd: string,
    description?: string,
    config?: unknown
  ) => (parent: Command) => Command

  command: (
    cmd: string,
    description?: string,
    config?: unknown
  ) => Command

  option: (
    opt: string,
    description: string,
    options?: {
      required?: boolean,
      parser?: Function,
      defaultValue?: unknown
    }
  ) => (cmd?: Command) => Command

  alias: (...aliases: string[]) => (cmd: Command)  => Command

  action: (handler: (...args: (string | Command)[]) => void | Promise<void>) =>
    (cmd?: Command) => Command

  run: () => Command
  runAsync: () => Promise<Command>

}

export interface CommandActionHandler {
  (...args: (string | Command)[]): void | Promise<void>
}

export interface CommandSetUpHandler {
  (commandDeclaration: string): Command
}

export interface PackageJSON {
  version?: string
  name?: string
  dependencies?: { [key: string]: string }
  devDependencies?: { [key: string]: string }
}

export interface WorkspacePackageJSON {
  packageJsonPath: string
  parsedPackageJson: PackageJSON
}

export interface Workspace extends WorkspacePackageJSON {
  root: string
  configFileName: string
}


