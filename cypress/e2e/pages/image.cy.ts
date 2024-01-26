import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { RecordInPlaceMutation, RecordInPlaceMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Imaging Page', () => {
  before(() => {
    cy.visit('/lab/imaging');
  });

  describe('Validation', () => {
    context('when submitting the form with nothing filled in', () => {
      before(() => cy.findByRole('button', { name: 'Submit' }).click());

      it('shows a validation error for labware', () => {
        cy.findByText('Labware field must have at least 1 items').should('be.visible');
      });

      it('shows a validation error for the work number', () => {
        cy.findByText('SGP Number is a required field').should('be.visible');
      });
    });
  });
  context('On succesful submisstion', () => {
    before(() => {
      submitForm();
    });
    it('should display a success messgae', () => {
      cy.findAllByText('Operation Complete').should('have.length.above', 1);
    });
  });

  context('when there is a server error', () => {
    before(() => {
      cy.visit('/lab/imaging');

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<RecordInPlaceMutation, RecordInPlaceMutationVariables>('RecordInPlace', () => {
            return HttpResponse.json({
              errors: [
                {
                  message: `Exception while fetching data (/imaging) : Something went wrong`
                }
              ]
            });
          })
        );
      });
      submitForm();
    });

    it('shows an error', () => {
      cy.findByText('Something went wrong').should('be.visible');
    });
  });
});

function submitForm() {
  selectSGPNumber('SGP1008');
  cy.get('#labwareScanInput').type('STAN-123{enter}');
  cy.get('#labwareScanInput').type('STAN-456{enter}');
  selectOption('equipment', 'Operetta');
  cy.findByRole('button', { name: /Submit/i }).click();
}
