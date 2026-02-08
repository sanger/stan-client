import { selectOption, selectSGPNumber, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import {
  FindFlaggedLabwareQuery,
  FindFlaggedLabwareQueryVariables,
  LabwareState,
  ReloadSlotCopyQuery,
  ReloadSlotCopyQueryVariables,
  SlideCosting,
  SlotCopyMutation,
  SlotCopyMutationVariables,
  FindIfOpExistsQuery,
  FindIfOpExistsQueryVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';
import { LabwareTypeName } from '../../../src/types/stan';
import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';

describe('CytAssist Page', () => {
  before(() => {
    cy.visit('/lab/cytassist');
  });

  describe('On load', () => {
    it('output labware type should be empty', () => {
      shouldDisplaySelectedValue('output-labware-type', '');
    });

    it('disables the Save button', () => {
      saveButton().should('be.disabled');
    });
    it('disables the Draft Save button', () => {
      saveDraftButton().should('be.disabled');
    });
    it('displays the mode selection', () => {
      cy.findByText(/Select transfer mode/i).should('be.visible');
    });
    it('should select the first option by default', () => {
      cy.findByTestId('copyMode-One to one').should('be.checked');
    });
    it('displays the Cassette Lot input', () => {
      cy.findByTestId('cassetteLot').should('be.visible');
    });
  });

  context('when scanning a labware missing Probe Hybridisation CytAssist or QC', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindIfOpExistsQuery, FindIfOpExistsQueryVariables>('FindIfOpExists', () => {
            return HttpResponse.json({
              data: {
                opExists: false
              }
            });
          })
        );
      });
      cy.get('#labwareScanInput').type('STAN-3100{enter}');
    });
    it('should display a warning message', () => {
      cy.findByText(
        "No 'Probe hybridisation Cytassist' operation has been recorded for labware STAN-3100. (not required for 3')"
      ).should('be.visible');
      cy.findByText(
        "No 'Probe hybridisation QC' operation has been recorded for labware STAN-3100. (not required for 3')"
      ).should('be.visible');
    });
    after(() => {
      cy.findByTestId('removeButton').click();
    });
  });

  context('when CyAssist labware type is three-point', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_HD_3_6_5);
    });
    it('displays Reagent A and Reagent B lot inputs, and hides the default reagent input', () => {
      cy.findByTestId('reagentALot').should('be.visible');
      cy.findByTestId('reagentBLot').should('be.visible');
      cy.findByTestId('reagentLot').should('not.exist');
    });
  });

  context('when CyAssist labware type is not three-point', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_XL);
    });
    it('displays only the default reagent barcode input, and hides Reagent A and B inputs', () => {
      cy.findByTestId('reagentALot').should('not.exist');
      cy.findByTestId('reagentBLot').should('not.exist');
      cy.findByTestId('reagentLot').should('be.visible');
    });
  });

  context('when scanning a non active labware', () => {
    before(() => {
      const discardedLabware = createFlaggedLabware('STAN-4100');
      discardedLabware.state = LabwareState.Discarded;
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindFlaggedLabwareQuery, FindFlaggedLabwareQueryVariables>('FindFlaggedLabware', () => {
            return HttpResponse.json({
              data: {
                labwareFlagged: discardedLabware
              }
            });
          })
        );
      });
      cy.get('#labwareScanInput').type('STAN-4100{enter}');
    });
    it('should display an error message', () => {
      cy.findByText('Labware is not active: [ STAN-4100]').should('be.visible');
    });
  });

  context('scanned input labware are displayed within the same view', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3100{enter}');
      cy.get('#labwareScanInput').type('STAN-3200{enter}');
    });

    it('shows it on the page', () => {
      cy.findByText('STAN-3100').should('be.visible');
      cy.findByText('STAN-3200').should('be.visible');
    });
    context('When user selects some source slots', () => {
      before(() => {
        cy.findByTestId('copyMode-One to one').click();
        cy.findByTestId('STAN-3100').within(() => {
          cy.findByText('A1').click();
          cy.findByText('B1').click({ shiftKey: true });
        });
      });

      it('displays slots table for the selected slots', () => {
        cy.findByTestId('mapping_table').get('tbody tr').should('have.length', 2);
      });
      it('displays the table with A1 slot', () => {
        cy.findByTestId('mapping_table').contains('td', 'A1');
      });
      it('displays the table with B1 slot', () => {
        cy.findByTestId('mapping_table').contains('td', 'B1');
      });
    });
    after(() => {
      cy.findByTestId('clearAll').click();
    });
  });

  context('Mapping', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_XL);
      cy.findByTestId('copyMode-Many to one').click();
      mapSlots();
    });
    it('displays the table with A1, B1 slots mapped to D1', () => {
      cy.findByTestId('mapping_table').get('tbody tr').should('have.length', 2);
      cy.findByTestId('mapping_table').contains('td', 'C1');
      cy.findByTestId('mapping_table').contains('td', 'C1');
      cy.findByTestId('mapping_table').contains('td', 'B1');
    });
    it('displays slots table on destination slot click', () => {
      cy.get('#outputLabwares').within(() => {
        cy.findByText('B1').click();
      });
      cy.findByTestId('mapping_table').get('tbody tr').should('have.length', 2);
    });
    context('multi select from different source labware is forbidden', () => {
      before(() => {
        cy.findByTestId('STAN-3100').within(() => {
          cy.findByText('B1').click();
        });
        cy.findByTestId('STAN-3200').within(() => {
          cy.findByText('A1').click({ shiftKey: true });
        });
      });
      it('unselect the previously selected slots', () => {
        cy.findByTestId('STAN-3100').within(() => {
          cy.findByText('B1').should('not.have.class', 'ring');
        });
      });
    });
  });

  context('When external id is entered in wrong format', () => {
    before(() => {
      cy.findByTestId('external-barcode').within(() => {
        cy.findByRole('textbox').type('asddg{enter}');
      });
    });
    it('should display Invalid format error message', () => {
      cy.findByText('Invalid format for this labware type').should('be.visible');
    });
  });
  context('When external id is entered in correct format', () => {
    before(() => {
      enterOutputLabwareExternalID();
    });
    it('should display Invalid format error message', () => {
      cy.findByText('Invalid format').should('not.exist');
    });
  });
  context('When LOT number is entered in wrong format', () => {
    before(() => {
      cy.findByTestId('lot-number').within(() => {
        cy.findByRole('textbox').type('asddg{enter}');
      });
    });
    it('should display Invalid format error message', () => {
      cy.findByText('Invalid format: Required 6-7 digit number').should('be.visible');
    });
  });
  context('When LOT number  is entered in correct format', () => {
    before(() => {
      enterLOTNumber();
    });
    it('should not display invalid format error message', () => {
      cy.findByText('Invalid format: Required 6-7 digit number').should('not.exist');
    });
  });
  context('When labware type is updated', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_HD);
    });
    it('should validate the external barcode ', () => {
      cy.contains('Invalid format for VISIUM LP CYTASSIST').should('be.visible');
    });
    it('clears out all the mapping ', () => {
      cy.findByTestId('STAN-3100').within(() => {
        cy.findAllByTestId('slot').each((slot) => cy.wrap(slot).should('not.have.class', 'ring'));
      });
    });
  });
  describe('Checking for mandatory fields for Save', () => {
    describe('Check for SGP Number', () => {
      before(() => {
        mapSlots();
        enterOutputLabwareExternalID();
        enterLOTNumber();
        enterLpNumber();
        selectSlideCostings('SGP');
      });
      context('When mapping is done  and all field selected except SGP number', () => {
        it('keeps the Save button disabled', () => {
          saveButton().should('not.be.enabled');
        });
      });
      context('When SGP number is entered', () => {
        before(() => {
          selectSGPNumber('SGP1008');
        });
        it('should enable Save button', () => {
          saveButton().should('be.enabled');
        });
      });
    });
    describe('Check for External barcode', () => {
      before(() => {
        cy.findByTestId('external-barcode')
          .scrollIntoView()
          .within(() => {
            cy.findByRole('textbox').clear().blur();
          });
      });
      context('When mapping is done  and all field selected except External barcode', () => {
        it('should display Required field error for external barcode', () => {
          cy.findByText('Required field').should('be.visible');
        });
        it('keeps the Save button disabled', () => {
          saveButton().should('not.be.enabled');
        });
      });
      context('When External barcode number is entered', () => {
        before(() => {
          enterOutputLabwareExternalID();
        });
        it('should enable Save button', () => {
          saveButton().should('be.enabled');
        });
      });
    });
    describe('Check for LOT number', () => {
      before(() => {
        cy.findByTestId('lot-number').within(() => {
          cy.findByRole('textbox').clear().blur();
        });
      });
      context('When mapping is done  and all field selected except LOT number', () => {
        it('should display Required field error for external id', () => {
          cy.findByText('Required field').should('be.visible');
        });
        it('keeps the Save button disabled', () => {
          saveButton().should('not.be.enabled');
        });
      });
      context('When Lot number is entered', () => {
        before(() => {
          enterLOTNumber();
        });
        it('should enable Save button', () => {
          saveButton().should('be.enabled');
        });
      });
    });
    describe('Check for Slide costings', () => {
      before(() => {
        selectSlideCostings('');
      });
      context('When mapping is done  and all field selected except Slide costings', () => {
        it('keeps the Save button disabled', () => {
          saveButton().should('be.visible').should('not.be.enabled');
        });
      });
      context('When Slide costing is selected', () => {
        before(() => {
          selectSlideCostings('Faculty');
        });
        it('should enable Save button', () => {
          saveButton().should('be.visible').should('be.enabled');
        });
      });
    });
    context('labware type is of type Cytassist 3', () => {
      before(() => {
        selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_HD_3_11);
        cy.findByTestId('reagentALot').clear().blur();
        cy.findByTestId('reagentBLot').clear().blur();
      });
      it('displays required field error message', () => {
        cy.findByText('Reagent A lot is a required field for this labware type').should('be.visible');
        cy.findByText('Reagent B lot is a required field for this labware type').should('be.visible');
      });
    });
    context('labware type is not of type Cytassist 3', () => {
      before(() => {
        selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_XL);
        cy.findByTestId('reagentLot').clear().blur();
      });
      it('displays required field error message', () => {
        cy.findByText('Reagent lot is a required field for this labware type').should('be.visible');
      });
    });
    context('When Reagent LOT number is entered in incorrect format', () => {
      before(() => {
        enterReagentLOTNumber('1234567');
      });
      it('displays invalid format error message', () => {
        cy.findByText('Invalid format: Required 6 digit number').should('exist');
      });
    });

    context('When Cassette Lot is entered in correct format', () => {
      before(() => {
        enterCassetteLot('123456');
      });
      it('should not display invalid format error message', () => {
        cy.findByTestId('cassetteLot')
          .closest('div')
          .within(() => {
            cy.findByText('Invalid format: Required 6 digit number').should('not.exist');
          });
      });
    });
    context('When Cassette Lot is entered in wrong format', () => {
      before(() => {
        enterCassetteLot('42');
      });
      it('should display invalid format error message', () => {
        cy.findByTestId('cassetteLot')
          .closest('div')
          .within(() => {
            cy.findByText('Invalid format: Required 6 digit number').should('be.visible');
          });
      });
    });
  });

  describe('On save', () => {
    context('When there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>('SlotCopy', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while fetching data (/CytAssist) : The operation could not be validated.',
                    extensions: {
                      problems: ['Labware is discarded: [STAN-4100]']
                    }
                  }
                ]
              });
            })
          );
        });
        cy.reload();
        fillForm();
        saveButton().click();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-4100]').should('be.visible');
      });
    });

    context('When there is no server error', () => {
      it('shows a success message', () => {
        saveButton().should('not.be.disabled').click();
        cy.findByText('Slots copied').should('be.visible');
      });
      describe('When user selects CytAssist HD 6.5 labwareType', () => {
        before(() => {
          cy.reload();
          fillForm();
          saveButton().click();
        });
        it('displays print labels', () => {
          cy.findByText('Print Labels').should('be.visible');
        });
      });
    });
  });
  describe('On save draft', () => {
    before(() => {
      cy.reload();
      selectSGPNumber('SGP1008');
      enterLpNumber();
    });
    context('draft saving', () => {
      it('enables save draft button when sgp and lp numbers are selected', () => {
        saveDraftButton().should('be.enabled');
      });
    });
    context('load saved draft', () => {
      it('populates the slide costings properly', () => {
        shouldDisplaySelectedValue('output-labware-costing', 'SGP');
      });
      it('populates the slide LOT number properly', () => {
        cy.findByTestId('lot-number').within(() => {
          cy.findByRole('textbox').should('have.value', '7712543');
        });
      });
      it('populates the external barcode properly', () => {
        cy.findByTestId('external-barcode').within(() => {
          cy.findByRole('textbox').should('have.value', 'H1-9D8VN2V');
        });
      });
      it('populates the Cassette Lot properly', () => {
        cy.findByTestId('cassetteLot').within(() => {
          cy.findByRole('textbox').should('have.value', '123456');
        });
      });
      it('selects the correct output labware type', () => {
        shouldDisplaySelectedValue('output-labware-type', 'CytAssist 6.5');
      });
      it('displays the source labware properly', () => {
        cy.findByText('STAN-3100').should('be.visible');
        cy.findByText('STAN-3200').should('be.visible');
      });
      it('displays the output labware properly', () => {
        cy.findByTestId('cytassist-labware').within(() => {
          cy.findByText('CytAssist 6.5').should('be.visible');
        });
      });
      it('shows the mapped slots correctly', () => {
        cy.findByTestId('cytassist-labware').within(() => {
          cy.findByText('A1').click();
        });
        cy.findByTestId('mapping_table').get('tbody tr').should('have.length', 2);
      });
      it('shows the mapped slots correctly', () => {
        cy.findByTestId('cytassist-labware').within(() => {
          cy.findByText('A1').click();
        });
        cy.findByTestId('mapping_table').get('tbody tr').should('have.length', 2);
      });
    });

    context('re-load with different drafted values', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<ReloadSlotCopyQuery, ReloadSlotCopyQueryVariables>('ReloadSlotCopy', () => {
              return HttpResponse.json({
                data: {
                  reloadSlotCopy: {
                    operationType: 'CyAssist',
                    workNumber: 'SGP1',
                    lpNumber: 'LP1',
                    labwareType: LabwareTypeName.VISIUM_LP_CYTASSIST_HD,
                    preBarcode: 'V42A20-3752023-10-20',
                    lotNumber: '1112543',
                    costing: SlideCosting.Faculty,
                    cassetteLot: '654321',
                    sources: [],
                    contents: [
                      {
                        sourceBarcode: 'STAN-3300',
                        sourceAddress: 'B1',
                        destinationAddress: 'A1'
                      },
                      {
                        sourceBarcode: 'STAN-3300',
                        sourceAddress: 'A1',
                        destinationAddress: 'A1'
                      },
                      {
                        sourceBarcode: 'STAN-3300',
                        sourceAddress: 'C1',
                        destinationAddress: 'A1'
                      }
                    ]
                  }
                }
              });
            })
          );
        });
        enterLpNumber('LP5');
      });
      it('updates the slide costings properly', () => {
        shouldDisplaySelectedValue('output-labware-costing', 'Faculty');
      });
      it('updates the slide LOT number properly', () => {
        cy.findByTestId('lot-number').within(() => {
          cy.findByRole('textbox').should('have.value', '1112543');
        });
      });
      it('updates the external barcode properly', () => {
        cy.findByTestId('external-barcode').within(() => {
          cy.findByRole('textbox').should('have.value', 'V42A20-3752023-10-20');
        });
      });
      it('updates the cassette lot properly', () => {
        cy.findByTestId('cassetteLot').within(() => {
          cy.findByRole('textbox').should('have.value', '654321');
        });
      });
      it('re-selects the correct output labware type', () => {
        shouldDisplaySelectedValue('output-labware-type', 'CytAssist HD 6.5');
      });
      it('updates the source labware properly', () => {
        cy.findByText('STAN-3300').should('be.visible');
      });
      it('updates the output labware properly', () => {
        cy.findByTestId('cytassist-labware').within(() => {
          cy.findByText('CytAssist HD 6.5').should('be.visible');
        });
      });
      it('shows the mapped slots correctly', () => {
        cy.findByTestId('cytassist-labware').within(() => {
          cy.findByText('A1').click();
        });
        cy.findByTestId('mapping_table').get('tbody tr').should('have.length', 3);
      });
    });

    context('re-load with no drafted values', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<ReloadSlotCopyQuery, ReloadSlotCopyQueryVariables>('ReloadSlotCopy', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'No Record is been stored.'
                  }
                ]
              });
            })
          );
        });
        enterLpNumber('LP7');
      });
      it('empty the slide costings input field', () => {
        shouldDisplaySelectedValue('output-labware-costing', '');
      });
      it('empty the slide LOT number input field', () => {
        cy.findByTestId('lot-number').within(() => {
          cy.findByRole('textbox').should('have.value', '');
        });
      });
      it('empty the external barcode input field', () => {
        cy.findByTestId('external-barcode').within(() => {
          cy.findByRole('textbox').should('have.value', '');
        });
      });
      it('empty the cassette lot input field', () => {
        cy.findByTestId('cassetteLot').within(() => {
          cy.findByRole('textbox').should('have.value', '');
        });
      });
      it('defaults the output labware type select box to null', () => {
        shouldDisplaySelectedValue('output-labware-type', '');
      });
      it('removes the source labware', () => {
        cy.findByTestId('input-labware-div').should('not.exist');
      });
      it('removes the output labware', () => {
        cy.findByTestId('cytassist-labware').within(() => {
          cy.findAllByTestId('slot').should('have.length', 0);
        });
      });
    });
  });
});

