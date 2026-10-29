describe('Atera Run', () => {
  describe('On load', () => {
    before(() => {
      cy.visit('/lab/atera_run');
    });
    it('displays the correct title', () => {
      cy.get('h1').should('have.text', 'Atera Run');
    });
  });
});
