import { Workspace } from '../types/internal'

const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const getWorkspaceFactory = require('../utils/getWorkspace')
const configGenerator = require('./config/generator')
const defaultValues = require('./config/defaults')

const getConfigFromWorkspace = (workspace: Workspace, envName: string) => {
  const rootDirPath = workspace.root || '/'

  const currentEnv =
    workspace.parsedCliConfig.environments && workspace.parsedCliConfig.environments[envName]

  const relativeEntryFilePath =
    workspace.parsedCliConfig.entryFile || defaultValues.DEFAULT_ENTRY_FILE

  const relativeOutputDirPath =
    currentEnv && currentEnv.outputDirectory
      ? currentEnv.outputDirectory
      : defaultValues.DEFAULT_PRODUCTION_OUTPUT

  const relativeHtmlTemplatePath =
    workspace.parsedCliConfig.htmlTemplate || defaultValues.DEFAULT_HTML_TEMPLATE

  const publicUrl =
    currentEnv && currentEnv.appBaseUrl ? currentEnv.appBaseUrl : defaultValues.DEFAULT_PUBLIC_URL

  const isSass = ['sass', 'scss'].includes(workspace.parsedCliConfig.stylesType)

  const isTypescript = workspace.parsedCliConfig.typescript

  return {
    paths: {
      rootDirPath,
      relativeEntryFilePath,
      relativeOutputDirPath,
      relativeHtmlTemplatePath
    },
    languages: {
      isSass,
      isTypescript
    },
    envName,
    tsOrJsConfig: workspace.parsedCliConfig,
    packageJson: workspace.parsedPackageJson,
    publicUrl
  }
}

module.exports = (path, fs) => (envName = 'development') => {
  const workspace: Workspace = getWorkspaceFactory(path, fs)()

  const start = (port: string) => {
    const webpackConfig = configGenerator(
      path,
      fs
    )({
      mode: 'watch',
      ...getConfigFromWorkspace(workspace, envName)
    })

    const webpackCompiler: { watch: Function; run: Function } = Webpack(webpackConfig)

    const server = new WebpackDevServer(webpackCompiler, {
      hot: true,
      port
    })

    server.listen(port, '127.0.0.1', () => {
      console.log('Atom-iQ Dev Server is started')
    })
  }

  return {
    start
  }
}
