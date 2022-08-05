describe('Add External ID page', () => {
  before(() => {
    cy.visit('/lab/add_external_id');
    /* TODO: For further integration testing on this page:
            - Need a method of simulating setting a users clipboard
            - The currently available methods only work when the cypress window is in focus
            - e.g we stub the navigator class called from addExternalId
                onBeforeLoad(win) { win.navigator.clipboard.readText = () => { return Promise.resolve("Hello") }
        */
  });

  context('when form is submitted without filling in any fields', () => {
    before(() => {
      cy.findByRole('button', { name: 'Submit' }).click();
    });

    it('has the correct properties for the Submit button', () => {
      cy.findByRole('button', { name: 'Submit' }).should('be.visible');
      cy.findByRole('button', { name: 'Submit' }).should('not.be.disabled');
    });

    it('shows an error about labwares', () => {
      cy.findByText('A labware must be scanned in').should('be.visible');
    });

    it('shows an error about external name', () => {
      cy.findByText('External Identifier is a required field').should('be.visible');
    });
  });
});
