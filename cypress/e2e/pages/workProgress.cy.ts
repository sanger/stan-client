import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';

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
        cy.contains('SGP1008').should('be.visible');
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
          cy.contains('Work Type 1').should('be.visible');
          cy.contains('Work Type 2').should('be.visible');
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
          cy.contains('active').should('be.visible');
          cy.contains('paused').should('be.visible');
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
          cy.contains('PROGRAM_999').should('be.visible');
        });
        it('shows a list of results', () => {
          cy.findByRole('table').should('exist');
        });
      });
    });
    context('when url is given for searching work requester', () => {
      context('when a valid url ', () => {
        before(() => {
          cy.visit('?requesters[]=aw24');
        });
        it('will display the given Work type in value dropdown', () => {
          cy.contains('aw24').should('be.visible');
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
        cy.contains('SGP1008').should('be.visible');
      });
      it('should select all given statuses in ui ', () => {
        cy.contains('active').should('be.visible');
        cy.contains('paused').should('be.visible');
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
        [
          'Priority',
          'SGP/R&D Number',
          'Status',
          'Status Comment',
          'Work Requester',
          'Work Type',
          'Project',
          'Omero Project',
          'Program',
          'Most Recent Operation',
          'Last Sectioning Date',
          'Last Staining Date',
          'Last RNAscope/IHC Staining Date',
          'Last Imaging Date',
          'Last RNA Extraction Date',
          'Last RNA Analysis Date',
          'Last Visium ADH Stain Date',
          'Last Visium TO Staining Date',
          'Last Visium LP Staining Date',
          'Last cDNA Transfer Date',
          'Last Date 96 Well Plate Released'
        ].forEach((columName, index) => {
          cy.get('th').eq(index).contains(columName);
        });
      });
    });
  });

  // TESTCASES for  Work Number Search action
  describe('Testcases for  Work Number based search action', () => {
    before(() => {
      cy.visit('/');
    });
    context('no value is entered', () => {
      it('shows a disabled search button ', () => {
        cy.findByRole('button', { name: /Search/i }).should('be.disabled');
      });
    });
    context('when a worknumber is given', () => {
      before(() => {
        selectSGPNumber('SGP1008');
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
        selectOption('select_workType', 'Work Type 2');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a notification', () => {
        cy.findByText('There were no results for the given search. Please try again.').should('be.visible');
      });
    });
    context('when a workType is given which has results', () => {
      before(() => {
        selectOption('select_workType', 'Work Type 1');
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
        selectOption('select_status', 'failed');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a notification', () => {
        cy.findByText('There were no results for the given search. Please try again.').should('be.visible');
      });
      context('when a status is given which has results', () => {
        before(() => {
          selectOption('select_status', 'active');
          selectOption('select_status', 'completed');
          cy.findByRole('button', { name: /Search/i }).click();
        });
        it('will show a table with results', () => {
          cy.findByRole('table').contains('active');
        });
      });
    });
    context('when a paused value is given for status', () => {
      before(() => {
        selectOption('select_status', 'paused');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a table with results', () => {
        cy.findByRole('table').contains('paused');
        cy.findByRole('table').contains('This work is paused');
      });
    });
  });

  //TESTCASES for Work requester based filter
  describe('Testcases for Work requester based search', () => {
    context('when a requester is given which has no results', () => {
      before(() => {
        cy.visit('');
        selectOption('select_workRequester', 're5');
        cy.findByRole('button', { name: /Search/i }).click();
      });
      it('will show a notification', () => {
        cy.findByText('There were no results for the given search. Please try again.').should('be.visible');
      });
    });
    context('when a requester is given which has results', () => {
      before(() => {
        selectOption('select_workRequester', 'aw24');
        cy.findByRole('button', { name: /Search/i }).click();
      });

      it('will show table with result', () => {
        cy.findByRole('table').contains('aw24');
      });
    });
  });

  //Testing WorkNumber link
  describe('Testing WorkNumber link', () => {
    context('when a search is performed using work number', () => {
      before(() => {
        cy.visit('/');
        selectOption('workNumber', 'SGP1008');
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
        cy.url().should('include', '/history/?workNumber=SGP1008');
        cy.findAllByText('History').should('have.length.above', 1);
        cy.findByTestId('history').should('exist');
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

  describe('Allocate SGP Number', () => {
    context('When user is not not logged in', () => {
      before(() => {
        cy.visitAsGuest('./');
      });
      it('shows Allocate SGP Number link', () => {
        cy.findByText('Allocate SGP Number').should('be.visible');
      });
      context('when Allocate SGP Number link is clicked', () => {
        before(() => {
          cy.contains('Allocate SGP Number').click();
        });
        it('goes to Login page', () => {
          cy.url().should('be.equal', 'http://localhost:3000/login');
        });
      });
      context('On succesful login, it redirects to SGP page', () => {
        before(() => {
          cy.get("input[name='username']").type('jb1');
          cy.get("input[name='password']").type('supersecret');
          cy.get("button[type='submit']").click();
        });
        it('goes to Login page', () => {
          cy.url().should('be.equal', 'http://localhost:3000/sgp');
        });
      });
    });
    context('When user is logged in as end user', () => {
      before(() => {
        cy.visitAsEndUser('./');
      });
      it('shows Allocate SGP Number link', () => {
        cy.findByText('Allocate SGP Number').should('be.visible');
      });
      context('when Allocate SGP Number link is clicked', () => {
        before(() => {
          cy.contains('Allocate SGP Number').click();
        });
        it('goes to SGP page', () => {
          cy.url().should('be.equal', 'http://localhost:3000/sgp');
        });
      });
    });
  });
});
