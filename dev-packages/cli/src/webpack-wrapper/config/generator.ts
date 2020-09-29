import type { BabelConfigGenerators, RawEnv, WebpackConfigGenerator } from '../../types/internal'
import type { Loader, RuleSetRule } from 'webpack'

const resolve = require('resolve')
const autoprefixer = require('autoprefixer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const PnpWebpackPlugin = require('pnp-webpack-plugin')
const {
  DefinePlugin,
  HotModuleReplacementPlugin,
  IgnorePlugin
} = require('webpack')
const getBabelConfig = require('./babel-config')
const InterpolateHtmlPlugin = require('./InterpolateHtmlPlugin')

const getFilePath = (entryFile: string) => entryFile.startsWith('./') ?
  entryFile.substr(2) : entryFile

// style files regexes
const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/
const sassRegex = /\.(scss|sass)$/
const sassModuleRegex = /\.module\.(scss|sass)$/

// JS/TS Modules Extensions
const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
]

const getStyleLoaders = (mode: 'watch' | 'build', cssOptions: Object, preProcessor?: string) => {
  const loaders: Loader[] = [
    mode === 'watch' ? require.resolve('style-loader') : MiniCssExtractPlugin.loader,
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          autoprefixer({
            flexbox: 'no-2009'
          })
        ]
      }
    }
  ]
  if (preProcessor) {
    loaders.push(require.resolve(preProcessor))
  }
  return loaders
}

const getCommonRules = (
  mode: 'watch' | 'build',
  isTypescript: boolean,
  isSass: boolean,
  srcPath: string,
  babelConfig: BabelConfigGenerators
): RuleSetRule[] => {
  const fileAssets: RuleSetRule = {
    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2|bmp)$/i,
    loader: require.resolve('url-loader'),
    options: {
      limit: 10000,
      name: 'static/media/[name].[hash:8].[ext]'
    }
  }

  const threadLoader = mode === 'watch' ? {
    loader: require.resolve('thread-loader'),
    options: {
      poolTimeout: Infinity
    },
  } : require.resolve('thread-loader')

  const applicationFiles: RuleSetRule = {
    test: isTypescript ? /\.(mjs|(ts|js)x?)$/ : /\.(mjs|jsx?)$/,
    include: srcPath,
    use: [
      threadLoader,
      {
        loader: require.resolve('babel-loader'),
        options: {
          ...babelConfig.applicationFiles(isTypescript),
          cacheDirectory: true,
          highlightCode: true
        }
      }
    ]
  }

  const dependencies: RuleSetRule = {
    test: /\.js$/,
    use: [
      threadLoader,
      {
        loader: require.resolve('babel-loader'),
        options: {
          ...babelConfig.dependencies(),
          cacheDirectory: true,
          highlightCode: true
        }
      }
    ]
  }

  const cssRules: RuleSetRule[] = [
    {
      test: cssRegex,
      exclude: cssModuleRegex,
      use: getStyleLoaders(mode, {
        importLoaders: 1,
        sourceMap: true
      })
    },
    {
      test: cssModuleRegex,
      use: getStyleLoaders(mode,{
        importLoaders: 1,
        sourceMap: true,
        modules: true,
        getLocalIdent: () => '' // TODO: Implement getLocalIndent
      })
    }
  ]

  const sassRules: RuleSetRule[] = isSass ? [
    {
      test: sassRegex,
      exclude: sassModuleRegex,
      use: getStyleLoaders(mode, {
        importLoaders: 2,
        sourceMap: true
      },
      'sass-loader'
      )
    },
    {
      test: sassModuleRegex,
      use: getStyleLoaders(mode,
        {
          importLoaders: 2,
          sourceMap: true,
          modules: true,
          getLocalIdent: () => '' // TODO: Implement getLocalIndent
        },
        'sass-loader'
      )
    }
  ] : []

  const fileFallback: RuleSetRule = {
    loader: require.resolve('file-loader'),
    exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
    options: {
      name: 'static/media/[name].[hash:8].[ext]'
    }
  }

  return [
    fileAssets,
    applicationFiles,
    dependencies,
    ...cssRules,
    ...sassRules,
    fileFallback
  ]
}

const getWatchPlugins = (
  htmlTemplatePath: string,
  rawEnv: RawEnv,
  stringifiedEnv: { 'process.env': { [key: string]: string } },
  publicUrl: string
) => {
  return [
    new HtmlWebpackPlugin({
      inject: true,
      template: htmlTemplatePath
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, rawEnv),
    new DefinePlugin(stringifiedEnv),
    new HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: publicUrl,
      generate: (seed, files, entrypoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path
          return manifest
        }, seed)

        const entrypointFiles = entrypoints.main.filter(
          fileName => !fileName.endsWith('.map')
        )

        return {
          files: manifestFiles,
          entrypoints: entrypointFiles
        }
      }
    }),
    new IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

const getTsCheckerPlugin = (
  path,
  mode: 'watch' | 'build',
  rootDirPath: string
) => new ForkTsCheckerWebpackPlugin({
  typescript: {
    enabled: true,
    configFile: path.join(
      rootDirPath,
      'tsconfig.json'
    ),
    context: rootDirPath,
    profile: true,
    diagnosticOptions: {
      syntactic: true
    }
  },
  async: mode === 'watch',
  logger: {
    devServer: mode === 'watch',
    infrastructure: 'silent',
    issues: 'silent'
  }
})

