describe('Work Progress Summary', () => {
  before(() => {
    cy.visit('./work_progress_summary');
  });
  it('should display Spatial Genomics Platform Status', () => {
    cy.findByText('Spatial Genomics Platform Status').should('be.visible');
  });
  it('should display summary table', () => {
    cy.findByRole('table').should('be.visible');
  });
  it('it should display Work Type, status, number of work requests and total number of blocks, slides and original samples required columns', () => {
    cy.findByRole('table').get('th').should('have.length', 6);
    cy.findByRole('table').get('th').eq(0).should('have.text', 'Work Type');
    cy.findByRole('table').get('th').eq(1).should('have.text', 'Status');
    cy.findByRole('table').get('th').eq(2).should('have.text', 'Number of Work Requests');
    cy.findByRole('table').get('th').eq(3).should('have.text', 'Total Number of Blocks');
    cy.findByRole('table').get('th').eq(4).should('have.text', 'Total Number of Slides');
    cy.findByRole('table').get('th').eq(5).should('have.text', 'Total Number of Original Samples');
  });
});
