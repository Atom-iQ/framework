const getFilePath = path => 'packages/core/' + path

module.exports = ({ nodeResolve, commonjs, terser, babel, ts, bundleSize, gzip, sizes }) => [
  // browser-friendly UMD build
  {
    input: getFilePath('src/index.ts'),
    external: [/^rxjs/],
    output: [
      {
        file: getFilePath('dist/umd/index.js'),
        name: 'iQ',
        format: 'umd',
        globals: {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators'
        }
      },
      {
        file: getFilePath('dist/umd/index.min.js'),
        name: 'iQ',
        format: 'umd',
        globals: {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators'
        },
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
                ie: '11'
              }
            }
          ]
        ],
        babelHelpers: 'external'
      }),
      sizes({
        details: true
      }),
      bundleSize({
        file: getFilePath('src/index.ts')
      })
    ]
  },
  {
    input: {
      index: getFilePath('src/index.ts'),
      jsx: getFilePath('src/jsx.ts')
    },
    external: [/^rxjs/],
    output: [
      {
        dir: getFilePath('dist/es'),
        entryFileNames: '[name].js',
        format: 'es'
      },
      {
        dir: getFilePath('dist/es'),
        entryFileNames: '[name].min.js',
        format: 'es',
        plugins: [terser(), gzip()]
      },
      {
        dir: getFilePath('dist/lib'),
        entryFileNames: '[name].js',
        format: 'es',
        preserveModules: true
      },
      {
        dir: getFilePath('dist/lib/min'),
        entryFileNames: '[name].min.js',
        format: 'es',
        preserveModules: true,
        plugins: [terser(), gzip()]
      }
    ],
    plugins: [
      ts({
        tsconfig: getFilePath('tsconfig.json')
      }),
      nodeResolve(), // so Rollup can find `ms`ą
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                esmodules: true
              }
            }
          ]
        ],
        babelHelpers: 'external'
      })
    ]
  }
]
