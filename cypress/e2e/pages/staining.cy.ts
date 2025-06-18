import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';

describe('Staining Page', () => {
  before(() => {
    cy.visit('/lab/staining');
  });

  /*describe('Showing measurements', () => {
    context('when a Stain Type with measurements is selected', () => {
      before(() => {
        selectOption('stainType', 'H&E');
      });

      it('shows measurements fields', () => {
        cy.findByText('Measurements').should('be.visible');
      });
    });

    context('when a Stain Type without measurements is selected', () => {
      before(() => {
        selectOption('stainType', "Masson's Trichrome");
      });

      it("doesn't show measurements fields", () => {
        cy.findByText('Measurements').should('not.exist');
      });
    });

    context('when no Stain Type is selected', () => {
      before(() => {
        selectOption('stainType', '');
      });

      it("doesn't show measurements fields", () => {
        cy.findByText('Measurements').should('not.exist');
      });
    });
  });

  describe('Validation', () => {
    context('when submitting the form with nothing filled in', () => {
      before(() => {
        selectOption('stainType', "Masson's Trichrome");
        cy.findByRole('button', { name: 'Submit' }).click();
      });

      it('shows a validation error for labware', () => {
        cy.findByText('Labware field must have at least 1 items').should('be.visible');
      });

      it('shows a validation error for work number', () => {
        cy.findByText('SGP Number is a required field').should('be.visible');
      });
    });

    context('when a Stain Type with measurements is selected', () => {
      before(() => {
        selectOption('stainType', 'H&E');
        cy.findByRole('button', { name: 'Submit' }).click();
      });

      it('shows an error for missing durations', () => {
        cy.findAllByText('Duration must be greater than or equal to 1').should('have.length', 3);
      });
    });
  });

  describe('On RNSAcope and IHC Stain type selection', () => {
    context('when RNAscope Stain Type is selected', () => {
      before(() => {
        selectOption('stainType', 'RNAscope');
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
      });
      it('displays a table to enter stain information', () => {
        cy.findByTestId('stain-info-table').contains('STAN-3111');
      });
      it('shows a table with RNAScope Plex Number column enabled', () => {
        cy.findByTestId('STAN-3111-plexRNAscope').should('be.enabled');
      });
      it('shows a table with IHC Plex Number column disabled', () => {
        cy.findByTestId('STAN-3111-plexIHC').should('be.disabled');
      });
    });
    context('when IHC Stain Type is selected', () => {
      before(() => {
        selectOption('stainType', 'IHC');
      });
      it('shows a table with IHC Plex Number column enabled', () => {
        cy.findByTestId('STAN-3111-plexIHC').should('be.enabled');
      });
      it('shows a table with RNAScope Plex Number column disabled', () => {
        cy.findByTestId('STAN-3111-plexRNAscope').should('be.disabled');
      });
    });
    context('when RNAscope & IHC Stain Type is selected', () => {
      before(() => {
        selectOption('stainType', 'RNAscope & IHC');
      });
      it('shows a table with RNAScope Plex Number column enabled', () => {
        cy.findByTestId('STAN-3111-plexRNAscope').should('be.enabled');
      });
      it('shows a table with IHC Plex Number column enabled', () => {
        cy.findByTestId('STAN-3111-plexIHC').should('be.enabled');
      });
    });
    context("when 'Positive' is selected for experimental panel column in 'Apply all' row", () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-4111{enter}');
        selectOption('all-panel', 'Positive');
      });
      it("selects 'Positive' value for all experimental panel columns", () => {
        cy.findAllByText('Positive').should('have.length', 3);
      });
    });
  });*/
  describe('On Submission', () => {
    describe('when H&E Stain Type is selected', () => {
      before(() => {
        submitStainInfo('H&E');
      });
      shouldDisplaySuccessDialog(['Store', 'Reset Form', 'Return Home']);
      shouldNavigateToStore();
    });
    describe('when IHC Stain Type is selected', () => {
      before(() => {
        submitStainInfo('IHC');
      });
      shouldDisplaySuccessDialog(['Store', 'Stain Again', 'Reset Form', 'Return Home']);
      shouldNavigateToStore();
    });
    describe('when Massons Trichrome Stain Type is selected', () => {
      before(() => {
        cy.visit('/lab/staining');
        selectOption('stainType', `Masson's Trichrome`);
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectSGPNumber('SGP1008');
        getButton('Submit').click();
      });
      shouldDisplaySuccessDialog(['Store', 'Reset Form', 'Return Home']);
      shouldNavigateToStore();
    });
    describe('when RNAscope Stain Type is selected', () => {
      before(() => {
        submitStainInfo('RNAscope');
      });
      shouldDisplaySuccessDialog(['Store', 'Stain Again', 'Reset Form', 'Return Home']);
      shouldNavigateToStore();
    });
  });

  function submitStainInfo(stainType: string) {
    cy.visit('/lab/staining');
    selectOption('stainType', stainType);
    cy.get('#labwareScanInput').type('STAN-3111{enter}');
    fillInForm(stainType);
    getButton('Submit').click();
  }
  function fillInForm(stainType: string) {
    if (stainType === 'H&E') {
      selectSGPNumber('SGP1008');
      cy.findByTestId('timeMeasurements.0.minutes').type('1');
      cy.findByTestId('timeMeasurements.0.seconds').type('1');
      cy.findByTestId('timeMeasurements.1.minutes').type('1');
      cy.findByTestId('timeMeasurements.1.seconds').type('1');
      cy.findByTestId('timeMeasurements.2.minutes').type('1');
      cy.findByTestId('timeMeasurements.2.seconds').type('1');
      selectOption('Haematoxylin-comment', 'Gills');
      selectOption('Eosin-comment', 'Alcoholic');
    }
    if (stainType === 'IHC' || stainType === 'RNAscope' || stainType === 'RNAscope & IHC') {
      cy.findByTestId('STAN-3111-bondBarcode').type('1234');
      cy.findByTestId('STAN-3111-bondRun').type('1');
      selectOption('STAN-3111-workNumber', 'SGP1008');
      selectOption('STAN-3111-panel', 'Positive');
      if (stainType === 'RNAscope' || stainType === 'RNAscope & IHC') {
        cy.findByTestId('STAN-3111-plexRNAscope').type('1');
      }
      if (stainType === 'IHC' || stainType === 'RNAscope & IHC') {
        cy.findByTestId('STAN-3111-plexIHC').type('1');
      }
    }
  }
  function shouldNavigateToStore() {
    context('when store option selected for stained labware', () => {
      before(() => {
        storeButton().click();
      });
      context('while in store page with confirmed labware', () => {
        it('navigates to store page', () => {
          cy.url().should('be.equal', 'http://localhost:3000/store');
        });
        it('when redirected to the Store page', () => {
          cy.findByRole('table').contains('td', 'STAN-3111');
        });
      });
    });
  }
  function shouldDisplaySuccessDialog(buttonNames: string[]) {
    context('when the form is submitted', () => {
      it('shows the success dialog', () => {
        cy.findByText('Staining Successful');
      });
      it('displays all buttons', () => {
        shouldDisplayButtons(buttonNames);
      });
    });
  }
  function getButton(buttonName: string) {
    return cy.findByRole('button', { name: `${buttonName}` });
  }
  function storeButton() {
    return getButton('Store');
  }
  function shouldDisplayButtons(buttonNames: string[]) {
    buttonNames.forEach((buttonName) => {
      getButton(buttonName).should('be.visible');
    });
  }
});
