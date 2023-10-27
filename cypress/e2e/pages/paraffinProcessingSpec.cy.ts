import { PerformParaffinProcessingMutation, PerformParaffinProcessingMutationVariables } from '../../../src/types/sdk';
import { labwareTypeInstances } from '../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';
import { selectOption, selectSGPNumber, shouldOptionsHaveLengthAbove } from '../shared/customReactSelect.cy';

describe('Paraffin Processing', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/paraffin_processing');

  describe('Validation', () => {
    context('when all form fields are empty', () => {
      before(() => {
        cy.findByRole('button', { name: 'Submit' }).click();
      });

      it('shows a validation error for labware', () => {
        cy.findByText('Labware field must have at least 1 item').should('be.visible');
      });

      it('shows a validation error for the work number', () => {
        cy.findByText('SGP Number is a required field').should('be.visible');
      });
      it('shows a validation error for the program type', () => {
        cy.findByText('Program Type is a required field').should('be.visible');
      });
      it('should display comments', () => {
        shouldOptionsHaveLengthAbove('commentId', 1);
      });
    });
  });

  describe('API Requests', () => {
    context('when request is successful', () => {
      before(() => {
        fillForm();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PerformParaffinProcessingMutation, PerformParaffinProcessingMutationVariables>(
              'PerformParaffinProcessing',
              (req, res, ctx) => {
                const labwareType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.POT);
                const labware = req.variables.request.barcodes.map((barcode) =>
                  labwareFactory.build({ labwareType, barcode })
                );
                return res(
                  ctx.data({
                    performParaffinProcessing: {
                      labware,
                      operations: []
                    }
                  })
                );
              }
            )
          );
        });
        cy.findByRole('button', { name: /Submit/i }).click();
      });
      it('displays Operation complete message', () => {
        cy.findByText('Operation Complete').should('be.visible');
      });
    });

    context('when request is unsuccessful', () => {
      before(() => {
        cy.visit('/lab/paraffin_processing');
        fillForm();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<PerformParaffinProcessingMutation, PerformParaffinProcessingMutationVariables>(
              'PerformParaffinProcessing',
              (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      extensions: {
                        problems: ['This thing went wrong', 'This other thing went wrong']
                      }
                    }
                  ])
                );
              }
            )
          );
        });
        cy.findByRole('button', { name: /Submit/i }).click();
      });
      it('shows the errors', () => {
        cy.findByText('This thing went wrong').should('be.visible');
        cy.findByText('This other thing went wrong').should('be.visible');
      });
    });
  });
  function fillForm() {
    cy.get('#labwareScanInput').wait(1000).type('STAN-3111{enter}');
    selectSGPNumber('SGP1008');
    selectOption('commentId', 'Soft tissue');
  }
});
