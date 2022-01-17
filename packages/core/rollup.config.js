import babel from '@rollup/plugin-babel'
import ts from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import { terser } from 'rollup-plugin-terser'
import bundleSize from 'rollup-plugin-bundle-size'
import sizes from 'rollup-plugin-sizes'
import gzip from 'rollup-plugin-gzip'

export default () => [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    external: [/^@atom-iq\/rx/],
    output: [
      {
        file: 'dist/index.umd.js',
        name: 'iQ',
        format: 'umd',
        globals: {
          '@atom-iq/rx': 'iQRx',
        }
      },
      {
        file: 'dist/index.umd.min.js',
        name: 'iQ',
        format: 'umd',
        globals: {
          '@atom-iq/rx': 'iQRx',
        },
        plugins: [terser(), gzip()]
      }
    ],
    plugins: [
      ts(),
      alias({
        entries: {
          shared: './src/shared',
          renderer: './src/renderer',
          events: './src/events',
          middlewares: './src/middlewares',
          component: './src/component'
        }
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
        file: 'src/index.ts'
      })
    ]
  },
  {
    input: {
      index: 'src/index.ts'
    },
    external: [/^@atom-iq\/rx/],
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
      alias({
        entries: {
          shared: './src/shared',
          renderer: './src/renderer',
          events: './src/events',
          middlewares: './src/middlewares',
          component: './src/component'
        }
      }),
      nodeResolve(),
      commonjs(),
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
