import babel from '@rollup/plugin-babel'
import ts from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import bundleSize from 'rollup-plugin-bundle-size'
import sizes from 'rollup-plugin-sizes'
import gzip from 'rollup-plugin-gzip'

export default () => [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    external: [/^rxjs/, /^@atom-iq\/core/],
    output: [
      {
        file: 'dist/index.umd.js',
        name: 'iQContext',
        format: 'umd',
        globals: {
          rxjs: 'rxjs',
          'rxjs/operators': 'rxjs.operators',
          '@atom-iq/core': 'iQ'
        }
      },
      {
        file: 'dist/index.umd.min.js',
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
      ts(),
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
        file: 'src/index.ts'
      })
    ]
  },
  {
    input: {
      index: 'src/index.ts'
    },
    external: [/^rxjs/, /^@atom-iq\/core/],
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].es.js',
        format: 'es'
      },
      {
        dir: 'dist',
        entryFileNames: '[name].es.min.js',
        format: 'es',
        plugins: [terser(), gzip()]
      },
      {
        dir: 'dist/lib',
        entryFileNames: '[name].js',
        format: 'es',
        preserveModules: true
      },
      {
        dir: 'dist/lib',
        entryFileNames: '[name].min.js',
        format: 'es',
        preserveModules: true,
        plugins: [terser(), gzip()]
      }
    ],
    plugins: [
      ts({
        declaration: true,
        declarationDir: 'dist/lib/types'
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
