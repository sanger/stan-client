import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { ReactivateLabwareMutation, ReactivateLabwareMutationVariables } from '../../../src/types/sdk';

describe('Reactivate', () => {
  describe('Validation', () => {
    before(() => {
      cy.visit('/admin/reactivate');
      cy.get('#labwareScanInput').type('STAN-123456{enter}');
      selectOption('labwareToReactivate[0].commentId', 'Destroyed by mistake');
      cy.findByRole('button', { name: 'Reactivate' }).click();
    });
    it('displays error message when no SGP number is entered', () => {
      cy.findByText('SGP Number is a required field').should('be.visible');
    });
  });
  describe('scanning multiple labware', () => {
    before(() => {
      cy.visit('/admin/reactivate');
      selectSGPNumber('SGP1008');
      cy.get('#labwareScanInput').type('STAN-123456{enter}');
      cy.get('#labwareScanInput').type('STAN-123457{enter}');
      selectOption('labwareToReactivate[0].commentId', 'Destroyed by mistake');
      cy.findByRole('button', { name: 'Reactivate' }).click();
    });
    context('Each labware must have a reactivation reason', () => {
      it('displays error message if no reason is selected for a labware', () => {
        cy.findByText('Reason to Reactivate is a required field').should('be.visible');
      });
    });
  });
  describe('server response', () => {
    context('when  successful', () => {
      before(() => {
        cy.visit('/admin/reactivate');
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-123456{enter}');
        selectOption('labwareToReactivate[0].commentId', 'Destroyed by mistake');
        cy.findByRole('button', { name: 'Reactivate' }).click();
      });
      it('displays success message', () => {
        cy.findByText('All labware have been successfully reactivated.').should('be.visible');
      });
    });
    context('when  errors', () => {
      before(() => {
        cy.visit('/admin/reactivate');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<ReactivateLabwareMutation, ReactivateLabwareMutationVariables>(
              'ReactivateLabware',
              (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message: 'The request could not be performed.',
                      extensions: {
                        problems: ['Something wrong happened.']
                      }
                    }
                  ])
                );
              }
            )
          );
        });
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-123456{enter}');
        selectOption('labwareToReactivate[0].commentId', 'Discarded by mistake');
        cy.findByRole('button', { name: 'Reactivate' }).click();
      });
      it('displays an error message', () => {
        cy.findByText('Something wrong happened.').should('be.visible');
      });
    });
  });
});
