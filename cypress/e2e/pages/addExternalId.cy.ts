import { AddExternalIdsMutation, AddExternalIdsMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Add External ID page', () => {
  before(() => {
    cy.visit('/lab/add_external_id');
    /* TODO: For further integration testing on this page:
            - Need a method of simulating setting a users clipboard
            - The currently available methods only work when the cypress window is in focus
            - e.g we stub the navigator class called from addExternalId
                onBeforeLoad(win) { win.navigator.clipboard.readText = () => { return Promise.resolve("Hello") }
        */
  });

  context('when form is submitted without filling in any fields', () => {
    before(() => {
      cy.findByRole('button', { name: 'Submit' }).click();
    });

    it('has the correct properties for the Submit button', () => {
      cy.findByRole('button', { name: 'Submit' }).should('be.visible');
      cy.findByRole('button', { name: 'Submit' }).should('not.be.disabled');
    });

    it('shows an error about labwares', () => {
      cy.findByText('A labware must be scanned in').should('be.visible');
    });

    it('shows an error about external name', () => {
      cy.findByText('At least one external id must be provided').should('be.visible');
    });
  });

  context('when form is submitted with valid inputs', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-011{enter}');
      cy.findAllByTestId(`addressNames[0].externalName`).type('ExternalID1');
      cy.findByRole('button', { name: 'Submit' }).click();
    });

    it('displays a success message', () => {
      cy.findByText('External ID(s) successfully added').should('be.visible');
    });
  });

  context('when there is server errors', () => {
    before(() => {
      cy.reload();
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<AddExternalIdsMutation, AddExternalIdsMutationVariables>('AddExternalIds', () => {
            return HttpResponse.json({
              errors: [
                {
                  message: "The request could not be validated. 'Tissue already has an external name, in slot: [A1]'"
                }
              ]
            });
          })
        );
      });
      fillInTheForm();
    });
    it('shows an error', () => {
      cy.findByText("The request could not be validated. 'Tissue already has an external name, in slot: [A1]'").should(
        'be.visible'
      );
    });
  });
});

const fillInTheForm = () => {
  cy.get('#labwareScanInput').type('STAN-011{enter}');
  cy.findAllByTestId(`addressNames[0].externalName`).type('ExternalID1');
  cy.findByRole('button', { name: 'Submit' }).click();
};
