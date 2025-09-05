import { selectOption, selectSGPNumber, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import {
  FindMeasurementByBarcodeAndNameQuery,
  FindMeasurementByBarcodeAndNameQueryVariables,
  FindPermDataQuery,
  FindPermDataQueryVariables,
  RecordLibraryPrepMutation,
  RecordLibraryPrepMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';

describe('LibraryAmpAndGeneration Page', () => {
  describe('Sample Transfer', () => {
    before(() => {
      cy.visit('/lab/libraryGeneration');
      selectSGPNumber('SGP1008');
    });
    describe('When updating the destination selection mode', () => {
      before(() => {
        cy.get('[type="radio"][name="8 strip tube"]').check();
        cy.get('[type="radio"][name="96 well plate"]').check();
      });
      it('does not append destination plates', () => {
        cy.findByTestId('pager-text-div').contains('1 of 1');
      });
    });
    describe('Mapping Source with 8 strip tube Output labware', () => {
      describe('When all required fields for mapping are fulfilled', () => {
        before(() => {
          cy.get('[type="radio"][name="8 strip tube"]').check();
          cy.get('#labwareScanInput').type('STAN-9975B{enter}');
          mappingSamples('A1', 'B1');
          selectOption('input-labware-state', 'used');
          selectOption('bioState', 'Probes pre-clean');
        });
        it('enables Transfer Reagent button', () => {
          cy.findByRole('button', { name: 'Reagent Transfer >' }).should('be.enabled');
        });
      });
      describe('When mapping from multiple sources labware', () => {
        before(() => {
          cy.get('#labwareScanInput').type('STAN-9912{enter}');
          selectOption('input-labware-state', 'used');
          mappingSamples('A1', 'A1');
        });
        it('displays different sources in separate page', () => {
          cy.findByText('Slot mapping for STAN-9912').should('exist');
          const sourcesLeftPaginationButton = cy.findAllByTestId('left-button').eq(0);
          sourcesLeftPaginationButton.should('be.enabled');
          sourcesLeftPaginationButton.click();
          cy.findByText('Slot mapping for STAN-9975B').should('exist');
        });
        describe('On Reagent Transfer button click', () => {
          before(() => {
            cy.findByRole('button', { name: 'Reagent Transfer >' }).click();
          });
          it('displays destination labware with the mapped samples ', () => {
            cy.findByTestId('labware-').should('be.visible');
          });
        });
      });
      describe('Reagent Transfer', () => {
        describe('Before reagent transfer', () => {
          it('enables Sample transfer button ', () => {
            cy.findByRole('button', { name: '< Sample Transfer' }).should('be.enabled');
          });
          it('disables Record Cycle button', () => {
            cy.findByRole('button', { name: 'Record Cycle >' }).should('be.disabled');
          });
        });
        describe('After Reagent Transfer', () => {
          before(() => {
            selectOption('plateType', 'Dual Index TT Set A');
            cy.get('#sourceScanInput').within(() => {
              cy.findByRole('textbox').clear().type(`${dualIndexPlateBarcode}{enter}`);
            });
            transferReagent();
          });

          it('enables Record Cycle button ', () => {
            cy.findByRole('button', { name: 'Record Cycle >' }).should('be.enabled');
          });
        });
        describe('On go back to Sample Transfer', () => {
          before(() => {
            cy.findByRole('button', { name: '< Sample Transfer' }).click();
          });
          it('displays the previously scanned source(s)', () => {
            cy.findByTestId('labware-STAN-9975B').should('be.visible');
          });
          it('displays the previously selected destination', () => {
            cy.findByTestId('labware-').should('be.visible');
          });
          it('displays the previously selected labware state', () => {
            shouldDisplaySelectedValue('input-labware-state', 'used');
          });
          it('displays the previously selected bio state', () => {
            shouldDisplaySelectedValue('bioState', 'Probes pre-clean');
          });
          it('displays the previously selected output labware selection option', () => {
            cy.findByTestId('8 strip tube').should('be.checked');
          });
          it('displays the previously mapped samples', () => {
            cy.findByTestId('mapping_table').should('be.visible');
          });
        });

        describe('On On go back to Reagent Transfer', () => {
          before(() => {
            cy.findByRole('button', { name: 'Reagent Transfer >' }).click();
          });
          it('displays the previously scanned dual index plate', () => {
            cy.findByText(dualIndexPlateBarcode).should('be.visible');
          });
          it('display previously selected dual plate type', () => {
            shouldDisplaySelectedValue('plateType', 'Dual Index TT Set A');
          });
          it('displays previously transferred reagent should be visible', () => {
            cy.findByRole('table').should('be.visible');
          });
        });
      });
    });
    describe('On Record Cycle button click', () => {
      before(() => {
        cy.findByRole('button', { name: 'Record Cycle >' }).click();
      });
      it('displays the destination labware', () => {
        cy.findByTestId('labware-').should('be.visible');
      });
      it('disables save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      it('enables Reagent Transfer button', () => {
        cy.findByRole('button', { name: '< Reagent Transfer' }).should('be.enabled');
      });
      describe('When source(s) slots have cq values', () => {
        describe('When all cycle values are filled', () => {
          before(() => {
            fillInRecordCycleStep();
          });
          it('enables save button', () => {
            cy.findByRole('button', { name: 'Save' }).should('be.enabled');
          });
        });
      });
      describe('When updating the destination in the Sample Transfer step', () => {
        describe('Move back to Sample Transfer', () => {
          before(() => {
            cy.findByRole('button', { name: '< Reagent Transfer' }).click();
            cy.findByRole('button', { name: '< Sample Transfer' }).click();
            //scan a destination labware instead of using a pre-defined Layout
            cy.findByTestId('Scan Labware').click();
            cy.findByTestId('dest-scanner').within((elem) => {
              cy.wrap(elem).get('#labwareScanInput').type('STAN-9000F{enter}');
            });
          });
          it('removes the previously mapped samples', () => {
            cy.findByTestId('mapping_table').should('not.exist');
          });
          it('disables Reagent Transfer button', () => {
            cy.findByRole('button', { name: 'Reagent Transfer >' }).should('be.disabled');
          });
        });

        describe('When moving to Transfer Reagent', () => {
          before(() => {
            mappingSamples('A1', 'A1');
            mappingSamples('A2', 'A2');
            cy.findByRole('button', { name: 'Reagent Transfer >' }).click();
          });
          it('displays the previously scanned dual index plate', () => {
            cy.findByText(dualIndexPlateBarcode).should('be.visible');
          });
          it('displays the previously scanned dual index plate type ', () => {
            shouldDisplaySelectedValue('plateType', 'Dual Index TT Set A');
          });
          it('displays the newly scanned destination plate', () => {
            cy.findByText('STAN-9000F').should('be.visible');
          });
          it('removes the previously transferred reagents', () => {
            cy.findByRole('table').should('not.exist');
          });
          it('disables the Record Cycle button', () => {
            cy.findByRole('button', { name: 'Record Cycle >' }).should('be.disabled');
          });
        });
        describe('When moving to Record Cycle', () => {
          before(() => {
            transferReagent();
            cy.findByRole('button', { name: 'Record Cycle >' }).click();
          });
          it('displays the previously entered cycle value', () => {
            cy.findAllByTestId('CYCLES-input').each((elem) => {
              cy.wrap(elem).should('have.value', '3');
            });
          });
        });
      });

      describe('When updating the source(s) from Sample Transfer step', () => {
        describe('Move back to Sample Transfer', () => {
          before(() => {
            cy.findByRole('button', { name: '< Reagent Transfer' }).click();
            cy.findByRole('button', { name: '< Sample Transfer' }).click();
            //remove all the previously scanned sources
            cy.findByTestId('removeButton').click();
            cy.findByTestId('removeButton').click();
          });
          it('removes the previously mapped samples', () => {
            cy.findByTestId('mapping_table').should('not.exist');
          });
          it('disables Reagent Transfer button', () => {
            cy.findByRole('button', { name: 'Reagent Transfer >' }).should('be.disabled');
          });
          it('keeps the selected output labware selection option', () => {
            cy.findByTestId('Scan Labware').should('be.checked');
          });
          it('keeps the previously scanned destination', () => {
            cy.findByText('STAN-9000F').should('be.visible');
          });
        });

        describe('When moving to Transfer Reagent', () => {
          before(() => {
            cy.get('#labwareScanInput').type('STAN-9975B{enter}');
            mappingSamples('A1', 'A1');
            selectOption('input-labware-state', 'used');
            cy.findByRole('button', { name: 'Reagent Transfer >' }).click();
          });
          it('displays the previously scanned dual index plate', () => {
            cy.findByText(dualIndexPlateBarcode).should('be.visible');
          });
          it('displays the previously scanned dual index plate type ', () => {
            shouldDisplaySelectedValue('plateType', 'Dual Index TT Set A');
          });
          it('displays the previously scanned destination plate', () => {
            cy.findByText('STAN-9000F').should('be.visible');
          });
          it('removes the previously transferred reagents', () => {
            cy.findByRole('table').should('not.exist');
          });
          it('disables the Record Cycle button', () => {
            cy.findByRole('button', { name: 'Record Cycle >' }).should('be.disabled');
          });
        });
        describe('When moving to Record Cycle', () => {
          before(() => {
            transferReagent();
            cy.findByRole('button', { name: 'Record Cycle >' }).click();
          });
          it('removes the previously entered cycle values ', () => {
            cy.findAllByTestId('CYCLES-input').each((elem) => {
              cy.wrap(elem).should('have.value', '');
            });
          });
        });
      });
    });
  });

  describe('When using a source with no Cq values', () => {
    before(() => {
      cy.reload();
      selectSGPNumber('SGP1008');
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindMeasurementByBarcodeAndNameQuery, FindMeasurementByBarcodeAndNameQueryVariables>(
            'FindMeasurementByBarcodeAndName',
            () => {
              return HttpResponse.json({
                data: {
                  measurementValueFromLabwareOrParent: []
                }
              });
            }
          )
        );
      });
      fillInSampleTransferStep();
      fillInReagentTransferStep();
    });
    it('displays a warning message', () => {
      cy.findByText('No Cq values associated with the labware slots').should('be.visible');
    });
    it('displays the destination labware', () => {
      cy.findByTestId('labware-').should('be.visible');
    });
    it('keeps save disabled', () => {
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
    });
  });

  describe('On Save Click', () => {
    describe('When there is perm operation associated to the scanned source(s)', () => {
      before(() => {
        cy.reload();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindPermDataQuery, FindPermDataQueryVariables>('FindPermData', () => {
              return HttpResponse.json({
                data: {
                  visiumPermData: {
                    samplePositionResults: [],
                    addressPermData: [],
                    labware: createFlaggedLabware('STAN-9000F')
                  }
                }
              });
            })
          );
        });
        fillInTheRequest();
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('displays the operation success message', () => {
        cy.findByText('Library Amplification and Generation successfully completed').should('be.visible');
      });
      it('displays the print label select box', () => {
        cy.findByText('Print Labels').should('be.visible');
      });
      it('displays copy barcode section', () => {
        cy.findByTestId('copyButton').should('be.visible');
      });
      it('disables Transfer Reagent button', () => {
        cy.findByRole('button', { name: '< Reagent Transfer' }).should('be.disabled');
      });
      it('hides save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('not.exist');
      });
      it('displays Return Home button', () => {
        cy.findByRole('button', { name: 'Return Home' }).should('be.visible');
      });
      it('displays Reset Form button', () => {
        cy.findByRole('button', { name: 'Reset Form' }).should('be.visible');
      });
    });

    describe('When there is no perm operation associated to the scanned source(s)', () => {
      before(() => {
        cy.reload();
        fillInTheRequest();
        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('displays a warning pop-up', () => {
        cy.findByText('Labware without Permeabilisation').should('be.visible');
      });
      describe('When clicking on continue', () => {
        before(() => {
          cy.findByRole('button', { name: 'Continue' }).click();
        });
        it('saves the operation', () => {
          cy.findByText('Library Amplification and Generation successfully completed').should('be.visible');
        });
      });
    });

    describe('When clicking on Reset Form button', () => {
      before(() => {
        cy.visit('/lab/libraryGeneration');
        fillInTheRequest();
        cy.findByRole('button', { name: 'Save' }).click();
        cy.findByRole('button', { name: 'Continue' }).click();
        cy.findByRole('button', { name: 'Reset Form' }).click();
      });
      it('resets the form to the Transfer Sample step', () => {
        cy.get('#labwareScanInput').should('be.visible').and('have.value', '');
        cy.findByTestId('labware-').should('not.exist');
        cy.findByTestId('bioState').should('not.exist');
      });
    });

    describe('When clicking on Return Home button', () => {
      before(() => {
        cy.visit('/lab/libraryGeneration');
        fillInTheRequest();
        cy.findByRole('button', { name: 'Save' }).click();
        cy.findByRole('button', { name: 'Continue' }).click();
        cy.findByRole('button', { name: 'Return Home' }).click();
      });
      it('displays the home page ', () => {
        cy.findByText('Summary Dashboard').should('be.visible');
      });
    });

    describe('On server error', () => {
      before(() => {
        cy.visit('/lab/libraryGeneration');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordLibraryPrepMutation, RecordLibraryPrepMutationVariables>('RecordLibraryPrep', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'The request could not be validated'
                  }
                ]
              });
            })
          );
        });
        fillInTheRequest();
        cy.findByRole('button', { name: 'Save' }).click();
        cy.findByRole('button', { name: 'Continue' }).click();
      });
      it('displays the error', () => {
        cy.findByText('The request could not be validated').should('be.visible');
      });
      it('keeps Reagent Transfer button, so the user can update his request', () => {
        cy.findByRole('button', { name: '< Reagent Transfer' }).should('be.enabled');
      });
    });
  });
});

