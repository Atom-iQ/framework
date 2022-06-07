import type { Command } from 'commander'
import type { IQCliConfig } from './public'
import type { Configuration as WebpackConfiguration } from 'webpack'

export interface CommanderWrapper {
  declareCommand: (command: Command) => (...params: ((cmd?: Command) => Command)[]) => Command

  subCommand: (cmd: string, description?: string, config?: unknown) => (parent: Command) => Command

  command: (cmd: string, description?: string, config?: unknown) => Command

  option: (
    opt: string,
    description: string,
    options?: {
      required?: boolean
      parser?: Function
      defaultValue?: unknown
    }
  ) => (cmd?: Command) => Command

  alias: (...aliases: string[]) => (cmd: Command) => Command

  handleCommand: (
    command?: Command
  ) => (actionHandler: (...args: (string | Command)[]) => void | Promise<void>) => Command

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

export interface ConfigJSON {
  compilerOptions?: {
    baseUrl?: string
    [key: string]: string | number | boolean | Object | Array<string | number | boolean | Object>
  }
  include?: Array<string>
  exclude?: Array<string>
}

export interface WorkspacePackageJSON {
  packageJsonPath: string
  parsedPackageJson: PackageJSON
}

export interface WorkspaceConfigJSON {
  configJsonPath: string
  parsedConfigJson: ConfigJSON
}

export interface Workspace extends WorkspacePackageJSON, WorkspaceConfigJSON {
  root: string
  configFileName: string
  parsedCliConfig: IQCliConfig
}

/* -------------------------------------------------------------------------------------------
 * Webpack Wrapper
 * ------------------------------------------------------------------------------------------- */
export interface WebpackConfigGenerator {
  (params: WebpackConfigGeneratorParams): WebpackConfiguration
}

export interface WebpackConfigGeneratorParams {
  mode: 'watch' | 'build'
  envName: keyof IQCliConfig['environments']
  paths: WebpackConfigPaths
  languages: WebpackConfigLanguages
  isVerboseMode?: boolean
  tsOrJsConfig: ConfigJSON
  packageJson: PackageJSON
  publicUrl: string
}

export interface WebpackConfigPaths {
  rootDirPath: string
  relativeEntryFilePath: string
  relativeOutputDirPath: string
  relativeHtmlTemplatePath: string
}

export interface WebpackConfigLanguages {
  isSass: boolean
  isTypescript: boolean
}

export type RawEnv = { [key: string]: string | number | boolean }

// BABEL
export type BabelPreset = string | [string, Object]
export type BabelPresets = BabelPreset[]

export type BabelPlugin = BabelPreset
export type BabelPlugins = BabelPlugin[]

export interface BabelConfig {
  presets: BabelPresets
  plugins: BabelPlugins
  compact?: boolean
}

export interface BabelConfigGenerators {
  applicationFiles: (isTypescript: boolean) => BabelConfig
  dependencies: () => BabelConfig
}
