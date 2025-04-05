module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three|@dimforge/rapier3d)/)',
  ],
  moduleNameMapper: {
    '^@dimforge/rapier3d$': '<rootDir>/src/test/__mocks__/@dimforge/rapier3d.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      useESM: true,
    },
  },
}; 