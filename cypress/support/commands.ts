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
import { graphql } from "msw";
import { worker } from "../../src/mocks/mswSetup";

// See https://testing-library.com/docs/cypress-testing-library/intro
import "@testing-library/cypress/add-commands";
import { graphqlType } from "../../src/types";
import {
  CurrentUserQuery,
  CurrentUserQueryVariables,
  UserRole,
} from "../../src/types/sdk";

interface MSW {
  worker: SetupWorkerApi;
  graphql: graphqlType;
}

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      msw(): Chainable<MSW>;
      visitAsGuest(url: string): Chainable<ReturnType<typeof cy.visit>>;
      visitAsAdmin(url: string): Chainable<ReturnType<typeof cy.visit>>;
      findByTextContent(
        textContent: string
      ): Chainable<ReturnType<typeof cy.findByText>>;
    }
  }
}

Cypress.Commands.add("msw", () => {
  return new Cypress.Promise((resolve) => {
    resolve({
      worker,
      graphql,
    });
  });
});

Cypress.Commands.add("visitAsGuest", (url: string) => {
  cy.msw().then(({ worker, graphql }) => {
    worker.use(
      graphql.query<CurrentUserQuery, CurrentUserQueryVariables>(
        "CurrentUser",
        (req, res, ctx) => {
          return res.once(
            ctx.data({
              user: null,
            })
          );
        }
      )
    );
  });

  return cy.visit(url);
});

Cypress.Commands.add("visitAsAdmin", (url: string) => {
  cy.msw().then(({ worker, graphql }) => {
    worker.use(
      graphql.query<CurrentUserQuery, CurrentUserQueryVariables>(
        "CurrentUser",
        (req, res, ctx) => {
          return res.once(
            ctx.data({
              user: {
                __typename: "User",
                username: "jb1",
                role: UserRole.Admin,
              },
            })
          );
        }
      )
    );
  });

  return cy.visit(url);
});

/**
 * Command to find a piece of text on a page that could be broken up within
 * multiple HTML elements (unlike findByText)
 *
 * @example
 *
 * <div>Hello <span>World!</span></div>
 *
 * cy.findByTextContent("Hello World!") // finds it
 */
Cypress.Commands.add("findByTextContent", (textContent: string) => {
  return cy.findByText((content, node) => {
    const hasText = (node: Element) => node.textContent === textContent;
    const nodeHasText = hasText(node);
    const childrenDontHaveText = Array.from(node.children).every(
      (child) => !hasText(child)
    );

    return nodeHasText && childrenDontHaveText;
  });
});
