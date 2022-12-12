import {
  FindReagentPlateQuery,
  FindReagentPlateQueryVariables,
  RecordReagentTransferMutation,
  RecordReagentTransferMutationVariables
} from '../../../src/types/sdk';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';

function scanInDestinationLabware() {
  cy.get('#labwareScanInput').type('STAN-5111{enter}');
}

function scanInSourceLabware(barcode: string) {
  cy.get('#sourceScanInput').within(() => {
    cy.findByRole('textbox').clear().type(`${barcode}{enter}`);
  });
}

function saveButton() {
  return cy.findByRole('button', { name: /Save/i });
}

describe('Dual Index Plate', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/dual_index_plate', 'select_workNumber');

  context('when source and destination labware are not scanned', () => {
    before(() => {
      cy.get('select').select('SGP1008');
    });
    it('disables the Save button', () => {
      saveButton().should('be.disabled');
    });
  });

  context('when an invalid source labware (dual index plate) barcode is entered', () => {
    before(() => {
      scanInSourceLabware('invalid');
    });
    it('should display an error message', () => {
      cy.findByText('24 digit number required').should('be.visible');
    });
  });
  context('when a dual index plate with a plate type already assigned is scanned', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindReagentPlateQuery, FindReagentPlateQueryVariables>('FindReagentPlate', (req, res, ctx) => {
            return res.once(
              ctx.data({
                reagentPlate: {
                  plateType: 'Fresh frozen - Dual Index TT Set A',
                  barcode: '123456789123456789012345',
                  slots: []
                }
              })
            );
          })
        );
      });
      scanInSourceLabware('123456789123456789012345');
    });
    it('should display plate type that is alreAdy assigned to dual index plate', () => {
      cy.get('#plateType').within(() => {
        cy.findByRole('combobox').should('have.value', 'Fresh frozen - Dual Index TT Set A');
      });
    });
    it('should disable plate type selection combo', () => {
      cy.get('#plateType').within(() => {
        cy.findByRole('combobox').should('be.disabled');
      });
    });
  });
  context('when a valid source labware (dual index plate) barcode is entered', () => {
    before(() => {
      cy.url().reload();
      scanInSourceLabware('300051128832186720221202');
    });
    it('should display the dual index plate', () => {
      cy.get('#sourceLabwares').should('exist');
    });
  });

  context('when a destination labware (96 well plate) is scanned', () => {
    before(() => {
      scanInDestinationLabware();
    });
    it('should display the dual index plate', () => {
      cy.get('#destLabwares').should('exist');
    });
  });
  describe('On mapping', () => {
    context('When user maps source slot to destination slot', () => {
      before(() => {
        cy.get('#sourceLabwares').within(() => {
          cy.findByText('A1').click();
        });
        cy.get('#destLabwares').within(() => {
          cy.findByText('A1').click();
        });
      });

      it('displays the A1 slot', () => {
        cy.findByRole('table').contains('td', 'A1');
      });
      it('displays the table with D1 slot', () => {
        cy.findByRole('table').contains('td', 'A1');
      });
    });
    context('When user maps source slot to an empty destination slot', () => {
      before(() => {
        cy.get('#sourceLabwares').within(() => {
          cy.findByText('A1').click();
        });
        cy.get('#destLabwares').within(() => {
          cy.findByText('A2').click();
        });
      });

      it('displays warning message', () => {
        cy.findByText('Cannot transfer reagent to an empty slot.').should('be.visible');
      });
    });
  });
  describe('On removing mapping', () => {
    before(() => {
      cy.get('#sourceLabwares').within(() => {
        cy.findByText('A3').click();
      });
      cy.get('#destLabwares').within(() => {
        cy.findByText('A3').click();
      });
    });
    it('should display two mappings in table', () => {
      //find("tr) return rows including header
      cy.findByRole('table').find('tr').should('have.length', 3);
    });
    context('when user clicks remove button in the mapping table', () => {
      before(() => {
        cy.findAllByTestId('removeButton').eq(0).click();
      });
      it('should remove the mapping', () => {
        cy.findByRole('table').find('tr').contains('td', 'A1').should('not.exist');
      });
    });
    context('when user clears all mapped slots', () => {
      before(() => {
        cy.get('#sourceLabwares').within(() => {
          cy.findByText('A3').click();
        });
        cy.get('#destLabwares').within(() => {
          cy.findByText('A3').click();
        });
        cy.findByRole('button', { name: /Clear/i }).click();
      });
      it('should remove all mappings', () => {
        cy.findByRole('table').should('not.exist');
      });
      it('should not enable Save button', () => {
        saveButton().should('be.disabled');
      });
      after(() => {
        cy.get('#sourceLabwares').within(() => {
          cy.findByText('A1').click();
        });
        cy.get('#destLabwares').within(() => {
          cy.findByText('A1').click();
        });
      });
    });
  });

  describe('On Save', () => {
    context('When user selects a work number and have a mapping, but no plateType', () => {
      before(() => {
        cy.findByTestId('select_workNumber').select('SGP1008');
      });
      it('should disable save', () => {
        saveButton().should('be.disabled');
      });
    });
    context('When user selects a work number,plateType and have a mapping', () => {
      before(() => {
        cy.get('#plateType').within(() => {
          cy.findByRole('combobox').select('Fresh frozen - Dual Index TT Set A');
        });
        cy.findByTestId('select_workNumber').select('SGP1008');
      });
      it('should enable save', () => {
        saveButton().should('be.enabled');
      });
    });
    context('when there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordReagentTransferMutation, RecordReagentTransferMutationVariables>(
              'RecordReagentTransfer',
              (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message:
                        'Exception while fetching data (/reagent transfer) : The operation could not be validated.',
                      extensions: {
                        problems: ['Labware is discarded: [STAN-5111]']
                      }
                    }
                  ])
                );
              }
            )
          );
        });
        saveButton().click();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-5111]').should('be.visible');
      });
    });

    context('when there is no server error', () => {
      before(() => {
        saveButton().click();
      });
      it('should display a success message', () => {
        cy.findByText('Reagents transferred').should('be.visible');
      });
      it('should display Reset button', () => {
        cy.findByRole('button', { name: /Reset Form/i }).should('be.visible');
      });
      it('should disable Clear button', () => {
        cy.findByRole('button', { name: /Clear/i }).should('be.disabled');
      });
      it('should disable Remove button', () => {
        cy.findAllByTestId('removeButton').eq(0).should('be.disabled');
      });
    });
  });
});
