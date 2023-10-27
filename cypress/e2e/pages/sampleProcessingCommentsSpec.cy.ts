import {
  RecordSampleProcessingCommentsMutation,
  RecordSampleProcessingCommentsMutationVariables
} from '../../../src/types/sdk';
import { labwareTypeInstances } from '../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { selectOption } from '../shared/customReactSelect.cy';

describe('Sample processing comments', () => {
  before(() => {
    cy.visit('/lab/sample_processing_comments');
  });

  describe('Validation', () => {
    context('when the form with nothing filled in', () => {
      before(() => {
        cy.findByRole('button', { name: 'Submit' }).click();
      });

      it('shows a validation error for labware', () => {
        cy.findByText('At least one labware must be scanned').should('be.visible');
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
    context('when Submit clicked for scanned labware with no comment selected', () => {
      before(() => {
        cy.findByRole('button', { name: 'Submit' }).click();
      });
      it('shows a validation error for the Comment', () => {
        cy.findByText('Comment is a required field').should('be.visible');
      });
    });
  });

  describe('when comment is selected to apply to all', () => {
    before(() => {
      selectOption('applyAllComment', 'Issue while fixing');
    });
    it('all comment dropdowns in table must select the selected comment', () => {
      cy.findByRole('table').contains('td', 'Issue while fixing');
    });
  });

  describe('API Requests', () => {
    context('when request is successful', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordSampleProcessingCommentsMutation, RecordSampleProcessingCommentsMutationVariables>(
              'RecordSampleProcessingComments',
              (req, res, ctx) => {
                const labwareType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.POT);
                const labware = req.variables.request.labware.map((lw) =>
                  labwareFactory.build({ labwareType, barcode: lw.barcode })
                );
                return res(
                  ctx.data({
                    recordSampleProcessingComments: {
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
        cy.visit('/lab/sample_processing_comments');
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectOption('applyAllComment', 'Issue while fixing');
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordSampleProcessingCommentsMutation, RecordSampleProcessingCommentsMutationVariables>(
              'RecordSampleProcessingComments',
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
});
