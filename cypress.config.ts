import { defineConfig } from 'cypress';
import cypressSplit from 'cypress-split';

export default defineConfig({
  video: false,
  defaultCommandTimeout: 15000,
  retries: 2,
  numTestsKeptInMemory: 0,
  experimentalMemoryManagement: true,
  e2e: {
    setupNodeEvents(on, config) {
      cypressSplit(on, config);
      require('./cypress/plugins/index.js')(on, config);
      return config;
    },
    baseUrl: "http://localhost:3000",
    testIsolation: false,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
