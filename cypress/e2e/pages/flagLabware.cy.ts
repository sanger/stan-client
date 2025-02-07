import { act } from '@testing-library/react';
import { selectOption } from '../shared/customReactSelect.cy';

describe('Flag Labware', () => {
  describe('when all fields are been correctly populated', () => {
    before(() => {
      cy.visit('/admin/flagLabware');
      selectOption('priority', 'Note');
      cy.findByTestId('description').type('Flagging multiple labware');
    });
    it('supports flagging multiple labware at the same time', () => {
      cy.get('#labwareScanInput').type('STAN-123{enter}');
      cy.get('#labwareScanInput').type('STAN-321{enter}');
    });
    it('renders the labware details tables', () => {
      cy.findAllByRole('table').should('have.length', 2);
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
});
