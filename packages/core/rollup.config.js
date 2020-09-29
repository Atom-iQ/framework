module.exports = ({ nodeResolve, commonjs, terser, babel }) => [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'babel-plugin-atom-iq-jsx',
      file: 'dist/index.umd.js',
      format: 'umd'
    },
    plugins: [
      nodeResolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                ie: '11'
              }
            }
          ]
        ]
      }),
      terser()
    ]
  }
]
