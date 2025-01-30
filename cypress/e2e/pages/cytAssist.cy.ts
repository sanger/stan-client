import { SlotCopyMutation, SlotCopyMutationVariables } from '../../../src/types/sdk';
import { LabwareTypeName } from '../../../src/types/stan';
import { selectOption, selectSGPNumber, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

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
    it('displays the mode selection', () => {
      cy.findByText(/Select transfer mode/i).should('be.visible');
    });
    it('should select the first option by default', () => {
      cy.findByTestId('copyMode-One to one').should('be.checked');
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
      cy.findByTestId('mapping_table').contains('td', 'C2');
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
      cy.findByText('Invalid format').should('be.visible');
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
  context('When Probe LOT number is entered in wrong format', () => {
    before(() => {
      cy.findByTestId('probe-lot-number').within(() => {
        cy.findByRole('textbox').type('asddg{enter}');
      });
    });
    it('should display Invalid format error message', () => {
      cy.findByText('Invalid format: Required 6-7 digit number').should('be.visible');
    });
  });
  context('When Probe LOT number  is entered in correct format', () => {
    before(() => {
      enterProbeLOTNumber();
    });
    it('should not display invalid format error message for Probe LOT number', () => {
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
        enterProbeLOTNumber();
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
        cy.findByTestId('external-barcode').within(() => {
          cy.findByRole('textbox').clear().blur();
        });
      });
      context('When mapping is done  and all field selected except External barcode', () => {
        it('should display Required field error for external id', () => {
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
    describe('Check for Probe LOT number', () => {
      before(() => {
        cy.findByTestId('probe-lot-number').within(() => {
          cy.findByRole('textbox').clear().blur();
        });
      });
      context('When mapping is done  and all field selected except Probe LOT number', () => {
        it('should display Required field error for external id', () => {
          cy.findByText('Required field').should('be.visible');
        });
        it('keeps the Save button disabled', () => {
          saveButton().should('not.be.enabled');
        });
      });
      context('When Probe Lot number is entered', () => {
        before(() => {
          enterProbeLOTNumber();
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
      describe('When user selects Visium LP CytAssist HD labwareType', () => {
        before(() => {
          cy.reload();
          selectSGPNumber('SGP1008');
          selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_HD);
          selectSlideCostings('Faculty');
          enterLOTNumber();
          enterProbeLOTNumber();
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
          saveButton().click();
        });
        it('displays print labels', () => {
          cy.findByText('Print Labels').should('be.visible');
        });
      });
    });
  });
});

function saveButton() {
  return cy.findByRole('button', { name: /Save/i }).scrollIntoView();
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
    cy.findByText('C2').click({ cmdKey: true });
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
function enterProbeLOTNumber() {
  cy.findByTestId('probe-lot-number').within(() => {
    cy.findByRole('textbox').clear().type('1234567{enter}').blur();
  });
}
function selectLabwareType(type: string) {
  selectOption('output-labware-type', type);
}
function selectSlideCostings(costing: string) {
  selectOption('output-labware-costing', costing);
}
