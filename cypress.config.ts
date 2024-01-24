import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 15000,
  retries: 2,
  numTestsKeptInMemory: 20,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:3000",
    testIsolation: false,
  },
});
