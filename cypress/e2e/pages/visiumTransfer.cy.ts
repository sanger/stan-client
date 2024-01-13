import {
  FindPermDataQuery,
  FindPermDataQueryVariables,
  SlotCopyMutation,
  SlotCopyMutationVariables
} from '../../../src/types/sdk';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';
import { selectOption, selectSGPNumber, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Transfer Page', () => {
  describe('Output labware', () => {
    before(() => {
      cy.visit('/lab/transfer');
    });
    it('should display default and scan options', () => {
      cy.findByTestId('Default').should('be.checked');
      cy.findByTestId('Scan Labware').should('not.be.checked');
    });

    it('should display default option when user selects default option', () => {
      cy.findByTestId('bioState').should('be.visible');
      cy.findByRole('button', { name: '+ Add Plate' }).should('be.visible');
      cy.findByTestId('copyMode-One to one').should('be.checked');
      cy.findByTestId('copyMode-One to many').should('exist');
      cy.findByTestId('copyMode-Many to one').should('exist');
      cy.findByText(/96 WELL PLATE/i).should('exist');
    });
    it('should display scan option when user selects scan option', () => {
      cy.findByTestId('Scan Labware').click();
      cy.findByTestId('bioState').should('not.exist');
      cy.findByRole('button', { name: '+ Add Plate' }).should('not.exist');
      cy.get('#labwareScanInput').should('be.visible');
      cy.findByTestId('copyMode-One to one').should('be.checked');
      cy.findByTestId('copyMode-One to many').should('not.exist');
      cy.findByTestId('copyMode-Many to one').should('not.exist');
      cy.findByText(/96 WELL PLATE/i).should('not.exist');
      cy.findByTestId('removeButton').should('not.exist');
    });
  });

  describe('Scan labware option for output labware', () => {
    before(() => {
      cy.visit('/lab/transfer');
      cy.findByTestId('Scan Labware').click();
      cy.findByTestId('dest-scanner').within((elem) => {
        cy.wrap(elem).get('#labwareScanInput').type('STAN-3112{enter}');
      });
    });
    it('should display scanned output labware', () => {
      cy.findByText('STAN-3112').should('be.visible');
      cy.findByTestId('removeButton').should('exist');
    });
    it('should display filled slots in output labware as disabled', () => {
      cy.findByTestId('labware-STAN-3112').within(() => {
        cy.findAllByTestId('slot')
          .eq(0)
          .should('have.class', 'bg-gray-300 ring-0 ring-offset-0 text-gray-300 border-0 border-gray-300');
      });
    });
    it('removes a destination well plate on removeButton click', () => {
      cy.findByTestId('removeButton').click();
      cy.findByText('STAN-3112').should('not.exist');
      cy.findByTestId('removeButton').should('not.exist');
    });
    it('should allow transfer to an empty slot', () => {
      cy.get('#inputLabwares').within((elem) => {
        cy.wrap(elem).get('#labwareScanInput').clear().type('STAN-3111{enter}');
      });
      cy.findByTestId('dest-scanner').within((elem) => {
        cy.wrap(elem).get('#labwareScanInput').clear().type('STAN-3000{enter}');
      });
      cy.get('#inputLabwares').within(() => {
        cy.findByText('A1').click({ force: true });
      });
      cy.get('#outputLabwares').within(() => {
        cy.findByText('A2').click({ force: true });
      });
      cy.findByRole('table').contains('td', 'A1');
      cy.findByRole('table').contains('td', 'A2');
    });
  });

  describe('Default option for Output labware', () => {
    before(() => {
      cy.visit('/lab/transfer');
      selectSGPNumber('SGP1008');
    });

    describe('On load', () => {
      it('shows a 96 well plate for the output', () => {
        cy.findByText(/96 WELL PLATE/i).should('be.visible');
      });

      it('disables the Save button', () => {
        saveButton().should('be.disabled');
      });
    });

    context('When a user scans slides', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-3100{enter}');
      });

      it('shows it on the page', () => {
        cy.findByText('STAN-3100').should('be.visible');
      });

      it('keeps the Save button disabled', () => {
        saveButton().should('be.disabled');
      });
    });

    context('when user scans multiple slides', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-3200{enter}');
        cy.get('#labwareScanInput').type('STAN-3300{enter}');
      });

      it('updates page with added labware ', () => {
        cy.contains('3 of 3').should('be.visible');
      });

      it('shows the last added labware', () => {
        cy.findByText('STAN-3300').should('be.visible');
      });
    });

    context('when entering labware state values', () => {
      before(() => {
        selectOption('input-labware-state', 'used');
      });
      context('when navigating away and coming to the labware with state selected', () => {
        before(() => {
          cy.findAllByTestId('left-button').eq(0).click();
          cy.findAllByTestId('right-button').eq(0).click();
        });

        it('shows the previously selected state for labware', () => {
          cy.findByText('used').should('be.visible');
        });
      });
      context('When user selects some source slots', () => {
        before(() => {
          cy.get('#inputLabwares').within(() => {
            cy.findByText('A1').click();
            cy.findByText('D1').click({ shiftKey: true });
          });
        });

        it('displays the table with A1 slot', () => {
          cy.findByRole('table').contains('td', 'A1');
        });
        it('displays the table with D1 slot', () => {
          cy.findByRole('table').contains('td', 'D1');
        });
      });

      context('when user adds a destination well plate', () => {
        before(() => {
          cy.get('#outputLabwares').within(() => {
            cy.findByRole('button', { name: '+ Add Plate' }).click();
          });
        });
        it('updates page with added labware ', () => {
          cy.contains('2 of 2').should('be.visible');
        });
      });
      context('when user removes a destination well plate', () => {
        before(() => {
          cy.findAllByTestId('removeButton').eq(1).click();
        });
        it('removes labware from  page ', () => {
          cy.contains('1 of 1').should('be.visible');
        });
        it('should not display remove button', () => {
          cy.findAllByTestId('removeButton').should('have.length', 1);
        });
      });
      context('when user selects a bio-state for a destination well plate', () => {
        before(() => {
          cy.findByRole('button', { name: '+ Add Plate' }).click();
          selectOption('bioState', 'Probes');
        });
        it('should display selected labware state', () => {
          shouldDisplaySelectedValue('bioState', 'Probes');
        });
        context('when user navigates away and the come back to destination plate with bio-state', () => {
          before(() => {
            cy.findAllByTestId('left-button').eq(1).click();
            cy.findAllByTestId('right-button').eq(1).click();
          });
          it('should display previous selected labware state', () => {
            shouldDisplaySelectedValue('bioState', 'Probes');
          });
        });
        after(() => {
          cy.findAllByTestId('removeButton').eq(1).click();
          cy.findAllByTestId('removeButton').eq(0).click();
        });
      });

      context('When user maps slots that failed in Visium QC- Slide processing', () => {
        before(() => {
          cy.get('#inputLabwares').within(() => {
            cy.findByText('A2').click();
          });

          cy.get('#outputLabwares').within(() => {
            cy.findByText('G1').click();
          });
        });
        it('display the notification to user about failed slots', () => {
          cy.findByText('Failed slot(s)').should('be.visible');
        });
        after(() => {
          cy.findByRole('button', { name: /Cancel/i }).click();
          //Removes the current labware to  start fresh
          cy.findAllByTestId('removeButton').eq(0).click();
        });
      });
      context('when user maps slots in one to many mode', () => {
        before(() => {
          cy.findByTestId('copyMode-One to many').click();
          cy.get('#inputLabwares').within(() => {
            cy.findByText('A1').click();
          });
          cy.get('#outputLabwares').within(() => {
            cy.findByText('G1').click();
            cy.findByText('G2').click();
            cy.findByText('G5').click();
          });
        });
        it('should display the one to many mode', () => {
          cy.findByTestId('copyMode-One to many').should('be.checked');
        });
        it('should display finish transfer button', () => {
          cy.findByRole('button', { name: 'Finish mapping for A1' }).should('be.visible');
        });
        it('displays the table with A1 slot', () => {
          cy.findByRole('table').contains('td', 'A1');
        });
        it('displays the table with G1 and G5 slots', () => {
          cy.findByRole('table').contains('td', 'G1');
          cy.findByRole('table').contains('td', 'G5');
        });

        context('when user click on finish transfer button', () => {
          before(() => {
            cy.findByRole('button', { name: 'Finish mapping for A1' }).click();
          });
          it('should remove the finish transfer button', () => {
            cy.findByRole('button', { name: 'Finish mapping for A1' }).should('not.exist');
          });
        });
      });
      context('when user maps slots in many to one mode', () => {
        before(() => {
          cy.findByTestId('copyMode-Many to one').click();
          cy.get('#inputLabwares').within(() => {
            cy.findByText('A2').click();
            cy.findByText('B2').click({ cmdKey: true });
          });
          cy.get('#outputLabwares').within(() => {
            cy.findByText('D1').click();
          });
        });
        it('should display the one to many mode', () => {
          cy.findByTestId('copyMode-Many to one').should('be.checked');
        });
        it('displays the table with A2, B2 slots mapped to D1', () => {
          cy.findByText('Slot mapping for STAN-3100').should('be.visible');
          cy.findByRole('table').contains('td', 'A2');
          cy.findByRole('table').contains('td', 'B2');
          cy.findByRole('table').contains('td', 'D1');
        });
      });

      context('when user selects a mapped slot', () => {
        before(() => {
          cy.get('#inputLabwares').within(() => {
            cy.findByText('A1').click();
          });
        });
        it('should display the mappings for selected slot in table', () => {
          cy.findByText('Slot mapping for slot(s) A1').should('be.visible');
          it('displays the table with A1 slot', () => {
            cy.findByRole('table').contains('td', 'A1');
            cy.findByRole('table').contains('td', 'G1');
            cy.findByRole('table').contains('td', 'G5');
          });
        });
      });

      describe('On save', () => {
        before(() => {
          selectOption('bioState', 'Probes');
          selectOption('input-labware-state', 'used');
        });
        context('When there is a server error', () => {
          before(() => {
            cy.msw().then(({ worker, graphql }) => {
              worker.use(
                graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>('SlotCopy', () => {
                  return HttpResponse.json({
                    errors: [
                      {
                        message: 'Exception while fetching data (/slotCopy) : The operation could not be validated.',
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
          before(() => {
            cy.msw().then(({ worker }) => {
              worker.resetHandlers();
            });

            saveButton().should('not.be.disabled').click();
          });

          it('shows a success message', () => {
            cy.findByText('Slots copied').should('be.visible');
          });

          it('shows the label printer component', () => {
            cy.findByRole('button', { name: 'Print Labels' }).should('be.visible');
          });
          it('shows a copy label button', () => {
            cy.findByRole('button', { name: /Copy Labels/i }).should('be.visible');
          });
        });
      });
    });

    context('when scans a labwares with no perm done', () => {
      before(() => {
        saveSlotForLabwareWithNoPerm();
      });
      it('shows a warning message', () => {
        cy.findByText('Labware without Permeabilisation').should('be.visible');
      });

      context('when Continue button is clicked', () => {
        before(() => {
          cy.findByRole('button', { name: /Continue/i }).click();
        });
        it('shows a success message', () => {
          cy.findByText('Slots copied').should('be.visible');
        });
      });
      context('when Cancel button is clicked', () => {
        before(() => {
          saveSlotForLabwareWithNoPerm();
          cy.findByRole('button', { name: /Cancel/i }).click();
        });
        it('cancels the operation', () => {
          cy.findByRole('button', { name: /Save/i }).should('be.enabled');
        });
      });

      context('When Visium permeabilisation button is clicked', () => {
        before(() => {
          saveButton().click();
          cy.findByRole('button', { name: /Visium permeabilisation/i }).click();
        });
        it('should navigate to Visium perm page', () => {
          cy.url().should('include', '/lab/visium_perm');
        });
      });
    });
  });
});

function saveButton() {
  return cy.findByRole('button', { name: /Save/i });
}

function saveSlotForLabwareWithNoPerm() {
  cy.visit('/lab/transfer');
  selectSGPNumber('SGP1008');
  cy.msw().then(({ worker, graphql }) => {
    worker.use(
      graphql.query<FindPermDataQuery, FindPermDataQueryVariables>('FindPermData', () => {
        return HttpResponse.json({
          data: {
            visiumPermData: {
              labware: createLabware('STAN-3200'),
              addressPermData: [],
              samplePositionResults: []
            }
          }
        });
      })
    );
  });
  cy.get('#labwareScanInput').type('STAN-3200{enter}');
  cy.get('#inputLabwares').within(() => {
    cy.findByText('A1').click();
    cy.findByText('D1').click({ shiftKey: true });
  });
  cy.get('#outputLabwares').within(() => {
    cy.findByText('A1').click();
  });
  selectOption('bioState', 'Probes');
  selectOption('input-labware-state', 'used');
  cy.get('#outputLabwares').within(() => {
    cy.findByText('A1').click();
  });
  saveButton().click();
}
