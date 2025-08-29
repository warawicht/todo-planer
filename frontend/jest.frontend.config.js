module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.ts'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  testRegex: '.*\\.test\\.tsx?$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  roots: ['<rootDir>'],
};