/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testEnvironment: '<rootDir>/jsdom-extended.js',
  testEnvironmentOptions: {
    customExportConditions: ['']
  },
  testMatch: ['<rootDir>/tests/unit/**/*.spec.{js,jsx,ts,tsx}', '<rootDir>/tests/e2e/**/*.spec.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  testPathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src']
};

export default config;
