import {
  AnalyserRequest,
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  GetAnalyserScanDataQuery,
  GetAnalyserScanDataQueryVariables,
  RecordAnalyserMutation,
  RecordAnalyserMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import { selectOption, shouldDisplaySelectedValue, shouldOptionsHaveLength } from '../shared/customReactSelect.cy';

//A1 is the first slot and the barcode is above it, as the slide sits in the Atera
const shouldDrawSlideWithA1AndBarcodeAtTheTop = (barcode: string) => {
  cy.findByTestId(`labware-${barcode}`).within(() => {
    cy.findAllByTestId(/^slot-wrapper-/)
      .first()
      .should('have.attr', 'data-testid', 'slot-wrapper-A1')
      .then(($a1) => {
        cy.contains(barcode).should(($barcode) => {
          expect($barcode[0].getBoundingClientRect().bottom).to.be.at.most($a1[0].getBoundingClientRect().top);
        });
      });
  });
};

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
    it('does not warn about the number of slides when the run has 2', () => {
      cy.findByText(/Atera runs usually have 2 or 4/).should('not.exist');
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
    it('warns that the run has 3 slides, counting only those with probe hybridisation Atera', () => {
      cy.findByText('This run has 3 slides. Atera runs usually have 2 or 4.').should('be.visible');
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
    it('no longer warns about the number of slides', () => {
      cy.findByText(/Atera runs usually have 2 or 4/).should('not.exist');
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
    it('draws each slide with A1 and the barcode at the top', () => {
      shouldDrawSlideWithA1AndBarcodeAtTheTop('STAN-0612');
      shouldDrawSlideWithA1AndBarcodeAtTheTop('STAN-0613');
    });
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
      it('draws the slide with A1 and the barcode at the top', () => {
        cy.findByRole('dialog').within(() => {
          shouldDrawSlideWithA1AndBarcodeAtTheTop('STAN-0613');
        });
      });
      it('closes it when Done is clicked', () => {
        cy.findByRole('button', { name: 'Done' }).click();
        cy.findByRole('dialog').should('not.exist');
      });
    });

    context('Cassette position', () => {
      it('offers the positions 1 to 4', () => {
        shouldOptionsHaveLength('STAN-0612-position', 4);
        // Close the menu before the next test.
        cy.get('body').click(0, 0);
      });

      context('when two labware have the same position', () => {
        before(() => {
          selectOption('STAN-0612-position', '1');
          selectOption('STAN-0613-position', '1');
          // Leave the select, so it shows its error.
          cy.get('body').click(0, 0);
        });
        it('shows an error on both', () => {
          cy.findAllByText('Cassette Position is used by more than one slide').should('have.length', 2);
        });
      });

      context('when one of them is changed', () => {
        before(() => {
          selectOption('STAN-0613-position', '2');
          cy.get('body').click(0, 0);
        });
        it('no longer shows the error', () => {
          cy.findByText('Cassette Position is used by more than one slide').should('not.exist');
        });
      });
    });
  });

  describe('On save', () => {
    before(() => {
      //Remove the labware without probe hybridisation, which can't be saved
      cy.findAllByTestId('removeButton').eq(0).click();
      cy.findByTextContent('No probe hybridisation recorded for STAN-0611').should('not.exist');
      cy.findByTestId('performed').clear().type('2020-01-01T10:00').blur();
      selectOption('equipmentId', 'Atera 1');
      selectOption('workTypeCommentId', 'Atera WTA 2 slides');
      //Ends with a space, which the save leaves out
      cy.findByTestId('runName').clear().type('Run 123 ').blur();
    });

    context('when there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('RecordAnalyser', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while fetching data (/recordAnalyser) : The operation could not be validated.',
                    extensions: {
                      problems: ['Run name already used: "Run 123"']
                    }
                  }
                ]
              });
            })
          );
        });
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows the error', () => {
        cy.findByTextContent('Run name already used: "Run 123"').should('be.visible');
      });
    });

    context('when there is no server error', () => {
      let request: AnalyserRequest | undefined;
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>(
              'RecordAnalyser',
              ({ variables }) => {
                request = variables.request;
                return HttpResponse.json({ data: { recordAnalyser: { operations: [{ id: 1 }] } } });
              }
            )
          );
        });
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows a success message', () => {
        cy.findByText('Atera run recorded on all labware').should('be.visible');
      });
      it('records an Atera run with the run details, the run name trimmed and no lots', () => {
        cy.wrap(null).should(() => {
          expect(request).to.include({
            operationType: 'Atera run',
            performed: '2020-01-01 10:00:00',
            runName: 'Run 123',
            repeat: false
          });
          expect(request!.equipmentId).to.be.a('number');
          expect(request!.workTypeCommentId).to.be.a('number');
          expect(request).not.to.have.any.keys('lotNumberA', 'lotNumberB', 'cellSegmentationLot');
        });
      });
      it('sends each labware with its SGP number, cassette position and samples, and no left or right position', () => {
        cy.wrap(null).should(() => {
          expect(
            request!.labware.map(({ barcode, workNumber, index }) => ({ barcode, workNumber, index }))
          ).to.deep.equal([
            { barcode: 'STAN-0612', workNumber: 'SGP1008', index: 1 },
            { barcode: 'STAN-0613', workNumber: 'SGP1008', index: 2 }
          ]);
          request!.labware.forEach((lw) => {
            expect(lw).not.to.have.property('position');
            expect(lw.samples).to.have.length.above(0);
          });
        });
      });
    });
  });
});
