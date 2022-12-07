import { UnreleaseMutation, UnreleaseMutationVariables } from '../../../src/types/sdk';

describe('Unrelease Page', () => {
  before(() => {
    cy.visit('/admin/unrelease');
  });

  describe('Display', () => {
    context('on intialisation', () => {
      it('should display a SGP number field', () => {
        cy.findByTestId('workNumber').should('be.visible');
      });
      it('should display an enabled labware scan input', () => {
        cy.get('#labwareScanInput').should('not.be.disabled');
      });
    });
  });
  describe('Validation', () => {
    context('when the section number is below 0', () => {
      before(() => {
        cy.get('#labwareScanInput').should('not.be.disabled').wait(1000).type('STAN-611{enter}');

        cy.get("input[name='labware.0.highestSection']").type('{selectall}-1');

        cy.findByRole('button', { name: /Submit/i }).click();
      });

      it('shows an error', () => {
        cy.findByText('Section number must be greater than or equal to 0').should('be.visible');
      });
    });
    context('when the section number is below 0', () => {
      before(() => {
        cy.get('#labwareScanInput').should('not.be.disabled').wait(1000).type('STAN-3111{enter}');
        cy.findByRole('button', { name: /Submit/i }).click();
      });
      it('shows an error', () => {
        cy.findByText('SGP Number is a required field').should('be.visible');
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
        cy.findByTestId('workNumber').select('SGP1008');
        cy.get('#labwareScanInput').should('not.be.disabled').wait(1000).type('STAN-3112{enter}');
        cy.findByRole('button', { name: /Submit/i }).click();
      });

      it('shows the server errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });

    context('when the submission is successful', () => {
      before(() => {
        cy.visit('admin/unrelease');
        cy.findByTestId('workNumber').select('SGP1008');
        cy.get('#labwareScanInput').should('not.be.disabled').wait(1000).type('STAN-3111{enter}');
        cy.findByRole('button', { name: /Submit/i }).click();
      });

      it('shows the Operation Complete', () => {
        cy.findByRole('dialog').should('exist');
      });
    });
  });
});
