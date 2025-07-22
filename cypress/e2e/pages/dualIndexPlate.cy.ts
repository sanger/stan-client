import {
  FindReagentPlateQuery,
  FindReagentPlateQueryVariables,
  RecordReagentTransferMutation,
  RecordReagentTransferMutationVariables
} from '../../../src/types/sdk';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';
import { selectOption, selectSGPNumber, shouldBeDisabled, shouldBeEnabled } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

function scanInDestinationLabware() {
  cy.get('#labwareScanInput').type('STAN-5311{enter}');
}

function scanInSourceLabware(barcode: string) {
  cy.get('#sourceScanInput').within(() => {
    cy.findByRole('textbox').clear().type(`${barcode}{enter}`);
  });
}

function saveButton() {
  return cy.findByRole('button', { name: /Save/i }).scrollIntoView();
}

describe('Dual Index Plate', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/dual_index_plate');

  context('when source and destination labware are not scanned', () => {
    before(() => {
      selectSGPNumber('SGP1008');
    });
    it('disables the Save button', () => {
      saveButton().should('be.disabled');
    });
  });

  context('when plate type is not set', () => {
    before(() => {
      selectOption('plateType', '');
    });
    it('hides the source labware scanner', () => {
      cy.get('#sourceScanInput').should('not.exist');
    });
  });

  context('when an invalid source labware (dual index plate) barcode is entered', () => {
    before(() => {
      selectOption('plateType', 'Dual Index TT Set A');
      scanInSourceLabware('invalid');
    });
    it('should display an error message', () => {
      cy.findByText('24 digit number required').should('be.visible');
    });
  });

  context('when a valid source labware (dual index plate) barcode is entered', () => {
    before(() => {
      cy.reload();
      selectOption('plateType', 'Dual Index TT Set A');
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
      it('disables plate type select box', () => {
        shouldBeDisabled('plateType');
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
      it('enable plate type select box', () => {
        shouldBeEnabled('plateType');
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
    context('When user selects a work number,plateType and have a mapping', () => {
      before(() => {
        selectSGPNumber('SGP1008');
      });
      it('should enable save', () => {
        saveButton().should('be.enabled');
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

    context('when a dual index plate with a plate type already assigned is scanned', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.query<FindReagentPlateQuery, FindReagentPlateQueryVariables>('FindReagentPlate', () => {
              return HttpResponse.json({
                data: {
                  reagentPlate: {
                    plateType: 'Dual Index TT Set A',
                    barcode: '123456789123456789012345',
                    slots: []
                  }
                }
              });
            })
          );
        });
        cy.reload();
        selectOption('plateType', 'Dual Index TS Set A');
        scanInSourceLabware('123456789123456789012345');
      });
      it('should display plate type that is already assigned to dual index plate', () => {
        cy.contains('Dual Index TT Set A').should('be.visible');
      });
      it('should disable plate type selection combo', () => {
        shouldBeDisabled('plateType');
      });
      it('displays a warning user message', () => {
        cy.findByText('Dual Index TT Set A type is already assigned to this plate.').should('be.visible');
      });
    });

    context('when there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordReagentTransferMutation, RecordReagentTransferMutationVariables>(
              'RecordReagentTransfer',
              () => {
                return HttpResponse.json({
                  errors: [
                    {
                      message:
                        'Exception while fetching data (/reagent transfer) : The operation could not be validated.',
                      extensions: {
                        problems: ['Labware is discarded: [STAN-5111]']
                      }
                    }
                  ]
                });
              }
            )
          );
        });
        cy.reload();
        selectSGPNumber('SGP1008');
        selectOption('plateType', 'Dual Index TS Set A');
        scanInSourceLabware('300051128832186720221202');
        scanInDestinationLabware();
        cy.get('#sourceLabwares').within(() => {
          cy.findByText('A1').click();
        });
        cy.get('#destLabwares').within(() => {
          cy.findByText('A1').click();
        });
        saveButton().click();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-5111]').should('be.visible');
      });
    });
  });
});
