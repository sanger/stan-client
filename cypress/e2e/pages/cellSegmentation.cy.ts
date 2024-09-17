import { HttpResponse } from 'msw';
import { SegmentationMutation, SegmentationMutationVariables } from '../../../src/types/sdk';
import { selectOption } from '../shared/customReactSelect.cy';

describe('Cell Segmentation Page', () => {
  context('Apply to all', () => {
    beforeEach(() => {
      cy.visitAsAdmin('/lab/cell_segmentation');
      cy.get('#labwareScanInput').type('STAN-1111{enter}');
    });
    describe('When work number for all is updated', () => {
      beforeEach(() => {
        selectOption('workNumberAll', 'SGP1008');
      });
      it('should update all work numbers', () => {
        cy.findByTestId('cellSegmentation.0.workNumber').should('have.text', 'SGP1008');
      });
    });
    describe('When comment for all is updated', () => {
      beforeEach(() => {
        selectOption('commentsAll', 'Looks good');
      });
      it('should update all the comment fields', () => {
        cy.findByTestId('cellSegmentation.0.comments').should('have.text', 'Looks good');
      });
    });
    describe('When cost for all is updated', () => {
      beforeEach(() => {
        selectOption('costingAll', 'Faculty');
      });
      it('should update all the cost fields', () => {
        cy.findByTestId('cellSegmentation.0.costing').should('have.text', 'Faculty');
      });
    });
    describe('When performed for all is updated', () => {
      beforeEach(() => {
        cy.findByTestId('performedAll').clear().type('2020-01-01T10:00').blur();
      });
      it('should update all performed fields', () => {
        cy.findByTestId('cellSegmentation.0.performed').should('have.value', '2020-01-01T10:00');
      });
    });
  });
  context('Validation', () => {
    beforeEach(() => {
      cy.visitAsAdmin('/lab/cell_segmentation');
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
        selectOption('cellSegmentation.0.costing', 'SGP');
      });
      it('displays error message and disables save button', () => {
        cy.findByText('SGP number is required').should('be.visible');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
    });
    describe('when costing is missing', () => {
      beforeEach(() => {
        selectOption('cellSegmentation.0.costing', '');
        selectOption('cellSegmentation.0.comments', 'Looks good');
      });
      it('displays error message and disables save button', () => {
        cy.findByText('Costing is required').should('be.visible');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
    });
    describe('when performed is missing', () => {
      beforeEach(() => {
        cy.findByTestId('cellSegmentation.0.performed').clear();
        selectOption('cellSegmentation.0.costing', 'SGP');
      });
      it('displays error message and disables save button', () => {
        cy.findByText('Performed time is required').should('be.visible');
      });
    });
    describe('when reagent lot is incorrectly specified', () => {
      beforeEach(() => {
        cy.findByTestId('cellSegmentation.0.reagentLot').clear().type('1234567').blur();
      });
      it('validates the reagent lot', () => {
        cy.findByText('Reagent Lot should be a 6-digit number').should('be.visible');
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

const fillInRequest = () => {
  selectOption('cellSegmentation.0.workNumber', 'SGP1008');
  selectOption('cellSegmentation.0.costing', 'SGP');
};

const submitRequest = () => {
  cy.get('#labwareScanInput').type('STAN-1111{enter}');
  fillInRequest();
  cy.findByRole('button', { name: 'Save' }).click();
};
