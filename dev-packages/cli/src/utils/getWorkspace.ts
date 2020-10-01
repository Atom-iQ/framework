/**
 * @license
 * Copyright Adam Filipek
 * Copyright Google Inc. All Rights Reserved. - parts of file from @angular/cli
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type { ConfigJSON, PackageJSON, Workspace, WorkspacePackageJSON } from '../types/internal'
import type { IQCliConfig } from '../types/public'

const { cliConfigFiles } = require('../config')

/**
 * @function getWorkspace
 * @returns {Workspace}
 */
module.exports = (path, fs) => {
  const findUpFirstFile = require('./findUpFile')(path, fs)

  const containsCliInDependencies = (packageJSON: PackageJSON) => {
    const pkgName = '@atom-iq/cli'
    if (packageJSON) {
      if (packageJSON.dependencies && packageJSON.dependencies[pkgName]) {
        return true
      }
      if (packageJSON.devDependencies && packageJSON.devDependencies[pkgName]) {
        return true
      }
    }
    return false
  }

  const parseJson = <T extends Object>(jsonPath: string): T => {
    const jsonBuffer = fs.readFileSync(jsonPath)
    const jsonText = jsonBuffer === null ? '{}' : jsonBuffer.toString()
    return JSON.parse(jsonText)
  }

  const getPackageJson = (workspaceDir: string): WorkspacePackageJSON => {
    const packageJsonPath = path.join(workspaceDir, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      // No package.json
      throw new Error('No package.json found')
    }
    const parsedPackageJson = parseJson<PackageJSON>(packageJsonPath)
    if (!containsCliInDependencies(parsedPackageJson)) {
      // No CLI dependency
      throw new Error('No @atom-iq/cli found in dependencies')
    }
    return {
      packageJsonPath,
      parsedPackageJson
    }
  }

  const getConfigJson = (workspaceDir: string, isTypescript: boolean) => {
    const configJsonPath = path.join(workspaceDir, isTypescript ? 'tsconfig.json' : 'jsconfig.json')
    if (!fs.existsSync(configJsonPath)) {
      // No tsconfig.json or jsconfig.json
      throw new Error(`No ${isTypescript ? 'tsconfig.json' : 'jsconfig.json'} found`)
    }
    const parsedConfigJson = parseJson<ConfigJSON>(configJsonPath)

    return {
      configJsonPath,
      parsedConfigJson
    }
  }

  const getCliConfig = (configFilePath: string): IQCliConfig => {
    const cliConfigBuffer = fs.readFileSync(configFilePath)
    const cliConfigText = cliConfigBuffer === null ? '{}' : cliConfigBuffer.toString()
    return JSON.parse(cliConfigText)
  }

  return (): Workspace => {
    const currentDir = process.cwd()
    const configFilePath = findUpFirstFile(cliConfigFiles, currentDir)
    if (configFilePath === null) {
      return null
    }
    const configFileName = path.basename(configFilePath)
    const workspaceDir = path.dirname(configFilePath)

    try {
      const parsedCliConfig = getCliConfig(configFilePath)
      const packageJson = getPackageJson(workspaceDir)
      const configJson = getConfigJson(workspaceDir, parsedCliConfig.typescript)

      return {
        root: workspaceDir,
        configFileName,
        parsedCliConfig,
        ...packageJson,
        ...configJson
      }
    } catch (e) {
      console.error(e.message)
      return null
    }
  }
}
