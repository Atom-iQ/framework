// eslint-disable-next-line @typescript-eslint/no-var-requires
const monorepoConfig = require('../../jest.config')

module.exports = {
  ...monorepoConfig,
  rootDir: '.',
  moduleNameMapper: {
    '^types(.*)$': '<rootDir>/src/shared/types$1',
    '^shared(.*)$': '<rootDir>/src/shared$1',
    '^rvd(.*)$': '<rootDir>/src/reactive-virtual-dom$1',
    '^red(.*)$': '<rootDir>/src/reactive-event-delegation$1',
    '^middlewares(.*)$': '<rootDir>/src/middlewares$1',
    '^init(.*)$': '<rootDir>/src/init$1',
    '^component(.*)$': '<rootDir>/src/component$1'
  },
  testPathIgnorePatterns: ['/node_modules/']
}
