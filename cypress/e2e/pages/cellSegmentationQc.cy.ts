import { HttpResponse } from 'msw';
import { SegmentationMutation, SegmentationMutationVariables } from '../../../src/types/sdk';
import { selectOption } from '../shared/customReactSelect.cy';

describe('Cell Segmentation Page', () => {
  context('Validation', () => {
    beforeEach(() => {
      cy.visitAsAdmin('/lab/cell_segmentation_qc');
      cy.get('#labwareScanInput').type('STAN-1111{enter}');
    });
    describe('when no values are entered', () => {
      it('disables the save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
    });
    describe('when work number is missing', () => {
      beforeEach(() => {
        selectOption('cellSegmentation.0.workNumber', '');
        selectOption('cellSegmentation.0.comments', 'Looks good');
      });
      it('displays error message and disables save button', () => {
        cy.findByText('SGP number is required').should('be.visible');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
    });
    describe('when performed is missing', () => {
      beforeEach(() => {
        cy.findByTestId('cellSegmentation.0.performed').clear();
        selectOption('cellSegmentation.0.workNumber', 'SGP1008');
      });
      it('displays error message and disables save button', () => {
        cy.findByText('Performed time is required').should('be.visible');
      });
    });
    describe('when no comment is selected', () => {
      beforeEach(() => {
        selectOption('cellSegmentation.0.comments', '');
        selectOption('cellSegmentation.0.workNumber', 'SGP1008');
      });
      it('displays error message and disables save button', () => {
        cy.findByText('Comment is required').should('be.visible');
      });
    });
    describe('when all values are entered', () => {
      beforeEach(() => {
        fillInRequest();
      });
      it('enables the save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
    });
  });
  context('Submission', () => {
    context('when submission succeed', () => {
      beforeEach(() => {
        cy.visitAsAdmin('/lab/cell_segmentation_qc');
        submitRequest();
      });
      it('should display success message', () => {
        cy.findByText('Cell Segmentation QC recorded on all labware').should('be.visible');
      });
    });
    context('when submission failed', () => {
      beforeEach(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<SegmentationMutation, SegmentationMutationVariables>('Segmentation', () => {
              return HttpResponse.json({
                errors: [{ message: 'Failed to record Cell Segmentation QC results' }]
              });
            })
          );
        });
        cy.visitAsAdmin('/lab/cell_segmentation_qc');
        submitRequest();
      });
      it('should display server error message', () => {
        cy.findByText('Failed to record Cell Segmentation QC results').should('be.visible');
      });
    });
  });
});

const fillInRequest = () => {
  selectOption('cellSegmentation.0.workNumber', 'SGP1008');
  selectOption('cellSegmentation.0.comments', 'Looks good');
};

const submitRequest = () => {
  cy.get('#labwareScanInput').type('STAN-1111{enter}');
  fillInRequest();
  cy.findByRole('button', { name: 'Save' }).click();
};
