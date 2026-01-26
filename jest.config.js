module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|immer|zustand)',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/packages/state/src/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/packages/core/src/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/app/**/__tests__/**/*.test.{ts,tsx}',
  ],
  // Exclude packages with their own jest config (e.g., agent-intelligence uses ts-jest)
  testPathIgnorePatterns: ['/node_modules/', '/packages/agent-intelligence/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'packages/state/src/**/*.{ts,tsx}',
    'packages/core/src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!**/__tests__/**/*',
  ],
  coverageThreshold: {
    global: {
      // TODO: Increase thresholds as test coverage improves
      statements: 5,
      branches: 5,
      functions: 5,
      lines: 5,
    },
  },
};
