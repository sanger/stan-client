import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import {
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  RecordCompletionMutation,
  RecordCompletionMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

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
    it('save button should be disabled', () => {
      cy.findByText('Save').should('be.disabled');
    });
  });
  describe('When a labware is scanned', () => {
    describe('labware has no Probe Hybridisation Xenium operation recorded', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>('FindLatestOperation', () => {
              return HttpResponse.json({
                data: {
                  findLatestOp: null
                }
              });
            })
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
      it('should not enable the save button', () => {
        cy.findByText('Save').should('be.disabled');
      });
    });
    describe('labware has a Probe Hybridisation Xenium operation recorded', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>('FindLatestOperation', () => {
              return HttpResponse.json({
                data: {
                  findLatestOp: {
                    id: 1
                  }
                }
              });
            })
          );
        });
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
      });

      it('shows the labware image', () => {
        cy.findByTestId('labware').should('be.visible');
      });
      it('shows the completion Date time select box', () => {
        cy.findByText('Completion Time').should('be.visible');
      });
      it('should init completed time to the current time', () => {
        cy.findByTestId('completionDateTime').should('contain.value', new Date().toISOString().split('T')[0]);
      });
      it('shows the global comments select box', () => {
        cy.findByTestId('globalComment').should('be.visible');
      });
      it('shows the labware sgp number', () => {
        cy.findByTestId('workNumber').should('be.visible');
      });

      describe('When a selecting a comment from the global comment select box', () => {
        before(() => {
          selectOption('globalComment', 'Issue with thermal cycler');
        });
        it('populates table rows comment column automatically with the selected value(s)', () => {
          cy.get('tbody tr').eq(0).find('td').eq(6).should('have.text', 'Issue with thermal cycler');
        });
      });

      describe('When selecting a global SGP number', () => {
        before(() => {
          selectOption('globalWorkNumber', 'SGP1008');
        });
        it('should populate all the sgp number relative to the scanned labware', () => {
          cy.findAllByTestId('workNumber').each((el) => {
            expect(el).to.have.text('SGP1008');
          });
        });
      });
    });
  });

  describe('Validation', () => {
    describe('When the SGP number is not selected', () => {
      before(() => {
        selectOption('globalWorkNumber', '');
      });
      it('disables save button', () => {
        cy.findByText('Save').should('be.disabled');
      });
    });
    describe('The user can not select a future date', () => {
      before(() => {
        cy.findByTestId('completionDateTime').clear().type('2075-01-01T10:00');
      });
      it('displays an error message', () => {
        cy.findByText('Please select a time on or before current time').should('be.visible');
      });
      it('keeps the current date', () => {
        cy.findByTestId('completionDateTime').should('contain.value', new Date().toISOString().split('T')[0]);
      });
    });
  });

  describe('Submission', () => {
    context('When fail with repeated comment specified for the same section', () => {
      before(() => {
        cy.visit('/lab/probe_hybridisation_qc');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>('FindLatestOperation', () => {
              return HttpResponse.json({
                data: {
                  findLatestOp: {
                    id: 1
                  }
                }
              });
            })
          );
        });

        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>('RecordCompletion', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'The request could not be validated.',
                    extensions: {
                      problems: ['Repeated comment specified in: [STAN-0EB01]']
                    }
                  }
                ]
              });
            })
          );
        });
        selectOption('globalWorkNumber', 'SGP1008');
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
            graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>('RecordCompletion', () => {
              return HttpResponse.json({
                data: {
                  recordCompletion: {
                    operations: [
                      {
                        id: 10426
                      }
                    ]
                  }
                }
              });
            })
          );
        });
        cy.findByText('Save').click();
      });

      it('shows a success message', () => {
        cy.findByText('Probe Hybridisation QC recorded for all labware(s)').should('be.visible');
      });
    });
    context('When request successes for some labware and fails for others', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>(
              'RecordCompletion',
              ({ variables }) => {
                if (variables.request.labware[0].barcode === 'STAN-11B01') {
                  return HttpResponse.json({
                    errors: [
                      {
                        message: 'The request could not be validated.',
                        extensions: {
                          problems: ['Repeated comment specified in: [STAN-0EB01]']
                        }
                      }
                    ]
                  });
                }
                return HttpResponse.json({
                  data: {
                    recordCompletion: {
                      operations: [
                        {
                          id: 10426
                        }
                      ]
                    }
                  }
                });
              }
            )
          );
        });

        cy.reload();
        selectOption('globalWorkNumber', 'SGP1008');
        cy.get('#labwareScanInput').type('STAN-11B01{enter}');
        selectOption('globalComment', 'Issue with thermal cycler');
        cy.get('#labwareScanInput').type('STAN-21B01{enter}');
        cy.findByText('Save').click();
      });
      it('shows an error message', () => {
        cy.findByText('Repeated comment specified in: [STAN-0EB01]').should('be.visible');
      });
      it('shows a success message', () => {
        cy.findByText('Probe Hybridisation QC recorded for the following labware: STAN-21B01').should('be.visible');
      });
      it('keeps save button enabled', () => {
        cy.findByText('Save').should('be.enabled');
      });
    });
  });
});
