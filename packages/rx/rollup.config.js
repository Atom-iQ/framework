import babel from '@rollup/plugin-babel'
import ts from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import bundleSize from 'rollup-plugin-bundle-size'
import sizes from 'rollup-plugin-sizes'
import gzip from 'rollup-plugin-gzip'

export default () => [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    external: [/^@atom-iq\/fx/],
    output: [
      {
        file: 'dist/index.umd.js',
        name: 'iqRx',
        format: 'umd',
        globals: {
          '@atom-iq/fx': 'iqFx'
        }
      },
      {
        file: 'dist/index.umd.min.js',
        name: 'iqRx',
        format: 'umd',
        globals: {
          '@atom-iq/fx': 'iqFx'
        },
        plugins: [terser(), gzip()]
      }
    ],
    plugins: [
      ts(),
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
    external: [/^@atom-iq\/fx/],
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
    ]
  }
]
