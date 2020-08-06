/**
 * Returns first found file from names list, starting from startingDir
 * and looking up to root directory
 *
 * @function findUpFirstFile
 * @param path
 * @param fs
 */
module.exports = (path, fs) => (names: string[], startingDir: string) => {
  const rootDir = path.parse(startingDir).root
  let currentDir = startingDir
  while (currentDir && currentDir !== rootDir) {
    for (const name of names) {
      const p = path.join(currentDir, name)
      if (fs.existsSync(p)) {
        return p
      }
    }
    currentDir = path.dirname(currentDir)
  }
  return null
}
