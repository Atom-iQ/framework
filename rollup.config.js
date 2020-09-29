/* eslint-disable */

import babel from '@rollup/plugin-babel'
import ts from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import bundleSize from 'rollup-plugin-bundle-size'
import sizes from 'rollup-plugin-sizes'
import gzip from 'rollup-plugin-gzip'

const plugins = {
  babel,
  ts,
  commonjs,
  nodeResolve,
  terser,
  bundleSize,
  gzip,
  sizes
}

export default commandLineArgs => {
  if (commandLineArgs.configDevPackage) {
    return require('./dev-packages/' + commandLineArgs.configDevPackage + '/rollup.config.js')(
      plugins,
      commandLineArgs
    )
  } else if (commandLineArgs.configPackage) {
    return require('./packages/' + commandLineArgs.configPackage + '/rollup.config.js')(
      plugins,
      commandLineArgs
    )
  }
  throw new Error(commandLineArgs)
}
