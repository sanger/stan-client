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
    it('loads with no output labware type is checked', () => {
      cy.findByTestId('96 Well Plate').should('not.be.checked');
      cy.findByTestId('8 Strip Tube').should('not.be.checked');
      cy.findByTestId('Scan Labware').should('not.be.checked');
      cy.findByTestId('outputLabwares').within((elem) => {
        cy.wrap(elem).findByTestId('labware-').should('not.exist');
      });
    });

    describe('when scanning the labware, before selecting the destination labware', () => {
      before(() => {
        cy.get('#inputLabwares').within((elem) => {
          cy.wrap(elem).get('#labwareScanInput').wait(1000).clear().type('STAN-3111{enter}');
        });
      });
      it('shows the scanned labware', () => {
        cy.get('#inputLabwares').within((elem) => {
          cy.wrap(elem).findByText('A1').should('be.visible');
        });
      });
    });

    it('should display 96 Well Plate layout when user selects 96 Well Plate option', () => {
      cy.get('[type="radio"][name="96 Well Plate"]').check();
      cy.findByTestId('bioState').should('be.visible');
      cy.findByRole('button', { name: '+ Add Plate' }).should('be.visible');
      cy.findByTestId('copyMode-One to one').should('be.checked');
      cy.findByTestId('copyMode-One to many').should('exist');
      cy.findByTestId('copyMode-Many to one').should('exist');
      cy.findByTestId('outputLabwares').within((elem) => {
        cy.wrap(elem).findByTestId('labware-').should('be.visible');
      });
    });
    it('should display 8 Strip Tube layout when user selects 8 Strip Tube option', () => {
      cy.get('[type="radio"][name="8 Strip Tube"]').check();
      cy.findByTestId('bioState').should('be.visible');
      cy.findByRole('button', { name: '+ Add Plate' }).should('be.visible');
      cy.findByTestId('copyMode-One to one').should('be.checked');
      cy.findByTestId('copyMode-One to many').should('exist');
      cy.findByTestId('copyMode-Many to one').should('exist');
      cy.findByTestId('outputLabwares').within((elem) => {
        cy.wrap(elem).findByTestId('labware-').should('be.visible');
      });
    });
    it('should display scan option when user selects scan option', () => {
      cy.findByTestId('Scan Labware').click();
      cy.findByTestId('bioState').should('not.exist');
      cy.findByRole('button', { name: '+ Add Plate' }).should('not.exist');
      cy.get('#labwareScanInput').should('be.visible');
      cy.findByTestId('copyMode-One to one').should('be.checked');
      cy.findByTestId('copyMode-One to many').should('not.be.checked');
      cy.findByTestId('copyMode-Many to one').should('not.be.checked');
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
      cy.findByText('Bio State').should('be.visible');
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
  });

  describe('Multiple destinations with different labware type', () => {
    before(() => {
      cy.get('[type="radio"][name="96 Well Plate"]').check();
      cy.get('[type="radio"][name="8 Strip Tube"]').check();
    });
    it('updates destination pagination accordingly', () => {
      cy.findByTestId('pager-text-div').contains('2 of 2');
    });
    describe('when paginating to a different destination labware type', () => {
      before(() => {
        cy.findByTestId('left-button').click();
      });
      it('updates the selection mode accordingly', () => {
        cy.findByTestId('96 Well Plate').should('be.checked');
      });
    });
    describe('when selecting scan labware option', () => {
      before(() => {
        cy.get('[type="radio"][name="Scan Labware"]').check();
      });
      it('resets the destination labware', () => {
        cy.findByTestId('pager-text-div').contains('1 of 1');
      });
    });
  });

  describe('Transfer to an empty slot', () => {
    before(() => {
      cy.visit('/lab/transfer');
      cy.findByTestId('Scan Labware').click();
      cy.get('#inputLabwares').within((elem) => {
        cy.wrap(elem).get('#labwareScanInput').wait(1000).clear().type('STAN-3111{enter}');
      });
      cy.findByTestId('dest-scanner').within((elem) => {
        cy.wrap(elem).get('#labwareScanInput').wait(1000).clear().type('STAN-3000{enter}');
      });
    });
    it('should allow transfer to an empty slot', () => {
      cy.get('#inputLabwares').within((elem) => {
        cy.wrap(elem).findByText('A1').wait(1000).click({ force: true });
      });
      cy.get('#outputLabwares').within((elem) => {
        cy.wrap(elem).findByText('A2').wait(1000).click({ force: true });
      });
      cy.findByRole('table').contains('td', 'A1');
      cy.findByRole('table').contains('td', 'A2');
    });
  });

  describe('96 Well Plate option for Output labware', () => {
    before(() => {
      cy.visit('/lab/transfer');
      selectSGPNumber('SGP1008');
      cy.get('[type="radio"][name="96 Well Plate"]').check();
    });

    describe('On load', () => {
      it('shows a 96 well plate for the output', () => {
        cy.findAllByText(/96 WELL PLATE/i).should('be.visible');
      });

      it('disables the Save button', () => {
        saveButton().should('be.disabled');
      });

      it('when user scans slides shows it on the page', () => {
        cy.get('#labwareScanInput').type('STAN-3100{enter}');
        cy.findByText('STAN-3100').should('be.visible');
      });
      it('keeps the Save button disabled', () => {
        saveButton().should('be.disabled');
      });
      it('updates page when user scans multipe slides', () => {
        cy.get('#labwareScanInput').type('STAN-3200{enter}');
        cy.get('#labwareScanInput').type('STAN-3300{enter}');
        cy.contains('3 of 3').should('be.visible');
      });
      it('shows the last added labware', () => {
        cy.findByText('STAN-3300').should('be.visible');
      });
      it('displays previously entered labware state values', () => {
        selectOption('input-labware-state', 'used');
        cy.findAllByTestId('left-button').wait(1000).eq(0).click();
        cy.findAllByTestId('right-button').wait(1000).eq(0).click();
        cy.findByText('used').should('be.visible');
      });
      it('displays selected source slots in table', () => {
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A1').wait(1000).click({ force: true });
          cy.findByText('D1').wait(1000).click({ shiftKey: true, force: true });
        });
        cy.findByRole('table').contains('td', 'A1');
        cy.findByRole('table').contains('td', 'D1');
      });
    });

    describe('destination well plate', () => {
      before(() => {
        cy.visit('/lab/transfer');
        cy.get('[type="radio"][name="96 Well Plate"]').check();
        cy.get('#outputLabwares').within(() => {
          cy.findByRole('button', { name: '+ Add Plate' }).click();
        });
      });
      it('updates page with added labware ', () => {
        cy.contains('2 of 2').should('be.visible');
      });
      it('removes the labware from page', () => {
        cy.findAllByTestId('removeButton').click();
        cy.contains('1 of 1').should('be.visible');
      });
      it('should not display remove button', () => {
        cy.findByTestId('removeButton').should('not.exist');
      });
      it('should display selected labware state', () => {
        selectOption('bioState', 'Probes pre-clean');
        shouldDisplaySelectedValue('bioState', 'Probes pre-clean');
      });
    });

    describe('When user maps slots', () => {
      before(() => {
        cy.visit('/lab/transfer');
        cy.get('[type="radio"][name="96 Well Plate"]').check();
        cy.get('#labwareScanInput').type('STAN-3200{enter}');
      });
      it('display the notification to user about failed slots', () => {
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A2').wait(1000).click({ force: true });
        });
        cy.get('#outputLabwares').within(() => {
          cy.findByText('G1').wait(1000).scrollIntoView().click({ force: true });
        });
        cy.findByText('Failed slot(s)').should('be.visible');
      });
    });

    describe('when user maps slots in one to many mode', () => {
      before(() => {
        cy.visit('/lab/transfer');
        selectSGPNumber('SGP1008');
        cy.get('[type="radio"][name="96 Well Plate"]').check();
        cy.get('#labwareScanInput').type('STAN-3100{enter}');
        cy.findByTestId('copyMode-One to many').click({ force: true });
        selectOption('bioState', 'Probes pre-clean');
        cy.get('#inputLabwares').within(async () => {
          cy.findByText('A1').wait(1000).click({ force: true });
        });
        cy.findByText('Finish mapping for A1').should('be.visible');
        cy.get('#outputLabwares').within(() => {
          cy.findByText('G1').scrollIntoView().wait(1000).click({ force: true });
          cy.findByText('G2').scrollIntoView().wait(1000).click({ force: true });
          cy.findByText('G5').scrollIntoView().wait(1000).click({ force: true });
        });
      });

      it('displays the table with A1 slot', () => {
        cy.findByRole('table').scrollIntoView().contains('td', 'A1');
      });
      it('displays the table with G1 and G5 slots', () => {
        cy.findByRole('table').contains('td', 'G1');
        cy.findByRole('table').contains('td', 'G5');
      });
      it('removes finish transfer button when user clicks on it', () => {
        cy.findByRole('button', { name: 'Finish mapping for A1' }).scrollIntoView().click({ force: true });
        cy.findByRole('button', { name: 'Finish mapping for A1' }).should('not.exist');
      });
    });

    describe('when user maps slots in many to one mode', () => {
      before(() => {
        cy.visit('/lab/transfer');
        selectSGPNumber('SGP1008');
        cy.get('[type="radio"][name="96 Well Plate"]').check();
        cy.get('#labwareScanInput').type('STAN-3100{enter}');
        cy.findByTestId('bioState').scrollIntoView();
        selectOption('bioState', 'Probes pre-clean');
        cy.findByTestId('copyMode-Many to one').click({ force: true });
        cy.get('#inputLabwares').within(() => {
          cy.findByText('A2').wait(1000).click({ force: true });
          cy.findByText('B2').wait(1000).click({ cmdKey: true, force: true });
        });
        cy.get('#outputLabwares').within(() => {
          cy.findByText('D1').wait(1000).click({ force: true });
        });
      });
      it('should display the many to one mode', () => {
        cy.findByTestId('copyMode-Many to one').should('be.checked');
      });
      it('displays the table with A2, B2 slots mapped to D1', () => {
        cy.findByText('Slot mapping for STAN-3100').should('be.visible');
        cy.findByRole('table').contains('td', 'A2');
        cy.findByRole('table').contains('td', 'B2');
        cy.findByRole('table').contains('td', 'D1');
      });
    });

    describe('On save', () => {
      describe('When there is a server error', () => {
        before(() => {
          selectOption('bioState', 'Probes pre-clean');
          selectOption('input-labware-state', 'used');
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

      describe('When there is no server error', () => {
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

    describe('when scans a labwares with no perm done', () => {
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
  cy.get('[type="radio"][name="96 Well Plate"]').check();
  cy.get('#labwareScanInput').type('STAN-3200{enter}');
  cy.get('#inputLabwares').within(() => {
    cy.findByText('A1').click();
    cy.findByText('D1').click({ shiftKey: true });
  });
  cy.get('#outputLabwares').within(() => {
    cy.findByText('A1').click();
  });
  selectOption('bioState', 'Probes pre-clean');
  selectOption('input-labware-state', 'used');
  cy.get('#outputLabwares').within(() => {
    cy.findByText('A1').click();
  });
  saveButton().click();
}
