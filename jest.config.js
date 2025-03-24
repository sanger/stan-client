/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testEnvironment: '<rootDir>/jsdom-extended.js',
  /**
   * This is to fix error - Cannot find module ‘msw/node’ (JSDOM)
   * This error is thrown by your test runner because JSDOM uses the browser export condition by default. This means that when you import any third-party packages, like MSW, JSDOM forces its browser export to be used as the entrypoint. This is incorrect and dangerous because JSDOM still runs in Node.js and cannot guarantee full browser compatibility by design.
   * To fix this, set the testEnvironmentOptions.customExportConditions option in your jest.config.js to ['']:
   * https://mswjs.io/docs/migrations/1.x-to-2.x/#:~:text=Cannot%20find%20module%20'msw%2Fnode,be%20used%20as%20the%20entrypoint.
   */
  testEnvironmentOptions: {
    customExportConditions: ['']
  },
  testMatch: ['<rootDir>/tests/unit/**/*.spec.{js,jsx,ts,tsx}', '<rootDir>/tests/e2e/**/*.spec.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['./jest.polyfills.js'],
  transformIgnorePatterns: ['node_modules/(?!(msw)/)']
};
