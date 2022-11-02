import {
  FindPermDataQuery,
  FindPermDataQueryVariables,
  SlotCopyMutation,
  SlotCopyMutationVariables
} from '../../../src/types/sdk';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';

describe('Transfer Page', () => {
  before(() => {
    cy.visit('/lab/transfer');
    cy.findByTestId('select_workNumber').select('SGP1008');
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
      cy.findByTestId('input-labware-state').select('used');
    });

    it('shows the selected state', () => {
      cy.findByText('used').should('be.visible');
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
        cy.findByTestId('transfer-type').select('Probes');
      });
      it('should display selected labware state', () => {
        cy.findByText('Probes').should('be.visible');
      });
      context('when user navigates away and the come back to destination plate with bio-state', () => {
        before(() => {
          cy.findAllByTestId('left-button').eq(1).click();
          cy.findAllByTestId('right-button').eq(1).click();
        });
        it('should display previous selected labware state', () => {
          cy.findByText('Probes').should('be.visible');
        });
      });
      after(() => {
        cy.findAllByTestId('removeButton').eq(1).click();
      });
    });

    context('When user maps some source slots', () => {
      before(() => {
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A1').click();
          cy.findByText('D1').click({ shiftKey: true });
        });

        cy.get('#outputLabwares').within(() => {
          cy.findByText('G1').click();
        });
        it('does not enable Save Button', () => {
          saveButton().should('not.be.enabled');
        });
      });

      context('when all required field are entered', () => {
        before(() => {
          cy.findByTestId('transfer-type').select('Probes');
          cy.findByTestId('input-labware-state').select('used');
        });
        it('enables Save Button', () => {
          saveButton().should('be.enabled');
        });
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

    describe('On save', () => {
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

  cy.findByTestId('select_workNumber').select('SGP1008');
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

  cy.findByTestId('transfer-type').select('Probes');
  cy.findByTestId('input-labware-state').select('used');
  saveButton().click();
}
