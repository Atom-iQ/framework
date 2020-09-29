module.exports = function (api) {
  api.cache(true)

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    [
      '@babel/preset-typescript',
      {
        'isTSX': true,
        'allExtensions': true,
        'allowNamespaces': true
      }
    ]
  ]

  const plugins = []

  return {
    presets,
    plugins
  }
}
