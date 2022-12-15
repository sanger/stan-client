describe('Work Progress Summary', () => {
  it('should display Spatial Genomics Platform Status', () => {
    cy.visit('./work_progress_summary');
    cy.findByText('Spatial Genomics Platform Status').should('be.visible');
  });

  describe('Work progress input', () => {
    context('when the type field is selected', () => {
      before(() => {
        cy.visit('./work_progress_summary');
      });
      context('when Status is selected in dropdown for type', () => {
        it('shows a drop down box with the correct values', () => {
          cy.findByTestId('type').select('Status');
          cy.get('[data-testid = valueSelect]')
            .children('option')
            .then(($options) => {
              const optionValues = $options.toArray().map((elem) => elem.label);
              expect(optionValues).to.deep.eq(['active', 'paused', 'unstarted', 'completed', 'failed', 'withdrawn']);
            });
        });
      });
      context('when WorkType is selected in dropdown for type', () => {
        it('shows a drop down box with value', () => {
          cy.findByTestId('type').select('Work Type');
          cy.get('[data-testid = valueSelect]')
            .children('option')
            .then(($options) => {
              const optionValues = $options.toArray().map((elem) => elem.label);
              expect(optionValues).to.deep.eq([
                'TEST_WT_1',
                'Work Type 1',
                'Work Type 2',
                'Work Type 3',
                'Work Type 5'
              ]);
            });
        });
      });
      context('clear filter', () => {
        it('is disabled when there are no url params', () => {
          cy.findByRole('button', { name: /Clear filter/i }).should('be.disabled');
        });
        it('is enabled when there are url params', () => {
          cy.visit('./work_progress_summary?searchType=Work%20Type&searchValues[]=Work%20Type%201');
          cy.findByRole('button', { name: /Clear filter/i }).should('be.enabled');
        });
        it('it clears the url params and resets the table when clicked', () => {
          cy.visit('./work_progress_summary?searchType=Work%20Type&searchValues[]=Work%20Type%201');
          cy.findByRole('button', { name: /Clear filter/i }).click();
          // Check url has removed params
          cy.url().should('equal', 'http://localhost:3000/work_progress_summary');
          // Check table has data (bit crude but difficult to check fully)
          cy.findByRole('table').contains('unstarted');
          cy.findByRole('table').contains('active');
        });
      });
    });
  });

  describe('Work progress summary table', () => {
    before(() => {
      cy.visit('./work_progress_summary');
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

    context('Filtered table', () => {
      it('correctly applies the filters on the table data', () => {
        cy.visit('./work_progress_summary');
        cy.findByTestId('type').select('Status');
        cy.get('[data-testid = valueSelect]').select('active');
        cy.findByRole('button', { name: /Search/i }).click();
        cy.findByRole('table').contains('active');
      });

      it('correctly applies the filters on the table data when given through a url param', () => {
        cy.visit('./work_progress_summary?searchType=Work%20Type&searchValues[]=Work%20Type%201');
        cy.findByRole('table').contains('Work Type 1');
        // Check there are no other work types
        cy.findByRole('table').get('Work Type 2').should('not.exist');
      });

      it('shows a notification when no results match the filter', () => {
        // Giving a work type that doesnt exist (Work Type 20)
        cy.visit('./work_progress_summary?searchType=Status&searchValues[]=failed');
        cy.findByText('There were no results for the given search. Please try again.').should('be.visible');
      });
    });
  });
});
