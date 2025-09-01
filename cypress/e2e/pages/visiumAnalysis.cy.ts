describe('Visium Analysis', () => {
  before(() => {
    cy.visit('/lab/visium_analysis');
  });

  it('should have a title of Visium Analysis', () => {
    cy.get('h1').should('have.text', 'Visium Analysis');
  });

  context('when a scanned in plate has a previously selected perm time', () => {
    before(() => {
      cy.get("input[type='text']").eq(1).type('STAN-2411{enter}');
    });

    it('should already be selected', () => {
      cy.get("input[type='radio']:first").should('be.checked');
    });
  });

  context('when the perm time is changed', () => {
    before(() => {
      cy.get("input[type='radio']:last").check();
    });

    it('shows a warning', () => {
      cy.findByText('The selected perm time is being changed for this slide').should('be.visible');
    });
  });

  context('when there is no work number selected', () => {
    it('shows a warning', () => {
      cy.findByRole('button', { name: /Submit/i }).click();
      cy.findByText('SGP number is a required field').should('be.visible');
    });
  });
});
