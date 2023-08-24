import { SlotCopyMutation, SlotCopyMutationVariables } from '../../../src/types/sdk';
import { LabwareTypeName } from '../../../src/types/stan';
import { selectOption, selectSGPNumber, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';

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

  context('When user selects Visium LP CytAssist labwareType', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST);
    });
    it('should set output labware type value to Visium LP CytAssist', () => {
      shouldDisplaySelectedValue('output-labware-type', 'Visium LP CytAssist');
    });
    it('shows a Visium LP CytAssist slide for the output', () => {
      cy.findAllByText(/Visium LP CytAssist/i).should('have.length.above', 0);
    });
  });

  context('When user selects Visium LP CytAssist XL labwareType', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST_XL);
    });
    it('should set output labware type value to Visium LP CytAssist XL', () => {
      shouldDisplaySelectedValue('output-labware-type', 'Visium LP CytAssist XL');
    });
    it('shows a Visium LP CytAssist XL slide for the output', () => {
      cy.findAllByText(/Visium LP CytAssist XL/i).should('have.length.above', 0);
    });
  });

  context('When a user scans in a TP Slide', () => {
    before(() => {
      selectLabwareType(LabwareTypeName.VISIUM_LP_CYTASSIST);
      cy.get('#labwareScanInput').type('STAN-3100{enter}');
    });

    it('shows it on the page', () => {
      cy.findByText('STAN-3100').should('be.visible');
    });

    it('keeps the Save button disabled', () => {
      saveButton().should('be.disabled');
    });

    context('when user maps slots in many to one mode', () => {
      before(() => {
        cy.findByTestId('copyMode-Many to one').click();
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A1').click();
          cy.findByText('B1').click({ shiftKey: true });
        });
        cy.get('#outputLabwares').within(() => {
          cy.findByText('D1').click();
        });
      });
      it('should display the one to many mode', () => {
        cy.findByTestId('copyMode-Many to one').should('be.checked');
      });
      it('displays the table with A1, B1 slots mapped to D1', () => {
        cy.findByTestId('mapped_table').contains('td', 'A1');
        cy.findByTestId('mapped_table').contains('td', 'B1');
        cy.findByTestId('mapped_table').contains('td', 'D1');
      });
      after(() => {
        cy.findByTestId('clearAll').click();
      });
    });

    context('When user selects some source slots', () => {
      before(() => {
        cy.findByTestId('copyMode-One to one').click();
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A1').click();
          cy.findByText('B1').click({ shiftKey: true });
        });
      });

      it('displays the table with A1 slot', () => {
        cy.findByTestId('mapping_table').contains('td', 'A1');
      });
      it('displays the table with B1 slot', () => {
        cy.findByTestId('mapping_table').contains('td', 'B1');
      });
    });

    context('When user maps some source slots', () => {
      before(() => {
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A1').click();
        });

        cy.get('#outputLabwares').within(() => {
          cy.findByText('D1').click();
        });
      });

      it('displays the mapping table with A1 slot', () => {
        cy.findByTestId('mapped_table').contains('td', 'A1');
      });
      it('displays the mapped table with D1 slot', () => {
        cy.findByTestId('mapped_table').contains('td', 'D1');
      });

      it('keeps the Save button disabled', () => {
        saveButton().should('not.be.enabled');
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
    describe('Checking for mandatory fields for Save', () => {
      describe('Check for SGP Number', () => {
        before(() => {
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
              graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>('SlotCopy', (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message: 'Exception while fetching data (/CytAssist) : The operation could not be validated.',
                      extensions: {
                        problems: ['Labware is discarded: [STAN-4100]']
                      }
                    }
                  ])
                );
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
        before(() => {
          cy.msw().then(({ worker }) => {
            worker.resetHandlers();
          });

          saveButton().should('not.be.disabled').click();
        });

        it('shows a success message', () => {
          cy.findByText('Slots copied').should('be.visible');
        });
      });
    });
  });
});

function saveButton() {
  return cy.findByRole('button', { name: /Save/i });
}

function enterOutputLabwareExternalID() {
  cy.findByTestId('external-barcode').within(() => {
    cy.findByRole('textbox').clear().type('V42A20-3752023-10-20{enter}');
  });
}

function enterLOTNumber() {
  cy.findByTestId('lot-number').within(() => {
    cy.findByRole('textbox').clear().type('1234567{enter}');
  });
}
function enterProbeLOTNumber() {
  cy.findByTestId('probe-lot-number').within(() => {
    cy.findByRole('textbox').clear().type('1234567{enter}');
  });
}
function selectLabwareType(type: string) {
  selectOption('output-labware-type', type);
}
function selectSlideCostings(costing: string) {
  selectOption('output-labware-costing', costing);
}
