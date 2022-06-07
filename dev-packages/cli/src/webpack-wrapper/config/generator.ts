import type { BabelConfigGenerators, RawEnv, WebpackConfigGenerator } from '../../types/internal'
import type { Loader, RuleSetRule } from 'webpack'

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const PnpWebpackPlugin = require('pnp-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { DefinePlugin, HotModuleReplacementPlugin, IgnorePlugin } = require('webpack')
const safePostCssParser = require('postcss-safe-parser')
// const postcssNormalize = require('postcss-normalize')
const getBabelConfig = require('./babel-config')
const InterpolateHtmlPlugin = require('./InterpolateHtmlPlugin')
const InlineChunkHtmlPlugin = require('./InlineChunkHtmlPlugin')

const getFilePath = (entryFile: string) =>
  entryFile.startsWith('./') ? entryFile.substr(2) : entryFile

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
  'jsx'
]

const getStyleLoaders = (
  mode: 'watch' | 'build',
  cssOptions: Object,
  publicUrl: string,
  srcPath: string,
  preProcessor?: string
) => {
  const loaders: Loader[] = [
    mode === 'watch'
      ? require.resolve('style-loader')
      : {
          loader: MiniCssExtractPlugin.loader,
          options: publicUrl.startsWith('.') ? { publicPath: '../../' } : {}
        },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    }
    // {
    //   loader: require.resolve('postcss-loader'),
    //   options: {
    //     postcssOptions: {
    //       plugins: () => [
    //         require('postcss-flexbugs-fixes'),
    //         require('postcss-preset-env')({
    //           autoprefixer: {
    //             flexbox: 'no-2009'
    //           },
    //           stage: 3
    //         }),
    //         postcssNormalize()
    //       ]
    //     },
    //     sourceMap: true
    //   }
    // }
  ]
  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve('resolve-url-loader'),
        options: {
          sourceMap: true,
          root: srcPath
        }
      },
      {
        loader: require.resolve(preProcessor),
        options: { sourceMap: true }
      }
    )
  }
  return loaders
}

const getCommonRules = (
  mode: 'watch' | 'build',
  isTypescript: boolean,
  isSass: boolean,
  srcPath: string,
  babelConfig: BabelConfigGenerators,
  publicUrl: string
): RuleSetRule[] => {
  const fileAssets: RuleSetRule = {
    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2|bmp)$/i,
    loader: require.resolve('url-loader'),
    options: {
      limit: 10000,
      name: 'static/media/[name].[hash:8].[ext]'
    }
  }

  const threadLoader =
    mode === 'watch'
      ? {
          loader: require.resolve('thread-loader'),
          options: {
            poolTimeout: Infinity
          }
        }
      : require.resolve('thread-loader')

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
      use: getStyleLoaders(
        mode,
        {
          importLoaders: 1,
          sourceMap: true
        },
        publicUrl,
        srcPath
      )
    },
    {
      test: cssModuleRegex,
      use: getStyleLoaders(
        mode,
        {
          importLoaders: 1,
          sourceMap: true,
          modules: true,
          getLocalIdent: () => '' // TODO: Implement getLocalIndent
        },
        publicUrl,
        srcPath
      )
    }
  ]

  const sassRules: RuleSetRule[] = isSass
    ? [
        {
          test: sassRegex,
          exclude: sassModuleRegex,
          use: getStyleLoaders(
            mode,
            {
              importLoaders: 2,
              sourceMap: true
            },
            publicUrl,
            srcPath,
            'sass-loader'
          )
        },
        {
          test: sassModuleRegex,
          use: getStyleLoaders(
            mode,
            {
              importLoaders: 2,
              sourceMap: true,
              modules: true,
              getLocalIdent: () => '' // TODO: Implement getLocalIndent
            },
            publicUrl,
            srcPath,
            'sass-loader'
          )
        }
      ]
    : []

  const fileFallback: RuleSetRule = {
    loader: require.resolve('file-loader'),
    exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
    options: {
      name: 'static/media/[name].[hash:8].[ext]'
    }
  }

  return [fileAssets, applicationFiles, dependencies, ...cssRules, ...sassRules, fileFallback]
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

        const entrypointFiles = entrypoints.main.filter(fileName => !fileName.endsWith('.map'))

        return {
          files: manifestFiles,
          entrypoints: entrypointFiles
        }
      }
    }),
    new IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

const getBuildPlugins = (
  htmlTemplatePath: string,
  rawEnv: RawEnv,
  stringifiedEnv: { 'process.env': { [key: string]: string } },
  publicUrl: string
) => {
  return [
    new HtmlWebpackPlugin({
      inject: true,
      template: htmlTemplatePath,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, rawEnv),
    new DefinePlugin(stringifiedEnv),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: publicUrl,
      generate: (seed, files, entrypoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path
          return manifest
        }, seed)

        const entrypointFiles = entrypoints.main.filter(fileName => !fileName.endsWith('.map'))

        return {
          files: manifestFiles,
          entrypoints: entrypointFiles
        }
      }
    }),
    new IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

