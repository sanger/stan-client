import {
  GetRunNamesQuery,
  GetRunNamesQueryVariables,
  GetRunRoisQuery,
  GetRunRoisQueryVariables,
  RecordMetricsMutation,
  RecordMetricsMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';

describe('Xenium Metrics', () => {
  before(() => {
    cy.visit('/lab/xenium_metrics');
  });

  describe('On load', () => {
    it('displays the page without classing', () => {
      cy.findByText('Xenium Metrics').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByText('Labware').should('be.visible');
    });
    it('hides the save button', () => {
      cy.findByRole('button', { name: 'Save' }).should('not.exist');
    });
  });

  describe('When a labware with registered run names is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    // it('displays the region of interest table', () => {
    //   cy.findByRole('table').should('be.visible');
    // });
    it('displays the sgp number selector', () => {
      cy.findByTestId('workNumber').should('be.visible');
    });
    it('displays the run name selector', () => {
      cy.findByTestId('runName').should('be.visible');
    });
    it('disables the labware scanner', () => {
      cy.findByTestId('input').should('be.disabled');
    });
  });
  describe('When a labware with no run names is scanned', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<GetRunNamesQuery, GetRunNamesQueryVariables>('GetRunNames', () => {
            return HttpResponse.json({
              data: {
                runRois: []
              }
            });
          })
        );
      });
      cy.reload();
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('displays a message error', () => {
      cy.findByText('No run names found for the labware STAN-3111').should('be.visible');
    });
    it('keeps the labware scanner enabled', () => {
      cy.findByTestId('input').should('be.enabled');
    });
    it('does not display the metrics details', () => {
      cy.findByRole('table').should('not.exist');
    });
  });

  describe('On run name selection update', () => {
    describe('When a run name is selected with roi registered', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectOption('runName', 'Run Name 1');
      });
      it('displays the region of interest table', () => {
        cy.findByRole('table').should('be.visible');
      });
    });
    describe('When a run name is selected with no roi registered', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<GetRunRoisQuery, GetRunRoisQueryVariables>('GetRunRois', () => {
              return HttpResponse.json({
                data: {
                  runRois: []
                }
              });
            })
          );
        });
        cy.reload();
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectOption('runName', 'Run Name 1');
      });

      it('displays an error message', () => {
        cy.findByText('No regions of interest are recorded for the scanned labware and the selected run name.').should(
          'be.visible'
        );
      });
    });
  });

  describe('When a metric file is uploaded and sgp number is selected', () => {
    before(() => {
      cy.reload();
      fillInForm();
    });
    it('enables the save button', () => {
      cy.findByRole('button', { name: 'Save' }).should('be.enabled');
    });
  });
  describe('on Save', () => {
    describe('On server success', () => {
      before(() => {
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('displays success modal', () => {
        cy.findByText('Xenium Metrics recorded on labware STAN-3111').should('be.visible');
      });
    });
    describe('On server failure', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordMetricsMutation, RecordMetricsMutationVariables>('RecordMetrics', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while recording sample metrics : The operation could not be validated.',
                    extensions: {
                      problems: ['Labware is discarded: [STAN-3111]']
                    }
                  }
                ]
              });
            })
          );
        });
        cy.reload();
        fillInForm();
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('displays an error message', () => {
        cy.findByText('The operation could not be validated.').should('be.visible');
      });
    });
  });
});

const fillInForm = () => {
  cy.get('#labwareScanInput').type('STAN-3111{enter}');
  selectOption('runName', 'Run Name 1');
  selectSGPNumber('SGP1008');
  cy.get('#file-0')
    .scrollIntoView()
    .selectFile(
      {
        contents: Cypress.Buffer.from('metric_1,metric_2, metric_3\nvalue 1,value 2,value 3'),
        fileName: 'file.csv',
        lastModified: Date.now()
      },
      { force: true }
    );
  cy.get('#upload-btn-0').click();
};
