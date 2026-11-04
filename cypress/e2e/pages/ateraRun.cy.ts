import {
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  GetAnalyserScanDataQuery,
  GetAnalyserScanDataQueryVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import { selectOption, shouldDisplaySelectedValue, shouldOptionsHaveLength } from '../shared/customReactSelect.cy';

describe('Atera Run', () => {
  before(() => {
    cy.visit('/lab/atera_run');
  });

  describe('On load', () => {
    it('displays the correct title', () => {
      cy.get('h1').should('have.text', 'Atera Run');
    });
    it('does not display the run details', () => {
      cy.findByText('Run Details').should('not.exist');
    });
  });

  describe('When labware is scanned', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          //Probe hybridisation Atera is recorded on every labware except STAN-0611
          graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>(
            'FindLatestOperation',
            ({ variables }) => {
              return HttpResponse.json({
                data: {
                  findLatestOp:
                    variables.operationType === 'Probe hybridisation Atera' && variables.barcode !== 'STAN-0611'
                      ? { id: 1 }
                      : null
                }
              });
            }
          ),
          //Cell segmentation is recorded on STAN-0612 only
          graphql.query<GetAnalyserScanDataQuery, GetAnalyserScanDataQueryVariables>(
            'GetAnalyserScanData',
            ({ variables }) => {
              return HttpResponse.json({
                data: {
                  analyserScanData: {
                    workNumberXeniumStudyIds: [
                      { workNumber: 'SGP1008', xeniumStudyId: 1 },
                      { workNumber: 'SGP1008', xeniumStudyId: 2 },
                      { workNumber: 'SGP1009', xeniumStudyId: null }
                    ],
                    probes: ['Atera human WTA panel', 'Atera custom panel A'],
                    cellSegmentationRecorded: variables.barcode === 'STAN-0612'
                  }
                }
              });
            }
          )
        );
      });
      cy.get('#labwareScanInput').clear().type('STAN-0611{enter}');
      cy.findByTextContent('No probe hybridisation recorded for STAN-0611').should('be.visible');
      cy.get('#labwareScanInput').clear().type('STAN-0612{enter}');
      cy.findAllByRole('table').contains('td', 'STAN-0612');
      cy.get('#labwareScanInput').clear().type('STAN-0613{enter}');
      cy.findAllByRole('table').contains('td', 'STAN-0613');
    });
    it('shows a warning only for the labware without probe hybridisation Atera', () => {
      cy.findByTextContent('No probe hybridisation recorded for STAN-0611').should('be.visible');
      cy.findByTextContent('No probe hybridisation recorded for STAN-0612').should('not.exist');
      cy.findByTextContent('No probe hybridisation recorded for STAN-0613').should('not.exist');
    });
    it('shows each work number once, and the probe panels', () => {
      cy.findAllByText('SGP1008, SGP1009').should('have.length', 2);
      cy.findAllByText('Atera human WTA panel, Atera custom panel A').should('have.length', 2);
    });
    it('shows a tick when cell segmentation is recorded and a cross when it is not', () => {
      cy.findAllByTestId('passIcon').should('have.length', 1);
      cy.findAllByTestId('failIcon').should('have.length', 1);
    });
  });

  describe('When four labware are scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').clear().type('STAN-0614{enter}');
      cy.findAllByRole('table').contains('td', 'STAN-0614');
    });
    it('disables any further labware scanning', () => {
      cy.get('#labwareScanInput').should('be.disabled');
    });
  });

  describe('When a labware is removed', () => {
    before(() => {
      cy.findAllByTestId('removeButton').eq(3).click();
    });
    it('no longer shows that labware', () => {
      cy.findByText('STAN-0614').should('not.exist');
    });
    it('enables labware scanning', () => {
      cy.get('#labwareScanInput').should('be.enabled');
    });
  });

  describe('Run details', () => {
    it('displays the run details fields', () => {
      cy.findByText('Run Details').should('be.visible');
      ['performed', 'equipmentId', 'workNumberAll', 'runName', 'is-repeat-run', 'workTypeCommentId'].forEach(
        (testId) => {
          cy.findByTestId(testId).should('exist');
        }
      );
    });
    it('offers only the Atera equipment', () => {
      shouldOptionsHaveLength('equipmentId', 3);
      cy.findByTestId('equipmentId').within(() => {
        cy.findByText('Atera 1').should('exist');
        cy.findByText('Atera 2').should('exist');
      });
    });
    it('offers the four run worktypes', () => {
      shouldOptionsHaveLength('workTypeCommentId', 5);
      cy.findByTestId('workTypeCommentId').within(() => {
        ['Atera WTA 4 slides', 'Atera WTA 2 slides', 'Atera Select 2 slides', 'Atera Select 4 slides'].forEach(
          (workType) => {
            cy.findByText(workType).should('exist');
          }
        );
      });
    });
  });

  describe('Labware details', () => {
    it('displays the SGP number and regions only for the labware with probe hybridisation Atera', () => {
      ['STAN-0612', 'STAN-0613'].forEach((barcode) => {
        cy.findByTestId(`${barcode}-workNumber`).should('exist');
        cy.findByTestId(`${barcode}-regions-table`).should('exist');
      });
      cy.findByTestId('STAN-0611-workNumber').should('not.exist');
      cy.findByTestId('STAN-0611-regions-table').should('not.exist');
    });

    context('when an SGP number is selected for all labware', () => {
      before(() => {
        selectOption('workNumberAll', 'SGP1008');
      });
      it('sets the SGP number of each labware', () => {
        shouldDisplaySelectedValue('STAN-0612-workNumber', 'SGP1008');
        shouldDisplaySelectedValue('STAN-0613-workNumber', 'SGP1008');
      });
    });

    context('when a region of interest is set', () => {
      before(() => {
        // Dismiss any open react-select/menu overlays before typing in.
        cy.get('body').click(0, 0);
        cy.findByTestId('STAN-0612-0-roi')
          .scrollIntoView()
          .clear({ force: true })
          .type('123456789', { force: true })
          .blur();
      });
      after(() => {
        cy.findByTestId('closeBarcodeDisplayer').click();
      });
      it('displays the region barcode to scan into the machine', () => {
        cy.findByText('Scan the region barcode into your machine').should('be.visible');
        cy.findByTestId('2d-barcode').contains('123456789');
      });
    });

    context('when Define Regions is clicked', () => {
      before(() => {
        cy.findAllByTestId('define-regions-button').eq(1).click();
      });
      it('opens one region definer', () => {
        cy.findAllByRole('dialog').should('have.length', 1);
        cy.findByText('Set Regions').should('be.visible');
      });
      it('closes it when Done is clicked', () => {
        cy.findByRole('button', { name: 'Done' }).click();
        cy.findByRole('dialog').should('not.exist');
      });
    });
  });
});
