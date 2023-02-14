import { UnreleaseMutation, UnreleaseMutationVariables } from '../../../src/types/sdk';
import { selectFocusBlur, selectSGPNumber } from '../shared/customReactSelect.cy';

describe('Unrelease Page', () => {
  before(() => {
    cy.visit('/admin/unrelease');
  });

  describe('Display', () => {
    context('on intialisation', () => {
      it('should display a SGP number field', () => {
        cy.findByText('SGP Number').should('be.visible');
      });
      it('should display an enabled labware scan input', () => {
        cy.get('#labwareScanInput').should('not.be.disabled');
      });
    });
  });
  describe('Validation', () => {
    context('when the section number is below 0', () => {
      before(() => {
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').should('not.be.disabled').type('STAN-611{enter}');
        cy.get("input[name='labware.0.highestSection']").type('{selectall}-1');
        cy.findByRole('button', { name: /Submit/i }).click();
      });

      it('shows an error', () => {
        cy.findByText('Section number must be greater than or equal to 0').should('be.visible');
      });
    });
    context('when SGP Number not given', () => {
      before(() => {
        cy.get('#labwareScanInput').clear().type('STAN-3111{enter}');
        selectSGPNumber('');
        selectFocusBlur('workNumber');
      });
      it('shows an error', () => {
        cy.findByText('SGP number is required').should('be.visible');
      });
    });
  });

  describe('Submission', () => {
    context('when the submission fails server side', () => {
      before(() => {
        cy.visit('admin/unrelease');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<UnreleaseMutation, UnreleaseMutationVariables>('Unrelease', (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    extensions: {
                      problems: ['This thing went wrong', 'This other thing went wrong']
                    }
                  }
                ])
              );
            })
          );
        });
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').should('not.be.disabled').type('STAN-3112{enter}');
        cy.findByRole('button', { name: /Submit/i }).click({ force: true });
      });

      it('shows the server errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });

    context('when the submission is successful', () => {
      before(() => {
        cy.visit('admin/unrelease');
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').should('not.be.disabled').type('STAN-3111{enter}');
        cy.findByRole('button', { name: /Submit/i }).click({ force: true });
      });

      it('shows the Operation Complete', () => {
        cy.findByRole('dialog').should('exist');
      });
    });
  });
});
