describe('FileManager', () => {
  before(() => {
    cy.visit('/file_manager');
  });
  context('on Load', () => {
    cy.findByLabelText('SGP Number').should('be.visible');
    cy.findByLabelText('Upload file').should('be.visible');
    cy.findByRole('button', { name: /Upload/i }).should('be.disabled');
    cy.findByText('Files').should('be.visible');
  });

  context('on selecting SGP Number', () => {
    before(() => {
      cy.findByTestId('workNumber').select('SGP8');
    });
    it('should display a table with files uploaded for the selected SGP Number', () => {
      // cy.
    });
  });
});
