import { act } from '@testing-library/react';

describe('Flag Labware', () => {
  beforeEach(() => {
    cy.visit('/admin/flagLabware');
  });
  describe('when a labware is scanned', () => {
    beforeEach(() => {
      cy.get('#labwareScanInput').type('STAN-123{enter}');
    });
    it('renders the labware details table', () => {
      cy.findByRole('table').should('be.visible');
    });
    it('renders the description text area', () => {
      cy.findByTestId('description').should('be.visible');
    });
    it('updates the summary section', () => {
      cy.findByText('No labwares scanned.').should('not.exist');
    });
    it('enables submit button', () => {
      cy.findByRole('button', { name: 'Flag Labware' }).should('be.enabled');
    });
  });
  describe('when a previously flagged labware is scanned', () => {
    it('displays related flags table', () => {
      act(() => {
        cy.get('#labwareScanInput').type('STAN-1200{enter}');
      });
      cy.findByText('Related Flags').should('be.visible');
    });
  });

  describe('when the user does not enter a valid description for flagging a labware', () => {
    it('displays an error message', () => {
      act(() => {
        cy.get('#labwareScanInput').type('STAN-1200{enter}');
        cy.findByRole('button', { name: 'Flag Labware' }).click();
      });
      cy.findByText('Description is required').should('be.visible');
    });
  });
});
