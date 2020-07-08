module.exports = function (api) {
  api.cache(true);

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
  ];

  const plugins = ['babel-plugin-transform-rx-ui-jsx'];

  return {
    presets,
    plugins
  };
};
