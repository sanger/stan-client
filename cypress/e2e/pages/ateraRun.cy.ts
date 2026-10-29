import {
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  GetAnalyserScanDataQuery,
  GetAnalyserScanDataQueryVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Atera Run', () => {
  before(() => {
    cy.visit('/lab/atera_run');
  });

  describe('On load', () => {
    it('displays the correct title', () => {
      cy.get('h1').should('have.text', 'Atera Run');
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
});