const dualIndexPlateBarcode: string = '300051128832186720221202';

const fillInTheRequest = () => {
  selectSGPNumber('SGP1008');
  fillInSampleTransferStep();
  fillInReagentTransferStep();
  fillInRecordCycleStep();
};

const fillInSampleTransferStep = () => {
  cy.get('[type="radio"][name="96 well plate"]').check();
  cy.get('#labwareScanInput').type('STAN-9975B{enter}');
  mappingSamples('A1', 'A1');
  selectOption('input-labware-state', 'used');
  selectOption('bioState', 'Probes pre-clean');
  cy.findByRole('button', { name: 'Reagent Transfer >' }).click();
};

const fillInReagentTransferStep = () => {
  selectOption('plateType', 'Dual Index TT Set A');
  cy.get('#sourceScanInput').within(() => {
    cy.findByRole('textbox').clear().type(`${dualIndexPlateBarcode}{enter}`);
  });
  transferReagent();
  cy.findByRole('button', { name: 'Record Cycle >' }).click();
};

const fillInRecordCycleStep = () => {
  cy.findAllByTestId('all-Cycles').each(($el) => {
    cy.wrap($el).clear().type('3');
  });
};
const mappingSamples = (addressSource: string, addressDestination: string) => {
  cy.get('#inputLabwares').within((elem) => {
    cy.wrap(elem).findByText(addressSource).wait(1000).click({ force: true });
  });
  cy.get('#outputLabwares').within((elem) => {
    cy.wrap(elem).findByText(addressDestination).wait(1000).click({ force: true });
  });
};

const transferReagent = () => {
  cy.get('#sourceLabwares').within(() => {
    cy.findByText('A1').click();
  });
  cy.get('#destLabwares').within(() => {
    cy.findByText('A1').click();
  });
};