const loadDotEnvFiles = (path, fs, rootDirPath) => {
  const NODE_ENV = process.env.NODE_ENV
  const baseDotenvFilePath = path.join(
    rootDirPath,
    getFilePath('.env')
  )
  const dotenvFiles = [
    `${baseDotenvFilePath}.${NODE_ENV}.local`,
    NODE_ENV !== 'test' && `${baseDotenvFilePath}.local`,
    `${baseDotenvFilePath}.${NODE_ENV}`,
    baseDotenvFilePath
  ].filter(Boolean)

  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      require('dotenv-expand')(
        require('dotenv').config({
          path: dotenvFile
        })
      )
    }
  })
}

const setEnvNodePath = (path, fs, rootDirPath) => {
  const appDirectory = fs.realpathSync(rootDirPath)
  process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter(folder => folder && !path.isAbsolute(folder))
    .map(folder => path.resolve(appDirectory, folder))
    .join(path.delimiter)
}

const getEnvVariables = (path, fs, rootDirPath, publicUrl) => {
  loadDotEnvFiles(path, fs, rootDirPath)
  setEnvNodePath(path, fs, rootDirPath)

  return Object.keys(process.env).reduce((
    env: RawEnv,
    key: string
  ) => ({ ...env, [key]: process.env[key] }), {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PUBLIC_URL: publicUrl,
    WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
    WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
    WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
  })
}

const stringifyEnvVariables = (rawEnv: RawEnv) => ({
  'process.env': Object.keys(rawEnv).reduce((env, key) => {
    env[key] = JSON.stringify(rawEnv[key])
    return env
  }, {}),
})

const getAdditionalModulePaths = (path, baseUrl, nodeModulesPath, srcPath, rootDirPath) => {
  if (!baseUrl) {
    return ''
  }

  const baseUrlResolved = path.resolve(rootDirPath, baseUrl)

  if (path.relative(nodeModulesPath, baseUrlResolved) === '') {
    return null
  }

  if (path.relative(srcPath, baseUrlResolved) === '') {
    return [srcPath]
  }

  if (path.relative(rootDirPath, baseUrlResolved) === '') {
    return null
  }

  throw new Error(
    'Your project\'s `baseUrl` can only be set to `src` or `node_modules`.'
  )
}

function getWebpackAliases(path, baseUrl, srcPath, rootDirPath) {
  if (!baseUrl) {
    return {}
  }

  const baseUrlResolved = path.resolve(rootDirPath, baseUrl)

  if (path.relative(rootDirPath, baseUrlResolved) === '') {
    return {
      src: srcPath
    }
  }
}

module.exports = (path, fs): WebpackConfigGenerator => ({
  mode,
  envName,
  paths: {
    rootDirPath,
    relativeEntryFilePath,
    relativeOutputDirPath,
    relativeHtmlTemplatePath,
  },
  languages: {
    isSass,
    isTypescript
  },
  publicUrl,
  tsOrJsConfig,
  packageJson
}) => {

  const entryPath = path.join(
    rootDirPath,
    getFilePath(relativeEntryFilePath)
  )

  const outputPath = path.join(
    rootDirPath,
    getFilePath(relativeOutputDirPath)
  )

  const htmlTemplatePath = path.join(
    rootDirPath,
    getFilePath(relativeHtmlTemplatePath)
  )

  const nodeModulesPath = path.join(
    rootDirPath,
    '/node_modules/'
  )

  const srcPath = path.join(
    rootDirPath,
    '/src/'
  )

  const rawEnv = getEnvVariables(path, fs, rootDirPath, publicUrl)
  const stringifiedEnv = stringifyEnvVariables(rawEnv)

  const rules = [
    {
      oneOf: getCommonRules(mode, isTypescript, isSass, srcPath, getBabelConfig(path))
    }
  ]

  const plugins = mode === 'watch' ? getWatchPlugins(
    htmlTemplatePath,
    rawEnv,
    stringifiedEnv,
    publicUrl
  ) : []

  if (isTypescript) {
    plugins.push(getTsCheckerPlugin(path, mode, rootDirPath))
  }

  const baseUrl = tsOrJsConfig?.compilerOptions?.baseUrl || '.'


  const isWatchMode = mode === 'watch'
  const isDevMode = (isWatchMode || envName === 'development')

  return ({
    mode: isDevMode ? 'development' : 'production',
    bail: !isDevMode,
    entry: isWatchMode ? [
      require.resolve('webpack-dev-server/client') + '?/',
      require.resolve('webpack/hot/dev-server'),
      entryPath
    ] : entryPath,
    devtool: isDevMode ? 'cheap-module-source-map' : 'source-map',
    optimization: {
      minimize: !isDevMode,
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      }
    },
    resolve: {
      modules: ['node_modules', nodeModulesPath].concat(
        getAdditionalModulePaths(path, baseUrl, nodeModulesPath, srcPath, rootDirPath) || []
      ),
      extensions: moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => isTypescript || !ext.includes('ts')),
      alias: {
        ...(getWebpackAliases(path, baseUrl, srcPath, rootDirPath) || {}),
      },
      plugins: [
        PnpWebpackPlugin
      ]
    },
    resolveLoader: {
      plugins: [
        PnpWebpackPlugin.moduleLoader(module)
      ],
    },
    module: {
      rules
    },
    plugins,
    output: {
      path: isWatchMode ? undefined : outputPath,
      pathinfo: isDevMode,
      filename: isDevMode ? 'static/js/[name].chunk.js' :
        'static/js/[name].[contenthash:8].chunk.js',
      futureEmitAssets: true,
      chunkFilename: isDevMode ? 'static/js/[name].chunk.js' :
        'static/js/[name].[contenthash:8].chunk.js',
      publicPath: publicUrl,
      jsonpFunction: `webpackJsonp${packageJson.name}`,
      globalObject: 'this'
    },
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    }
  })
}
