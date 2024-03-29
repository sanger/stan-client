import { PerformTissuePotMutation, PerformTissuePotMutationVariables } from '../../../src/types/sdk';
import { labwareTypeInstances } from '../../../src/lib/factories/labwareTypeFactory';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';
import {
  selectOption,
  selectOptionForMultiple,
  selectSGPNumber,
  shouldDisplaySelectedValue
} from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Pot Processing', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/original_sample_processing?type=pot');
  describe('Add Labware button', () => {
    context('when there is no source labware loaded', () => {
      it('is disabled', () => {
        cy.findByText('+ Add Labware').should('be.disabled');
      });
    });

    context('when source labware is loaded', () => {
      before(() => {
        scanInput();
      });

      it('is enabled', () => {
        cy.findByText('+ Add Labware').should('not.be.disabled');
      });
      it('scan labware input becomes disabled', () => {
        cy.get('#labwareScanInput').should('be.disabled');
      });
    });
  });

  describe('Labware type selection', () => {
    context('when Pot is selected', () => {
      before(() => {
        selectOption('labwareType', 'Pot');
      });
      it('should display Labware type, Fixative, Number of labware columns for adding labware', () => {
        cy.findByText('Labware type').should('be.visible');
        cy.findByText('Fixative').should('be.visible');
        cy.findByText('Number of labware').should('be.visible');
      });
    });
    context('when Fetal waste container is selected', () => {
      before(() => {
        selectOption('labwareType', 'Fetal waste container');
      });
      it('should only display Labware type and Number of labware columns for adding labware', () => {
        cy.findByText('Labware type').should('be.visible');
        cy.findByText('Fixative').should('not.exist');
        cy.findByText('Number of labware').should('be.visible');
      });
    });
  });

  describe('Leaving page', () => {
    context('when I try and leave the page', () => {
      it('shows a confirm box', () => {
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('You have unsaved changes. Are you sure you want to leave?');
          // Returning false cancels the event
          return false;
        });

        cy.findByText('Search').click();
      });
    });
  });

  describe('Pot labware', () => {
    context('when adding Pot labware', () => {
      before(() => {
        cy.findByRole('button', { name: /Cancel/i }).click();
        selectSGPNumber('SGP1008');
        selectOption('labwareType', 'Pot');
        cy.findByTestId('numLabware').type('{selectall}').type('2');
        selectOption('fixative', 'Formalin');
        cy.findByText('+ Add Labware').click();
      });
      it('should display two Pots', () => {
        cy.findByTestId(`divSection-Pot`).within(() => {
          cy.findAllByTestId('plan').should('have.length', 2);
        });
      });
      it('should autofill all fixatives', () => {
        shouldDisplaySelectedValue('pot-fixative', 'Formalin');
      });

      it('should enable save button', () => {
        cy.findByRole('button', { name: /Save/i }).should('be.enabled');
      });
    });
    context('when Fixative field is cleared', () => {
      before(() => {
        selectOptionForMultiple('pot-fixative', '', 0);
      });
      it('should disable save button', () => {
        cy.findByRole('button', { name: /Save/i }).should('be.disabled');
      });
    });
  });
  describe('Work Number', () => {
    context('when work number is empty', () => {
      before(() => {
        selectSGPNumber('');
      });
      it('should disable save button', () => {
        cy.findByRole('button', { name: /Save/i }).should('be.visible').should('be.disabled');
      });
    });
  });

  describe('Labware deletion', () => {
    context('when deleting a layout', () => {
      before(() => {
        cy.findAllByTestId('plan')
          .first()
          .within(() => {
            cy.findByRole('button', { name: /Delete Layout/i }).click();
          });
      });

      it('removes the panel', () => {
        cy.findByTestId(`divSection-Pot`).within(() => {
          cy.findAllByTestId('plan').should('have.length', 1);
        });
      });
    });
  });

  describe('Adding Fetal waste container labware', () => {
    before(() => {
      cy.visit('/lab/original_sample_processing?type=pot');
      scanInput();
      selectOption('labwareType', 'Fetal waste container');
      cy.findByTestId('numLabware').type('{selectall}').type('2');
      cy.findByText('+ Add Labware').click();
      selectSGPNumber('SGP1008');
    });
    it('should display two Fetal waste containers', () => {
      cy.findByTestId(`divSection-Fetalwastecontainer`).within(() => {
        cy.findAllByTestId('plan').should('have.length', 2);
      });
    });

    it('should not show Fixative field', () => {
      cy.findByLabelText('Fixative').should('not.exist');
    });
    it('should enable save button', () => {
      cy.findByRole('button', { name: /Save/i }).should('be.enabled');
    });
  });

  describe('API Requests', () => {
    context('when request is successful', () => {
      context('when I click Save', () => {
        before(() => {
          // Store the barcode of the created labware
          cy.msw().then(({ worker, graphql }) => {
            const labwareType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.POT);
            const barcode = 'STAN-111';
            const newLabware = labwareFactory.build({ labwareType, barcode });

            worker.use(
              graphql.mutation<PerformTissuePotMutation, PerformTissuePotMutationVariables>('PerformTissuePot', () => {
                return HttpResponse.json({
                  data: {
                    performPotProcessing: {
                      labware: [newLabware],
                      operations: []
                    }
                  }
                });
              })
            );
          });
          cy.findByRole('button', { name: /Save/i }).click();
        });
      });
    });
  });

  context('when request is unsuccessful', () => {
    before(() => {
      cy.visit('/lab/original_sample_processing?type=pot');
      scanInput();
      selectOption('labwareType', 'Pot');
      cy.findByTestId('numLabware').type('{selectall}').type('1');
      selectOption('fixative', 'Formalin');
      cy.findByText('+ Add Labware').click();
      selectSGPNumber('SGP1008');
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<PerformTissuePotMutation, PerformTissuePotMutationVariables>('PerformTissuePot', () => {
            return HttpResponse.json({
              errors: [
                {
                  extensions: {
                    problems: ['This thing went wrong', 'This other thing went wrong']
                  }
                }
              ]
            });
          })
        );
      });
      cy.findByRole('button', { name: /Save/i }).click();
    });

    it('shows the errors', () => {
      cy.findByText('This thing went wrong').should('be.visible');
      cy.findByText('This other thing went wrong').should('be.visible');
    });
  });
});

function scanInput() {
  cy.get('#labwareScanInput').type('STAN-113{enter}');
}
