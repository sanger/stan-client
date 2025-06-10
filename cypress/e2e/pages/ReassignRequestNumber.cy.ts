import { selectOption } from '../shared/customReactSelect.cy';
import { RecordInPlaceMutation, RecordInPlaceMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Reassign Request Number Page', () => {
  before(() => {
    cy.visit('/admin/reassign_request_number');
  });

  describe('On load', () => {
    it('displays work number select box', () => {
      cy.findByTestId('workNumbers').should('be.visible');
    });
    it('displays labware scanner', () => {
      cy.get('#labwareScanInput').should('be.visible');
    });
    it('disables the submit button', () => {
      cy.findByTestId('submit').should('be.disabled');
    });
  });

  describe('when selecting multiple request numbers', () => {
    before(() => {
      selectOption('workNumbers', 'SGP1008');
      selectOption('workNumbers', 'SGP1007');
    });

    it('contains all the options that are been selected', () => {
      cy.findByTestId('workNumbers').should('contain', 'SGP1008');
      cy.findByTestId('workNumbers').should('contain', 'SGP1007');
    });
    it('update the summary box accordingly', () => {
      cy.findByTestId('summary-text').contains(
        'The scanned labware will be re-assigned to the following request number(s): SGP1008, SGP1007'
      );
    });
  });
  describe('when scanning labware', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-123456{enter}');
      cy.get('#labwareScanInput').type('STAN-1356{enter}');
    });

    it('displays labware information table', () => {
      cy.findByRole('table').find('tr').should('have.length', 3);
    });
  });

  describe('when submitting', () => {
    context('on failure', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordInPlaceMutation, RecordInPlaceMutationVariables>('RecordInPlace', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'STAN-123456 could not be re-assigned.'
                  }
                ]
              });
            })
          );
        });
        cy.findByTestId('submit').click();
      });

      it('displays error message', () => {
        cy.findByText('STAN-123456 could not be re-assigned.').should('be.visible');
      });
    });
    context('on success', () => {
      before(() => {
        cy.findByTestId('submit').click();
      });

      it('displays success message', () => {
        cy.findByText('Operation Complete').should('be.visible');
        cy.findByText('All labware have been successfully re-assigned.').should('be.visible');
      });
    });
  });
});
