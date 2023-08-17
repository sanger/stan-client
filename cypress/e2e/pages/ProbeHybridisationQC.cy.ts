import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { RecordCompletionMutation, RecordCompletionMutationVariables } from '../../../src/types/sdk';

describe('Probe Hybridisation QC', () => {
  before(() => {
    cy.visit('/lab/probe_hybridisation_qc');
  });
  describe('On load', () => {
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
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('shows the labware image', () => {
      cy.findByTestId('labware').should('be.visible');
    });
    it('shows the completion Date time select box', () => {
      cy.findByLabelText('Completion Time').should('be.visible');
    });
    it('shows the global comments select box', () => {
      cy.findByTestId('globalComment').should('be.visible');
    });
    it('shows the save button', () => {
      cy.findByText('Save').should('be.visible');
    });
    describe('When a selecting a comment from the global comment select box', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectOption('globalComment', 'Poor section quality');
      });
      it('populates table rows comment column automatically with the selected value(s)', () => {
        cy.get('tbody tr').eq(0).find('td').eq(6).should('have.text', 'Poor section quality');
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
      const currentDate = new Date().toLocaleString('en-GB', { hour12: false }).split(' ');
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
    context('when selecting a released labware', () => {
      before(() => {
        cy.visit('/lab/probe_hybridisation_qc');
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
                        problems: ['Labware is released: [STAN-0EB01]']
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
        cy.findByText('Labware is released: [STAN-0EB01]').should('be.visible');
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
