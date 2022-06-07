// eslint-disable-next-line @typescript-eslint/no-var-requires
const monorepoConfig = require('../../jest.config')

module.exports = {
  ...monorepoConfig,
  rootDir: '.',
  moduleNameMapper: {
    '^types(.*)$': '<rootDir>/src/shared/types$1',
    '^shared(.*)$': '<rootDir>/src/shared$1',
    '^renderer(.*)$': '<rootDir>/src/renderer$1',
    '^events(.*)$': '<rootDir>/src/events$1',
    '^middlewares(.*)$': '<rootDir>/src/middlewares$1',
    '^component(.*)$': '<rootDir>/src/component$1'
  },
  testPathIgnorePatterns: ['/node_modules/']
}
