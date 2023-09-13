import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import {
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  RecordCompletionMutation,
  RecordCompletionMutationVariables
} from '../../../src/types/sdk';

describe('Probe Hybridisation QC', () => {
  describe('On load', () => {
    before(() => {
      cy.visit('/lab/probe_hybridisation_qc');
    });
    it('displays the correct title', () => {
      cy.get('h1').should('have.text', 'Probe Hybridisation QC');
    });
    it('displays the SGP number select box', () => {
      cy.findByText('SGP Number').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByTestId('input').should('be.visible');
    });
    it('save button should be hidden', () => {
      cy.findByText('Save').should('not.exist');
    });
  });
  describe('When a labware is scanned', () => {
    describe('labware has no Probe Hybridisation Xenium operation recorded', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>(
              'FindLatestOperation',
              (req, res, ctx) => {
                return res.once(ctx.data({ findLatestOp: null }));
              }
            )
          );
        });
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
      });
      it('shows an error message', () => {
        cy.findByText(
          'No Probe Hybridisation Xenium operation has been recorded on the following labware: STAN-3111'
        ).should('be.visible');
      });
      it('should not render the labware image', () => {
        cy.findByTestId('labware').should('not.exist');
      });
      it('should not show the save button', () => {
        cy.findByText('Save').should('not.exist');
      });
    });
    describe('labware has a Probe Hybridisation Xenium operation recorded', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>(
              'FindLatestOperation',
              (req, res, ctx) => {
                return res.once(ctx.data({ findLatestOp: { id: 1 } }));
              }
            )
          );
        });
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
      });

      it('shows the labware image', () => {
        cy.findByTestId('labware').should('be.visible');
      });
      it('shows the completion Date time select box', () => {
        cy.findByLabelText('Completion Time').should('be.visible');
      });
      it('should init completed time to the current time', () => {
        cy.findByLabelText('Completion Time').should('contain.value', new Date().toISOString().split('T')[0]);
      });
      it('shows the global comments select box', () => {
        cy.findByTestId('globalComment').should('be.visible');
      });
      it('shows the save button', () => {
        cy.findByText('Save').should('be.visible');
      });
      describe('When a selecting a comment from the global comment select box', () => {
        before(() => {
          selectOption('globalComment', 'Issue with thermal cycler');
        });
        it('populates table rows comment column automatically with the selected value(s)', () => {
          cy.get('tbody tr').eq(0).find('td').eq(6).should('have.text', 'Issue with thermal cycler');
        });
      });
    });
  });
  describe('Validation', () => {
    describe('When the SCP number is not selected', () => {
      before(() => {
        cy.findByText('Save').click();
      });
      it('should display an error message requires SGP number', () => {
        cy.findByText('SGP Number is required').should('be.visible');
      });
    });
    describe('When completion time is selected in the future', () => {
      before(() => {
        cy.findByLabelText('Completion Time').clear().type('2075-01-01T10:00');
        cy.findByText('Save').click();
      });
      it('should display an error message', () => {
        cy.findByText('Please select a time on or before current time').should('be.visible');
      });
    });
  });

  describe('Submission', () => {
    context('should fail when  repeated comment specified for the same section', () => {
      before(() => {
        cy.visit('/lab/probe_hybridisation_qc');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>(
              'FindLatestOperation',
              (req, res, ctx) => {
                return res.once(ctx.data({ findLatestOp: { id: 1 } }));
              }
            )
          );
        });

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>(
              'RecordCompletion',
              (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message: 'The request could not be validated.',
                      extensions: {
                        problems: ['Repeated comment specified in: [STAN-0EB01]']
                      }
                    }
                  ])
                );
              }
            )
          );
        });
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-0EB01{enter}');
        cy.findByText('Save').click();
      });
      it('shows an error message', () => {
        cy.findByText('Repeated comment specified in: [STAN-0EB01]').should('be.visible');
      });
    });
    context('When there is no server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>(
              'RecordCompletion',
              (req, res, ctx) => {
                return res.once(
                  ctx.data({
                    recordCompletion: {
                      operations: [
                        {
                          id: 10426
                        }
                      ]
                    }
                  })
                );
              }
            )
          );
        });
        cy.findByText('Save').click();
      });

      it('shows a success message', () => {
        cy.findByText('Probe Hybridisation QC recorded for all labware(s)').should('be.visible');
      });
    });
  });
});
