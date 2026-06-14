module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // The RN preset ignores node_modules except a curated allow-list. Our extra
  // native deps ship untranspiled ESM/Flow, so they must be transformed too.
  transformIgnorePatterns: [
    'node_modules/(?!' +
      '(?:jest-)?@?react-native(-community)?' +
      '|@react-navigation' +
      '|react-native-.*' +
      ')/',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/types/**',
    '!src/test-utils/**',
    '!src/**/*.d.ts',
  ],
};
