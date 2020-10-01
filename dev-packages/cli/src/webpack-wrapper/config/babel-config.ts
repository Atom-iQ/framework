import type {
  BabelConfig,
  BabelConfigGenerators,
  BabelPlugins,
  BabelPresets
} from '../../types/internal'

module.exports = (path): BabelConfigGenerators => ({
  applicationFiles: (isTypescript: boolean): BabelConfig => {
    let presets: BabelPresets = [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 'current'
          }
        }
      ]
    ]

    if (isTypescript) {
      presets = [
        ...presets,
        [
          require.resolve('@babel/preset-typescript'),
          {
            isTSX: true,
            allExtensions: true,
            allowNamespaces: true
          }
        ]
      ]
    }

    const plugins: BabelPlugins = [require.resolve('@atom-iq/babel-plugin-jsx')]

    return {
      presets,
      plugins
    }
  },

  dependencies: (): BabelConfig => ({
    compact: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          useBuiltIns: 'entry',
          corejs: 3,
          exclude: ['transform-typeof-symbol']
        }
      ]
    ],
    plugins: [
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          corejs: false,
          helpers: false,
          version: require('@babel/runtime/package.json').version,
          regenerator: true,
          useESModules: true,
          absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
        }
      ]
    ]
  })
})
