import { PerformSolutionTransferMutation, PerformSolutionTransferMutationVariables } from '../../../src/types/sdk';
import { labwareTypeInstances } from '../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';
import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Solution Transfer', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/solution_transfer');

  describe('Validation', () => {
    context('when the form with nothing filled in', () => {
      before(() => {
        cy.findByRole('button', { name: 'Submit' }).click();
      });

      it('shows a validation error for labware', () => {
        cy.findByText('At least one labware must be scanned').should('be.visible');
      });

      it('shows a validation error for the work number', () => {
        cy.findByText('SGP Number is a required field').should('be.visible');
      });
    });
    context('when labware is scanned', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
      });
      it('shows a table', () => {
        cy.findByRole('table').should('be.visible');
      });
    });
    context('when Submit clicked for scanned labware with no solution selected', () => {
      before(() => {
        cy.findByRole('button', { name: 'Submit' }).click();
      });
      it('shows a validation error for the Solution', () => {
        cy.findByText('Solution is a required field').should('be.visible');
      });
    });
  });

  describe('when solution is selected to apply to all', () => {
    before(() => {
      selectOption('applyAllSolution', 'Ethanol');
    });
    it('all solution dropdowns in table must select the selected solution', () => {
      cy.findByRole('table').contains('td', 'Ethanol');
    });
  });

  describe('API Requests', () => {
    context('when request is successful', () => {
      before(() => {
        selectSGPNumber('SGP1008');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PerformSolutionTransferMutation, PerformSolutionTransferMutationVariables>(
              'PerformSolutionTransfer',
              ({ variables }) => {
                const labwareType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.POT);
                const labware = variables.request.labware.map((lw) =>
                  labwareFactory.build({ labwareType, barcode: lw.barcode })
                );
                return HttpResponse.json({
                  data: {
                    performSolutionTransfer: {
                      labware,
                      operations: []
                    }
                  }
                });
              }
            )
          );
        });
        cy.findByRole('button', { name: /Submit/i }).click({ force: true });
      });
      it('displays Operation complete message', () => {
        cy.findByText('Operation Complete').should('be.visible');
      });
    });

    context('when request is unsuccessful', () => {
      before(() => {
        cy.visit('/lab/solution_transfer');
        selectSGPNumber('SGP1008');
        cy.get('#labwareScanInput').type('STAN-3111{enter}', { force: true });
        selectOption('applyAllSolution', 'Ethanol');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PerformSolutionTransferMutation, PerformSolutionTransferMutationVariables>(
              'PerformSolutionTransfer',
              () => {
                return HttpResponse.json({
                  errors: [
                    {
                      extensions: {
                        problems: ['This thing went wrong', 'This other thing went wrong']
                      }
                    }
                  ]
                });
              }
            )
          );
        });
        cy.findByRole('button', { name: /Submit/i }).click({ force: true });
      });
      it('shows the errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });
  });
});
