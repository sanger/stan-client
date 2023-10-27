import { selectOption } from '../shared/customReactSelect.cy';

describe('Original Sample Processing', () => {
  before(() => {
    cy.visit('/lab/original_sample_processing');
  });

  context('when there is no type selected', () => {
    it('displays text to start choosing processing type ', () => {
      cy.findByText('Choose a processing type to get started:').should('be.visible');
    });
  });

  context('when Block is selected', () => {
    before(() => {
      selectOption('processing-type', 'Block');
    });

    it('should display Block Processing page ', () => {
      cy.url().should('include', '/lab/original_sample_processing?type=block');
    });
  });
  context('when Pot is selected', () => {
    before(() => {
      cy.visit('/lab/original_sample_processing');
      selectOption('processing-type', 'Pot');
    });

    it('should display Pot Processing page ', () => {
      cy.url().should('include', '/lab/original_sample_processing?type=pot');
    });
  });
});
