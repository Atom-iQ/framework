import { PackageJSON, Workspace, WorkspacePackageJSON } from '../types/internal'

const { cliConfigFiles } = require('../config')

/**
 * @function getWorkspace
 * @returns {Workspace}
 */
module.exports = (path, fs) => {
  const findUpFirstFile = require('./findUpFile')(path, fs)

  const containsCliInDependencies = (packageJSON: PackageJSON) => {
    const pkgName = '@reactive-ui/cli'
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

  const parsePackageJson = (packageJsonPath: string): PackageJSON => {
    const packageJsonBuffer = fs.readFileSync(packageJsonPath)
    const packageJsonText = packageJsonBuffer === null ? '{}' : packageJsonBuffer.toString()
    return JSON.parse(packageJsonText)
  }

  const getPackageJson = (workspaceDir: string): WorkspacePackageJSON => {
    const packageJsonPath = path.join(workspaceDir, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      // No package.json
      throw new Error('No package.json found')
    }
    const parsedPackageJson = parsePackageJson(packageJsonPath)
    if (!containsCliInDependencies(parsedPackageJson)) {
      // No CLI dependency
      throw new Error('No @reactive-ui/cli found in dependencies')
    }
    return {
      packageJsonPath,
      parsedPackageJson
    }
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
      const packageJson = getPackageJson(workspaceDir)

      return {
        root: workspaceDir,
        configFileName,
        ...packageJson
      }
    } catch (e) {
      console.error(e.message)
      return null
    }
  }
}