const getTsCheckerPlugin = (path, mode: 'watch' | 'build', rootDirPath: string) =>
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      enabled: true,
      configFile: path.join(rootDirPath, 'tsconfig.json'),
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
  const baseDotenvFilePath = path.join(rootDirPath, getFilePath('.env'))
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

  return Object.keys(process.env).reduce(
    (env: RawEnv, key: string) => ({ ...env, [key]: process.env[key] }),
    {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PUBLIC_URL: publicUrl,
      WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
      WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
      WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT
    }
  )
}

const stringifyEnvVariables = (rawEnv: RawEnv) => ({
  'process.env': Object.keys(rawEnv).reduce((env, key) => {
    env[key] = JSON.stringify(rawEnv[key])
    return env
  }, {})
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

  throw new Error("Your project's `baseUrl` can only be set to `src` or `node_modules`.")
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

module.exports =
  (path, fs): WebpackConfigGenerator =>
  ({
    mode,
    envName,
    paths: { rootDirPath, relativeEntryFilePath, relativeOutputDirPath, relativeHtmlTemplatePath },
    languages: { isSass, isTypescript },
    publicUrl,
    tsOrJsConfig,
    packageJson
  }) => {
    const entryPath = path.join(rootDirPath, getFilePath(relativeEntryFilePath))

    const outputPath = path.join(rootDirPath, getFilePath(relativeOutputDirPath))

    const htmlTemplatePath = path.join(rootDirPath, getFilePath(relativeHtmlTemplatePath))

    const nodeModulesPath = path.join(rootDirPath, '/node_modules/')

    const srcPath = path.join(rootDirPath, '/src/')

    const rawEnv = getEnvVariables(path, fs, rootDirPath, publicUrl)
    const stringifiedEnv = stringifyEnvVariables(rawEnv)

    const rules = [
      {
        oneOf: getCommonRules(mode, isTypescript, isSass, srcPath, getBabelConfig(path), publicUrl)
      }
    ]

    const plugins =
      mode === 'watch'
        ? getWatchPlugins(htmlTemplatePath, rawEnv, stringifiedEnv, publicUrl)
        : getBuildPlugins(htmlTemplatePath, rawEnv, stringifiedEnv, publicUrl)

    if (isTypescript) {
      plugins.push(getTsCheckerPlugin(path, mode, rootDirPath))
    }

    const baseUrl = tsOrJsConfig?.compilerOptions?.baseUrl || '.'

    const isWatchMode = mode === 'watch'
    const isDevMode = isWatchMode || envName === 'development'

    return {
      mode: isDevMode ? 'development' : 'production',
      bail: !isDevMode,
      entry: isWatchMode
        ? [
            require.resolve('webpack-dev-server/client') + '?/',
            require.resolve('webpack/hot/dev-server'),
            entryPath
          ]
        : entryPath,
      devtool: isDevMode ? 'cheap-module-source-map' : 'source-map',
      optimization: {
        minimize: !isDevMode,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2
              },
              mangle: {
                safari10: true
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true
              }
            },
            sourceMap: true
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              parser: safePostCssParser,
              map: {
                inline: false,
                annotation: true
              }
            },
            cssProcessorPluginOptions: {
              preset: ['default', { minifyFontValues: { removeQuotes: false } }]
            }
          })
        ],
        splitChunks: {
          chunks: 'all',
          name: false
        },
        runtimeChunk: {
          name: entrypoint => `runtime-${entrypoint.name}`
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
          ...(getWebpackAliases(path, baseUrl, srcPath, rootDirPath) || {})
        },
        plugins: [PnpWebpackPlugin]
      },
      resolveLoader: {
        plugins: [PnpWebpackPlugin.moduleLoader(module)]
      },
      module: {
        rules
      },
      plugins,
      output: {
        path: isWatchMode ? undefined : outputPath,
        pathinfo: isDevMode,
        filename: isDevMode
          ? 'static/js/[name].chunk.js'
          : 'static/js/[name].[contenthash:8].chunk.js',
        // TODO: remove this when upgrading to webpack 5
        futureEmitAssets: true,
        chunkFilename: isDevMode
          ? 'static/js/[name].chunk.js'
          : 'static/js/[name].[contenthash:8].chunk.js',
        publicPath: publicUrl,
        devtoolModuleFilenameTemplate: isDevMode
          ? info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
          : info => path.relative(srcPath, info.absoluteResourcePath).replace(/\\/g, '/'),
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
        child_process: 'empty'
      }
    }
  }
