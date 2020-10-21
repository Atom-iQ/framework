const getFilePath = path => 'packages/teardown/' + path

module.exports = ({ nodeResolve, commonjs, terser, babel, ts, bundleSize, gzip, sizes }) => [
  // browser-friendly UMD build
  {
    input: getFilePath('src/index.ts'),
    external: [/^rxjs/, /^@atom-iq\/core/],
    output: [
      {
        file: getFilePath('dist/index.umd.js'),
        name: 'iQContext',
        format: 'umd',
        globals: {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
          '@atom-iq/core': 'iQ'
        }
      },
      {
        file: getFilePath('dist/index.umd.min.js'),
        name: 'iQRef',
        format: 'umd',
        globals: {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
          '@atom-iq/core': 'iQ'
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
      index: getFilePath('src/index.ts')
    },
    external: [/^rxjs/, /^@atom-iq\/core/],
    output: [
      {
        dir: getFilePath('dist'),
        entryFileNames: '[name].es.js',
        format: 'es'
      },
      {
        dir: getFilePath('dist'),
        entryFileNames: '[name].es.min.js',
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
        dir: getFilePath('dist/lib'),
        entryFileNames: '[name].min.js',
        format: 'es',
        preserveModules: true,
        plugins: [terser(), gzip()]
      }
    ],
    plugins: [
      ts({
        tsconfig: getFilePath('tsconfig.json'),
        declaration: true,
        declarationDir: getFilePath('dist/lib/types')
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
