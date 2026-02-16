import { selectOption } from '../shared/customReactSelect.cy';
import {
  FindFilesQuery,
  FindFilesQueryVariables,
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  RecordAnalyserMutation,
  RecordAnalyserMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Xenium Analyser', () => {
  before(() => {
    cy.visit('/lab/xenium_analyser');
  });
  describe('when scanning labware which has not recorded probe hybridisation', () => {
    before(() => {
      //FindLatestOperationQuery should return null
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
    });
    it('should display a warning message', () => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
      cy.findByText('No probe hybridisation recorded for STAN-3111').should('be.visible');
      cy.findByText('Analyser Details').should('not.exist');
    });
    after(() => {
      cy.findByTestId('removeButton').click();
    });
  });
  describe('When a labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('shows labware table', () => {
      cy.findAllByRole('table').eq(0).should('have.length.above', 0);
      //Table should display barcode of labware scanned
      cy.findAllByRole('table').contains('td', 'STAN-3111');
    });
    context('when a region of interest is set', () => {
      before(() => {
        cy.findByTestId('STAN-3111-1-roi').clear().type('123456789').blur();
      });
      after(() => {
        cy.findByTestId('closeBarcodeDisplayer').click();
      });
      it('displays the barcodeDisplayer', () => {
        cy.findByText('Scan the region barcode into your machine').should('be.visible');
      });
      it('the barcodeDisplayer contains the roi barcode', () => {
        cy.findByTestId('2d-barcode').contains('123456789');
      });
    });

    describe('When a SGP number is set', () => {
      context('when a SGP number with previously uploaded file is selected', () => {
        before(() => {
          selectOption('STAN-3111-workNumber', 'SGP1009');
        });
        it('displays a link to the SGP folder link ', () => {
          cy.findByTestId('sgp-folder-link').should('exist');
        });
      });
      context('when an SGP number with no previously uploaded file is selected', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.query<FindFilesQuery, FindFilesQueryVariables>('FindFiles', () => {
                return HttpResponse.json({ data: { listFiles: [] } }, { status: 200 });
              })
            );
          });
          selectOption('STAN-3111-workNumber', 'SGP1009');
        });
        it('hides the SGP folder link', () => {
          cy.findByTestId('sgp-folder-link').should('not.exist');
        });
      });
    });

    describe('Defining new regions of interest', () => {
      before(() => {
        cy.findByTestId('define-regions-button').click();
      });
      it('displays regions definer component', () => {
        cy.findByText('Set Regions').should('be.visible');
      });
      describe('creating a new region', () => {
        before(() => {
          cy.findByTestId('region-color-0').click();
          cy.findByTestId('labware-region-definer-container').within(() => {
            cy.findByText('A1').click();
            cy.findByText('B1').click({ cmdKey: true });
          });
          cy.findByTestId('create-update-region-button').click();
          cy.findByText('Done').click();
        });
        it('adds a region border with the same selected color on the the selected slots', () => {
          cy.findByTestId('labware-STAN-3111').within(() => {
            cy.get('div.border-black').should('have.length', 2);
          });
        });
        it('updates the regions table accordingly', () => {
          cy.findByTestId('STAN-3111-regions-table').get('tbody tr').should('have.length', 4);
        });
        it('updates the region name accordingly', () => {
          cy.findByText('SGP1009_Region1').should('be.visible');
        });
      });

      describe('removing a region', () => {
        before(() => {
          cy.findByTestId('define-regions-button').click();
          cy.findByTestId('region-color-0').click();
          cy.findByTestId('remove-region-button').click();
          cy.findByText('Done').click();
        });
        it('removes the region border from the slots of that region', () => {
          cy.findByTestId('labware-STAN-3111').within(() => {
            cy.get('div.border-black').should('have.length', 0);
          });
        });
        it('updates the regions table accordingly', () => {
          cy.findByTestId('STAN-3111-regions-table').get('tbody tr').should('have.length', 5);
        });
        it('renames the region of interest with the sample external id', () => {
          cy.findByText('SGP1009_Region1').should('not.exist');
        });
      });
    });
  });
  describe('When  two labware are scanned ', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3112{enter}'); //scan second labware
    });
    it('should display Analyser Details for STAN-3112', () => {
      cy.findAllByRole('table').eq(1).contains('STAN-3112');
      cy.findByTestId('STAN-3112-workNumber').should('exist');
      cy.findByTestId('STAN-3112-position').should('exist');
      cy.findByTestId('STAN-3112-regions-table').should('exist');
    });
    it('should disable any further labware scanning', () => {
      cy.get('#labwareScanInput').should('be.disabled');
    });
  });
  describe('When  two labware are scanned and one is removed', () => {
    before(() => {
      cy.findAllByTestId('removeButton').eq(1).click();
    });
    it('should only display Analyser Details for STAN-3111', () => {
      cy.findByText('STAN-3112').should('not.exist');
      cy.findByTestId('STAN-3112-workNumber').should('not.exist');
      cy.findByTestId('STAN-3112-position').should('not.exist');
      cy.findByTestId('STAN-3112-regions-table').should('not.exist');
    });
    it('should enable labware scanning', () => {
      cy.get('#labwareScanInput').should('be.enabled');
    });
  });

  describe('On save', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
      fillInForm();
    });
    context('When there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('RecordAnalyser', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while fetching data (/CytAssist) : The operation could not be validated.',
                    extensions: {
                      problems: ['Labware is discarded: [STAN-3111]']
                    }
                  }
                ]
              });
            })
          );
        });

        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-3111]').should('be.visible');
      });
    });
    context('When there is no server error', () => {
      before(() => {
        cy.findByRole('button', { name: 'Save' }).click();
      });

      it('shows a success message', () => {
        cy.findByText('Xenium analyser recorded on all labware').should('be.visible');
      });
    });
  });

  /**Fill all required fields in Xenium Analyser Details form */
  function fillInForm() {
    cy.findByTestId('performed').clear().type('2020-01-01T10:00').blur();
    cy.findByTestId('runName').clear().type('Run 123').blur();
    cy.findByTestId('lotNumberA').clear().type('Lot123').blur();
    cy.findByTestId('lotNumberB').clear().type('Lot456').blur();
    selectOption('equipmentId', 'Xenium 1');
    selectOption('STAN-3111-workNumber', 'SGP1008');
    selectOption('STAN-3111-position', 'Left');
    for (let indx = 0; indx < 4; indx++) {
      cy.findByTestId(`STAN-3111-${indx}-roi`).clear().type('123456789').blur();
      cy.findByTestId('closeBarcodeDisplayer').click();
    }
  }
});
