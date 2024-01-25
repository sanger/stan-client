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

//There is a known issue from @testing-library/cypress v9.0 onwards that causes any find* command
//fails when is first to run in a test context
//https://github.com/testing-library/cypress-testing-library/issues/253
//This is the suggested workaround to ensure this.get('prev') is always defined by the time your test runs.
beforeEach(() => {
  cy.then(() => null)
})

before(async () => {
  await worker.start();
});

after(() => {
  worker.resetHandlers()
  worker.stop();
});


// ignore uncaught exceptions
Cypress.on('uncaught:exception', () => {
  return false
})


// Alternatively you can use CommonJS syntax:
// require('./commands')
