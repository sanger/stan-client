describe('Work Progress', () => {
  before(() => {
    cy.visit('./');
  });

  //URL TEST CASES
  describe('Testing URL params', () => {
    context('when url is given for searching WorkNumber', () => {
      before(() => {
        cy.visit('?workNumber=SGP1008');
      });
      it('shows a list of results', () => {
        cy.findByRole('table').contains('SGP/R&D Number');
      });
      it("will show the 'SGP/R&D Number' in  type dropdown ", () => {
        cy.findByTestId('select_workNumber').should('have.value', 'SGP1008');
      });
      it('enables Search button', () => {
        cy.findByRole('button', { name: /Search/i }).should('be.enabled');
      });
      it('shows a list of results', () => {
        cy.findByRole('table').contains('SGP/R&D Number');
      });
    });
    context('when url is given for searching WorkType', () => {
      context('when a valid url', () => {
        before(() => {
          cy.visit('/?workTypes[]=Work%20Type%201&workTypes[]=Work%20Type%202');
        });
        it('will display the given Work type dropdown', () => {
          cy.findAllByTestId('caption').should('have.length', 2);
          cy.findAllByTestId('caption').eq(0).should('have.text', 'Work Type 1');
          cy.findAllByTestId('caption').eq(1).should('have.text', 'Work Type 2');
        });
        it('shows a list of results', () => {
          cy.findByRole('table').should('exist');
        });
      });
    });
    context('when url is given for searching status', () => {
      context('when a valid url given ', () => {
        before(() => {
          cy.visit('?statuses[]=active&statuses[]=paused');
        });
        it('will display the given status in dropdown', () => {
          cy.findAllByTestId('caption').should('have.length', 2);
          cy.findAllByTestId('caption').eq(0).should('have.text', 'active');
          cy.findAllByTestId('caption').eq(1).should('have.text', 'paused');
        });
        it('shows a list of results', () => {
          cy.findByRole('table').should('exist');
        });
      });
    });
    context('when url is given for searching program', () => {
      context('when a valid url ', () => {
        before(() => {
          cy.visit('?programs[]=PROGRAM_999');
        });
        it('will display the given Work type in value dropdown', () => {
          cy.findAllByTestId('caption').should('have.length', 1);
          cy.findAllByTestId('caption').eq(0).should('have.text', 'PROGRAM_999');
        });
        it('shows a list of results', () => {
          cy.findByRole('table').should('exist');
        });
      });
    });
    context('when an invalid url given', () => {
      before(() => {
        cy.visit('?test[]=PROGRAM_999');
      });
      it('disables Search button', () => {
        cy.findByRole('button', { name: /Search/i }).should('be.disabled');
      });
    });
    context('When a url with multiple search params is provided', () => {
      before(() => {
        cy.visit('?statuses[]=active&statuses[]=paused&workNumber=SGP1008');
      });
      it('should select the given work number in ui ', () => {
        cy.findByTestId('select_workNumber').should('have.value', 'SGP1008');
      });
      it('should select all given statuses in ui ', () => {
        cy.findAllByTestId('caption').should('have.length', 2);
        cy.findAllByTestId('caption').eq(0).should('have.text', 'active');
        cy.findAllByTestId('caption').eq(1).should('have.text', 'paused');
      });
      it('shows a list of results', () => {
        cy.findByRole('table').should('exist');
      });
    });
  });

  // TEST CASES for Work progess results
  describe('Testing work progress table', () => {
    context('Table headers', () => {
      before(() => {
        cy.visit('?statuses[]=active&statuses[]=paused&workNumber=SGP1008');
      });
      it('has the correct table headers in the correct order', () => {
        cy.get('th').eq(0).contains('Priority');
        cy.get('th').eq(1).contains('SGP/R&D Number');
        cy.get('th').eq(2).contains('Status');
        cy.get('th').eq(3).contains('Status Comment');
        cy.get('th').eq(4).contains('Work Requester');
        cy.get('th').eq(5).contains('Work Type');
        cy.get('th').eq(6).contains('Project');
        cy.get('th').eq(7).contains('Program');
        cy.get('th').eq(8).contains('Most Recent Operation');
        cy.get('th').eq(9).contains('Last Sectioning Date');
        cy.get('th').eq(10).contains('Last Staining Date');
        cy.get('th').eq(11).contains('Last RNAscope/IHC Staining Date');
        cy.get('th').eq(12).contains('Last Imaging Date');
        cy.get('th').eq(13).contains('Last RNA Extraction Date');
        cy.get('th').eq(14).contains('Last RNA Analysis Date');
        cy.get('th').eq(15).contains('Last Visium ADH Stain Date');
        cy.get('th').eq(16).contains('Last Visium TO Staining Date');
        cy.get('th').eq(17).contains('Last Visium LP Staining Date');
        cy.get('th').eq(18).contains('Last cDNA Transfer Date');
        cy.get('th').eq(19).contains('Last Date 96 Well Plate Released');
      });
    });
  });

  // TESTCASES for  Work Number Search action
  describe('Testcases for  Work Number based search action', () => {
    before(() => {
      cy.visit('');
    });
    context('no value is entered', () => {
      it('shows a disabled search button ', () => {
        cy.findByRole('button', { name: /Search/i }).should('be.disabled');
      });
    });
    context('when a worknumber is given', () => {
      before(() => {
        cy.findByTestId('select_workNumber').select('SGP1008');
      });
      it('enables search button ', () => {
        cy.findByRole('button', { name: /Search/i }).should('be.enabled');
      });
      context('when search button is clicked', () => {
        before(() => {
          cy.findByRole('button', { name: /Search/i }).click();
        });
        it('shows a list of results', () => {
          cy.findByRole('table').should('exist');
        });
      });
    });
  });

  //TESTCASES for WorkType based filter
  describe('Testcases for WorkType based search', () => {
    context('when a workType is given which has no results', () => {
      before(() => {
        cy.visit('');
        cy.findByTestId('select_workType').select(['Work Type 2']);
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a notification', () => {
        cy.findByText('There were no results for the given search. Please try again.').should('be.visible');
      });
    });
    context('when a workType is given which has results', () => {
      before(() => {
        cy.findByTestId('select_workType').select(['Work Type 1']);
        cy.findByRole('button', { name: /Search/i }).click();
      });

      it('will show table with result', () => {
        cy.findByRole('table').contains('Work Type 1');
      });
    });
  });

  //TESTCASES for Status based filter
  describe('Testing Status based search', () => {
    context('when a status is given with no results', () => {
      before(() => {
        cy.visit('');
        cy.findByTestId('select_status').select('failed');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a notification', () => {
        cy.findByText('There were no results for the given search. Please try again.').should('be.visible');
      });
      context('when a status is given which has results', () => {
        before(() => {
          cy.findByTestId('select_status').select('active');
          cy.findByTestId('select_status').select('completed');
          cy.findByRole('button', { name: /Search/i }).click();
        });
        it('will show a table with results', () => {
          cy.findByRole('table').contains('active');
        });
      });
    });
    context('when a paused value is given for status', () => {
      before(() => {
        cy.findByTestId('select_status').select('paused');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a table with results', () => {
        cy.findByRole('table').contains('paused');
        cy.findByRole('table').contains('This work is paused');
      });
    });
  });

  //Testing WorkNumber link
  describe('Testing WorkNumber link', () => {
    context('when a search is performed using work number', () => {
      before(() => {
        cy.visit('');
        cy.findByTestId('select_workNumber').select('SGP1008');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('shows a link for work type in the results table', () => {
        cy.findByRole('table').within(() => {
          cy.findAllByRole('link', { name: 'SGP1008' }).should('have.length.above', 1);
        });
      });
    });
    context('when clicking WorkNumber link', () => {
      before(() => {
        cy.findAllByRole('link', { name: 'SGP1008' }).eq(0).click();
      });
      it('displays the history page for SGP1008', () => {
        cy.url().should('include', '/history/?kind=workNumber&value=SGP1008');
        cy.findAllByText('History').should('have.length.above', 1);
      });
    });
  });

  //URL Test cases

  describe('Summary dashboard', () => {
    before(() => {
      cy.visit('./');
    });
    it('shows a Spatial Genomics Platform Status link', () => {
      cy.findByText('Spatial Genomics Platform Status').should('be.visible');
    });
    context('when Spatial Genomics Platform Status link is clicked', () => {
      before(() => {
        cy.contains('Spatial Genomics Platform Status').click();
      });
      it('goes to summary page', () => {
        cy.url().should('be.equal', 'http://localhost:3000/work_progress_summary');
      });
    });
  });
});
