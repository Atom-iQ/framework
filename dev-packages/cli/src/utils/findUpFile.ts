/**
 * @license
 * Copyright Adam Filipek - small modifications, file from @angular/cli
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

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
