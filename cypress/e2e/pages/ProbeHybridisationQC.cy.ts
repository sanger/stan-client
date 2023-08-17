import { selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';

describe('Probe Hybridisation QC', () => {
  before(() => {
    cy.visit('/lab/probe_hybridisation_qc');
  });
  describe('On load', () => {
    it('displays the correct title', () => {
      cy.get('h1').should('have.text', 'Probe Hybridisation QC');
    });
    it('displays the SGP number select box', () => {
      cy.findByText('SGP Number').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByTestId('input').should('be.visible');
    });
    it('save button should be hidden', () => {
      cy.findByText('Save').should('not.exist');
    });
  });
  describe('When a labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('shows the labware image', () => {
      cy.findByTestId('labware').should('be.visible');
    });
    it('shows the completion Date time select bok', () => {
      cy.findByLabelText('Completion Time').should('be.visible');
    });
    it('shows the global comments select box', () => {
      cy.findByTestId('globalComment').should('be.visible');
    });
    it('shows the save button', () => {
      cy.findByText('Save').should('be.visible');
    });
    describe('When a selecting a comment from the global comment select box', () => {
      before(() => {
        cy.get('#labwareScanInput').type('STAN-3111{enter}');
        selectOption('globalComment', 'Poor section quality');
      });
      it('populates table rows comment column automatically with the selected value(s)', () => {
        cy.get('tbody tr').eq(0).find('td').eq(6).should('have.text', 'This Section is the best');
      });
      it('completion time select box is set to the current date', () => {
        const currentDate = new Date().toLocaleString('en-GB', { hour12: false }).split(' ')[0];
        cy.get('[data-testid="my-input"]')
          .invoke('val')
          .then((value) => {
            expect(value).to.contain(currentDate); // Convert the result to a string and use expect assertion
          });
      });
    });
  });
  describe('Validation', () => {
    it('requires SGP number', () => {
      cy.findByText('Save').click();
      cy.findByText('SGP number is required').should('be.visible');
    });
  });
});
