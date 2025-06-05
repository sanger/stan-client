import {
  GetLabwareOperationsQuery,
  GetLabwareOperationsQueryVariables,
  SetOpWorkRequestMutation,
  SetOpWorkRequestMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import { selectOption } from '../shared/customReactSelect.cy';

describe('Revise Work Number Page', () => {
  before(() => {
    cy.visit('/admin/revise_work_number');
  });

  describe('On load', () => {
    it('displays work number select box', () => {
      cy.findByTestId('workNumber').should('be.visible');
    });
    it('disables the submit button', () => {
      cy.findByTestId('submit').should('be.disabled');
    });
    it('displays the barcode input', () => {
      cy.findByTestId('barcode').should('be.visible');
    });
    it('displays the event type select box', () => {
      cy.findByTestId('eventType').should('be.visible');
    });
  });

  describe('When searching for operations', () => {
    before(() => {
      cy.findByTestId('barcode').type('STAN-1223');
      selectOption('eventType', 'Operation Type 1');
    });
    describe('when no operations is found', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<GetLabwareOperationsQuery, GetLabwareOperationsQueryVariables>('GetLabwareOperations', () => {
              return HttpResponse.json({
                data: { labwareOperations: [] }
              });
            })
          );
        });
        cy.findByTestId('search-operations').click();
      });
      it('displays a message text', () => {
        cy.findByText('No operations found for this search.').should('be.visible');
      });
    });
    describe('when some operations is found', () => {
      before(() => {
        cy.findByTestId('search-operations').click();
      });
      it('displays a message text', () => {
        cy.findByTestId('operations-table').should('be.visible');
      });
    });
  });

  describe('When submitting', () => {
    before(() => {
      selectOption('workNumber', 'SGP1008');
      cy.findByTestId('operations-table').find('tr').first().find('input[type="checkbox"]').check();
    });
    it('enables the submit button', () => {
      cy.findByTestId('submit').should('be.enabled');
    });
    describe('on failure', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<SetOpWorkRequestMutation, SetOpWorkRequestMutationVariables>('SetOpWorkRequest', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Specified operations are already linked to work SGP1008'
                  }
                ]
              });
            })
          );
        });
        cy.findByTestId('submit').click();
      });

      it('displays an error message', () => {
        cy.findByText('Specified operations are already linked to work SGP1008').should('be.visible');
      });
    });

    describe('on success', () => {
      before(() => {
        cy.findByTestId('submit').click();
      });

      it('displays a success message', () => {
        cy.findByText('All selected operations have been successfully revised to the work number SGP1008.').should(
          'be.visible'
        );
      });
    });
  });
});
