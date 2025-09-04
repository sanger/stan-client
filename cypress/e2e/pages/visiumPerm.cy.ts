import { GetLabwareOperationsQuery, GetLabwareOperationsQueryVariables } from '../../../src/types/sdk';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';
import { selectSGPNumber } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Visium Perm', () => {
  before(() => cy.visit('/lab/visium_perm'));

  describe('filling in form', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-2004{enter}');
    });

    it('enables the button', () => {
      cy.findByRole('button', { name: 'Submit' }).should('not.be.disabled');
    });

    context('when clicking Submit', () => {
      it('shows an error message for SGP number', () => {
        cy.findByRole('button', { name: 'Submit' }).click();
        cy.findByText('SGP number is a required field').should('be.visible');
      });

      it('submits the form when SGP number is selected', () => {
        selectSGPNumber('SGP1008');
        cy.findByRole('button', { name: 'Submit' }).click();
        cy.findByText('Visium Permeabilisation complete').should('be.visible');
      });
    });
  });

  describe('scanning labware with empty slots', () => {
    before(() => {
      cy.visit('/lab/visium_perm');
      selectSGPNumber('SGP1008');
      cy.get('#labwareScanInput').type('STAN-2004{enter}');
    });

    it('displays control tube scanner', () => {
      cy.findByText('Control Tube').should('be.visible');
    });

    context('when user scans control tube', () => {
      before(() => {
        cy.findByTestId('controltubeDiv').within(() => {
          cy.get('#labwareScanInput').type('STAN-3201{enter}');
        });
      });
      it('displays the table with control tube', () => {
        cy.findByText('STAN-3201').should('be.visible');
      });
      it('displays Positive control checkbox for all slots', () => {
        cy.findAllByRole('checkbox', { name: /Positive Control/i }).should('have.length', 8);
      });
    });

    context('when a control tube is selected for A1', () => {
      before(() => {
        cy.findAllByRole('checkbox').eq(0).click();
      });
      it('displays the control tube barcode for A1 slot', () => {
        cy.findAllByTestId('permData.0.label').should('have.text', 'STAN-3201');
      });
    });

    context('when address A2 is assigned with control tube', () => {
      before(() => {
        cy.findAllByRole('checkbox').eq(1).click();
      });
      it('removes the control tube from A1 and displays in A2', () => {
        cy.findAllByTestId('permData.0.label').should('have.text', '');
        cy.findAllByTestId('permData.2.label').should('have.text', 'STAN-3201');
      });
    });

    context('when scanned control tube is removed', () => {
      before(() => {
        cy.findByTestId('controltubeDiv').within(() => {
          cy.findByTestId('removeButton').click();
        });
      });
      it('removes the control tube assigned', () => {
        cy.findAllByText('STAN-3201').should('not.exist');
      });
    });
    context('when submit button clicked with control tube data', () => {
      before(() => {
        cy.findByTestId('controltubeDiv').within(() => {
          cy.get('#labwareScanInput').type('STAN-3111{enter}');
        });
        cy.findAllByRole('checkbox').eq(1).click();
        cy.findByRole('button', { name: 'Submit' }).click();
      });
      it('submits the form', () => {
        cy.findByText('Visium Permeabilisation complete').should('be.visible');
      });
    });
  });

  context('scanning a labware with no staining done', () => {
    before(() => {
      saveLabwareWithNoStain();
    });
    it('shows a warning message', () => {
      cy.findByText('Labware has not been stained').should('be.visible');
    });

    context('when Continue button is clicked', () => {
      before(() => {
        cy.findByRole('button', { name: /Continue/i }).click();
      });
      it('shows a success message', () => {
        cy.findByText('Visium Permeabilisation complete').should('be.visible');
      });
    });
    context('when Cancel button is clicked', () => {
      before(() => {
        saveLabwareWithNoStain();
        cy.findByRole('button', { name: /Cancel/i }).click();
      });
      it('cancels the operation', () => {
        cy.findByRole('button', { name: /Submit/i }).should('be.enabled');
      });
    });
  });

  function saveLabwareWithNoStain() {
    cy.visit('/lab/visium_perm');
    selectSGPNumber('SGP1008');
    cy.msw().then(({ worker, graphql }) => {
      createLabware('STAN-3200');
      worker.use(
        graphql.query<GetLabwareOperationsQuery, GetLabwareOperationsQueryVariables>('GetLabwareOperations', () => {
          return HttpResponse.json({
            data: {
              labwareOperations: []
            }
          });
        })
      );
    });
    cy.get('#labwareScanInput').type('STAN-3200{enter}');
    cy.findAllByRole('checkbox').eq(1).click();
    cy.findByRole('button', { name: 'Submit' }).click();
  }
});
