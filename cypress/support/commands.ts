// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { SetupWorkerApi } from "msw/lib/types/setupWorker/setupWorker";

// See https://testing-library.com/docs/cypress-testing-library/intro
import "@testing-library/cypress/add-commands";
import { graphqlType } from "../../src/types";

interface MSW {
  worker: SetupWorkerApi;
  graphql: graphqlType;
}

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      msw(): Chainable<MSW>;
      visitAsGuest(url: string): Chainable<ReturnType<typeof cy.visit>>;
    }
  }
}

Cypress.Commands.add("msw", () => {
  return cy
    .window()
    .its("msw")
    .then((msw) => {
      return {
        worker: msw.worker,
        graphql: msw.graphql,
      };
    });
});

Cypress.Commands.add("visitAsGuest", (url: string) => {
  cy.on("window:before:load", (window) => {
    window.postMSWStart = (worker: SetupWorkerApi, graphql: graphqlType) => {
      worker.use(
        graphql.query("CurrentUser", (req, res, ctx) => {
          return res(
            ctx.data({
              username: null,
            })
          );
        })
      );
    };
  });

  return cy.visit(url);
});
