import { HttpResponse } from 'msw';
import { SegmentationMutation, SegmentationMutationVariables } from '../../../src/types/sdk';
import { selectOption } from '../shared/customReactSelect.cy';

describe('Cell Segmentation Page', () => {
  context('Submission', () => {
    context('when submission succeed', () => {
      beforeEach(() => {
        cy.visitAsAdmin('/lab/cell_segmentation');
        submitRequest();
      });
      it('should display success message', () => {
        cy.findByText('Cell Segmentation recorded on all labware').should('be.visible');
      });
    });
    context('when submission failed', () => {
      beforeEach(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<SegmentationMutation, SegmentationMutationVariables>('Segmentation', () => {
              return HttpResponse.json({
                errors: [{ message: 'Failed to record Cell Segmentation results' }]
              });
            })
          );
        });
        cy.visitAsAdmin('/lab/cell_segmentation');
        submitRequest();
      });
      it('should display server error message', () => {
        cy.findByText('Failed to record Cell Segmentation results').should('be.visible');
      });
    });
  });
});

const submitRequest = () => {
  cy.get('#labwareScanInput').type('STAN-1111{enter}');
  selectOption('cellSegmentation.0.workNumber', 'SGP1008');
  selectOption('cellSegmentation.0.costing', 'SGP');
  selectOption('cellSegmentation.0.comments', 'Looks good');
  cy.findByRole('button', { name: 'Save' }).click();
};