function saveButton() {
  return cy.findByRole('button', { name: 'Save' }).scrollIntoView();
}

function saveDraftButton() {
  return cy.findByRole('button', { name: 'Save Draft' }).scrollIntoView();
}

function mapSlots() {
  cy.findByTestId('STAN-3100').within(() => {
    cy.findByText('A1').click();
    cy.findByText('B1').click({ shiftKey: true });
  });
  cy.get('#outputLabwares').within(() => {
    cy.findByText('A1').click();
  });

  cy.findByTestId('STAN-3200').within(() => {
    cy.findByText('C1').click();
    cy.findByText('D1').click({ cmdKey: true });
  });
  cy.get('#outputLabwares').within(() => {
    cy.findByText('B1').click();
  });
}

function enterOutputLabwareExternalID() {
  cy.findByTestId('external-barcode').within(() => {
    cy.findByRole('textbox').clear().type('V42A20-3752023-10-20{enter}').blur();
  });
}

function enterLOTNumber() {
  cy.findByTestId('lot-number').within(() => {
    cy.findByRole('textbox').clear().type('1234567{enter}').blur();
  });
}

function enterReagentLOTNumber(lotNumber: string) {
  cy.findByTestId('reagentLot').clear().type(`${lotNumber}{enter}`);
}

function enterReagentALOTNumber(lotNumber: string) {
  cy.findByTestId('reagentALot').clear().type(`${lotNumber}{enter}`);
}
function enterReagentBLOTNumber(lotNumber: string) {
  cy.findByTestId('reagentBLot').clear().type(`${lotNumber}{enter}`);
}

function enterCassetteLot(number: string) {
  cy.findByTestId('cassetteLot').within(() => {
    cy.findByRole('textbox').clear().type(`${number}{enter}`).blur();
  });
}

function enterLpNumber(lpNumber: string = 'LP1') {
  selectOption('lpNumber', lpNumber);
}
function selectLabwareType(type: string) {
  selectOption('output-labware-type', type);
}
function selectSlideCostings(costing: string) {
  selectOption('output-labware-costing', costing);
}

const fillForm = () => {
  cy.reload();
  selectSGPNumber('SGP1008');
  selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_HD);
  selectSlideCostings('Faculty');
  enterLOTNumber();
  enterCassetteLot('123456');
  cy.findByTestId('external-barcode').within(() => {
    cy.findByRole('textbox').wait(500).clear().type('H1-9D8VN2V{enter}').blur();
  });
  cy.get('#labwareScanInput').type('STAN-3100{enter}').wait(500);
  cy.get('#inputLabwares').within(() => {
    cy.findByText('A1').wait(500).click();
  });
  cy.get('#outputLabwares').within(() => {
    cy.findByText('A1').wait(500).click();
  });
};
