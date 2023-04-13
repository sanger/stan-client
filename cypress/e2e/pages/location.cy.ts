import { setAwaitingLabwareInSessionStorage } from '../shared/awaitingStorage.cy';

describe('Location', () => {
  before(() => {
    cy.visit('/locations/STO-024');
  });

  describe('Custom Names', () => {
    it('displays the custom name', () => {
      cy.findByText('Box 3 in Rack 3 in Freezer 1 in Room 1234').should('be.visible');
    });

    context('when I click and edit the custom name', () => {
      before(() => {
        cy.findByText('Box 3 in Rack 3 in Freezer 1 in Room 1234').click();
        cy.focused().type('Freezer McCool{enter}');
      });

      it('updates it', () => {
        cy.findByText('Freezer McCool').should('be.visible');
      });
    });
  });

  describe('Displaying Properties', () => {
    it('displays the name', () => {
      cy.findByText('Location 24').should('exist');
    });
    it('displays the path', () => {
      cy.findByText('Location 1 -> Location 2 -> Location 7 -> Location 24').should('exist');
    });

    it('displays the barcode', () => {
      cy.findByText('STO-024').should('exist');
    });

    it('displays the parent', () => {
      cy.findByText('Rack 3 in Freezer 1 in Room 1234').should('exist');
    });

    it('displays the size', () => {
      cy.findByTextContent('5 row(s) and 5 column(s)').should('exist');
    });

    it('displays the number of stored items', () => {
      cy.findByTestId('storedItemsCount').should('contain', '6');
    });

    it('displays the layout', () => {
      cy.findByText('RightUp').should('exist');
    });

    it('displays a section for Stored Items', () => {
      cy.findByText('Stored Items').should('exist');
    });
  });

  describe('Empty Location', () => {
    context('when clicking the "Empty Location" button', () => {
      before(() => {
        cy.findByRole('button', { name: /Empty Location/i }).click();
      });

      it('shows a confirmation modal', () => {
        cy.findByTextContent('Are you sure you want to remove all labware from Freezer McCool?').should('exist');
      });

      context('When clicking the "Remove All Labware" button', () => {
        before(() => {
          cy.findByRole('button', { name: /Remove All Labware/i }).click();
        });

        it('removes all labware from the Location', () => {
          cy.findByTestId('storedItemsCount').should('contain', '0');
        });

        it('shows a success message', () => {
          cy.findByText('Location emptied').should('be.visible');
        });
      });
    });
  });

  describe('Stored Items', () => {
    context('when Location has children', () => {
      before(() => {
        cy.visit('/locations/STO-005');
      });

      it("doesn't display a section for Stored Items", () => {
        cy.findByText('Stored Items').should('not.exist');
      });
    });
  });

  describe('when awaiting labwares are in session storage', () => {
    before(() => {
      setAwaitingLabwareInSessionStorage();
      cy.visit('/locations/STO-024');
    });
    context('when location opened with awaiting labware', () => {
      it('display the table with confirmed labware', () => {
        cy.findByRole('table').contains('td', 'STAN-2111');
        cy.findByRole('table').contains('td', 'STAN-3111');
      });
      it('store all button should be enabled', () => {
        cy.findByRole('button', { name: /Store All/i }).should('be.enabled');
      });
    });

    context('when storing all awaiting labware to location in one go', () => {
      before(() => {
        cy.findByRole('button', { name: /Store All/i }).click();
      });
      it('should display the labware in boxes', () => {
        cy.findByText('STAN-2111').should('exist');
        cy.findByText('STAN-3111').should('exist');
        cy.findByRole('table').should('not.exist');
      });
    });
    context('when storing one awaiting labware to location', () => {
      before(() => {
        setAwaitingLabwareInSessionStorage();
        cy.visit('/locations/STO-024');
        cy.findByTestId('addIcon-STAN-3111').click();
      });
      it('should display the added labware in box', () => {
        cy.findByText('STAN-3111').should('exist');
      });
      it('should only display the remaining labware in table', () => {
        cy.findByRole('table').contains('td', 'STAN-2111');
      });
    });
  });
  describe('when performing browser operations', () => {
    before(() => {
      setAwaitingLabwareInSessionStorage();
      cy.visit('/locations/STO-002');
      cy.findByText('Rack 1 in Freezer 1 in Room 1234').click();
      cy.findByText('Box 1 in Rack 1 in Freezer 1 in Room 1234').click();
      cy.findByTestId('addIcon-STAN-3111').click();
    });

    context('when back button is pressed in browser', () => {
      before(() => {
        cy.go('back');
      });
      it('should display the updated list of awaiting labwares', () => {
        cy.findByText('STAN-2111').should('exist');
        cy.findByText('STAN-4111').should('exist');
        cy.findByText('STAN-3111').should('not.exist');
      });
    });

    context('when refreshing the page', () => {
      before(() => {
        cy.reload();
      });
      it('should display the updated list of awaiting labwares', () => {
        cy.findByText('STAN-2111').should('exist');
        cy.findByText('STAN-4111').should('exist');
        cy.findByText('STAN-3111').should('not.exist');
      });
    });
    context('when navigationg to another page', () => {
      before(() => {
        cy.findByText('Home').click();
      });
      it('should display an alert', () => {
        cy.on('window:alert', (str) => {
          expect(str).to.equal('You have labwares that are not stored. Are you sure you want to leave?');
        });
      });
    });
    after(() => {
      sessionStorage.removeItem('awaitingLabwares');
    });
  });
});
