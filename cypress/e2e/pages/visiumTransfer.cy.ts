import {
  FindPermDataQuery,
  FindPermDataQueryVariables,
  SlotCopyMutation,
  SlotCopyMutationVariables
} from '../../../src/types/sdk';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';
import { selectOption, selectSGPNumber, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';

describe('Transfer Page', () => {
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

  context('when user removes slide', () => {
    before(() => {
      cy.findByTestId('removeButton').click();
    });

    it('updates page with removed labware ', () => {
      cy.contains('2 of 2').should('be.visible');
    });

    it('shows the labware before the deleted one', () => {
      cy.findByText('STAN-3200').should('be.visible');
    });
  });
  context('when user presses page navigation', () => {
    context('when pressing left button', () => {
      before(() => {
        cy.findAllByTestId('left-button').eq(0).click();
      });

      it('shows the previous labware', () => {
        cy.findByText('STAN-3100').should('be.visible');
      });
    });
    context('when pressing right button', () => {
      before(() => {
        cy.findAllByTestId('right-button').eq(0).click();
      });

      it('shows the previous labware', () => {
        cy.findByText('STAN-3200').should('be.visible');
      });
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

      after(() => {
        cy.findByTestId('removeButton').click();
      });
    });

    context('when user adds a destination well plate', () => {
      before(() => {
        cy.findByRole('button', { name: '+ Add Plate' }).click();
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
        selectOption('transfer-type', 'Probes');
      });
      it('should display selected labware state', () => {
        shouldDisplaySelectedValue('transfer-type', 'Probes');
      });
      context('when user navigates away and the come back to destination plate with bio-state', () => {
        before(() => {
          cy.findAllByTestId('left-button').eq(1).click();
          cy.findAllByTestId('right-button').eq(1).click();
        });
        it('should display previous selected labware state', () => {
          shouldDisplaySelectedValue('transfer-type', 'Probes');
        });
      });
      after(() => {
        cy.findAllByTestId('removeButton').eq(1).click();
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
        selectOption('transfer-type', 'Probes');
        selectOption('input-labware-state', 'used');
      });
      context('When there is a server error', () => {
        before(() => {
          cy.msw().then(({ worker, graphql }) => {
            worker.use(
              graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>('SlotCopy', (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message: 'Exception while fetching data (/slotCopy) : The operation could not be validated.',
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

function saveButton() {
  return cy.findByRole('button', { name: /Save/i });
}

function saveSlotForLabwareWithNoPerm() {
  cy.visit('/lab/transfer');
  selectSGPNumber('SGP1008');
  cy.msw().then(({ worker, graphql }) => {
    const labware = createLabware('STAN-3200');
    worker.use(
      graphql.query<FindPermDataQuery, FindPermDataQueryVariables>('FindPermData', (req, res, ctx) => {
        return res.once(
          ctx.data({
            visiumPermData: {
              labware: { ...labware, barcode: 'STAN-3200' },
              addressPermData: []
            }
          })
        );
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
  selectOption('transfer-type', 'Probes');
  selectOption('input-labware-state', 'used');
  saveButton().click();
}
