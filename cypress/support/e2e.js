// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import { worker } from "../../src/mocks/mswSetup";

before(async () => {
  await worker.start();
});

after(() => {
  worker.stop();
});

/**
 * ResizeObserver error is described by Cypress community as an error that can be ignored
 If Cypress fails your test because of ResizeObserver error, you can swallow it by
 adding this code to the top of the test or as a global catch for ResizeObserver here
 */
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
