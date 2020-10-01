const getFilePath = path => 'dev-packages/cli/' + path

module.exports = ({ nodeResolve, commonjs, terser, babel, ts, bundleSize, gzip, sizes }) => [
  // browser-friendly UMD build
  {
    input: getFilePath('src/main.ts'),
    output: [
      {
        file: getFilePath('dist/main.js'),
        format: 'cjs'
      },
      {
        file: getFilePath('dist/main.min.js'),
        format: 'cjs',
        plugins: [terser(), gzip()]
      }
    ],
    plugins: [
      ts({
        tsconfig: getFilePath('tsconfig.json')
      }),
      nodeResolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current'
              }
            }
          ]
        ],
        babelHelpers: 'bundled'
      }),
      sizes({
        details: true
      }),
      bundleSize({
        file: getFilePath('src/index.ts')
      })
    ]
  }
]
