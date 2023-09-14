/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testTimeout: 10000
};
