describe('Work Progress', () => {
  before(() => {
    cy.visit('./work_progress_summary');
  });
  it('should display Work Progress Summary', () => {
    cy.findByText('Work Progress Summary').should('be.visible');
  });
  it('should display summary table', () => {
    cy.findByRole('table').should('be.visible');
  });
  it('it should display Work Type,status, number of work requests and total labware required columns', () => {
    cy.findByRole('table').get('th').should('have.length', 4);
    cy.findByRole('table').get('th').eq(0).should('have.text', 'Work Type');
    cy.findByRole('table').get('th').eq(1).should('have.text', 'Status');
    cy.findByRole('table').get('th').eq(2).should('have.text', 'Number of Work Requests');
    cy.findByRole('table').get('th').eq(3).should('have.text', 'Total Labware Required');
  });
});
