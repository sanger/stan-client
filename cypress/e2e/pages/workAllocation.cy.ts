import { CreateWorkMutation, CreateWorkMutationVariables } from '../../../src/types/sdk';
import {
  removeSelections,
  selectOption,
  selectOptionForMultiple,
  shouldDisplaySelectedValue,
  shouldHaveOption
} from '../shared/customReactSelect.cy';
import { HttpResponse } from 'msw';

describe('Work Allocation', () => {
  before(() => {
    cy.visitAsAdmin('/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused');
  });
  describe('Allocating Work', () => {
    context(
      'when I submit the form without selecting a work type, work requester, project, cost code or num blocks/slides/originalsamples',
      () => {
        before(() => {
          cy.findByRole('button', { name: /Submit/i })
            .scrollIntoView()
            .click();
        });

        it('says the work type is required', () => {
          cy.findByText('Work Type is a required field').should('exist');
        });

        it('says the work type is required', () => {
          cy.findByText('Work Requester is a required field').should('exist');
        });

        it('says project is required', () => {
          cy.findByText('Project (cost code description) is a required field').should('exist');
        });
        it('says program is required', () => {
          cy.findByText('Program is a required field').should('exist');
        });

        it('says cost code is required', () => {
          cy.findByText('Cost Code is a required field').should('exist');
        });

        it('says number of blocks, slides or original samples are required', () => {
          cy.findByText('Number of blocks, slides or original samples required').should('exist');
        });
      }
    );

    context(
      'when I select a work type, project, cost code, number of blocks/slides/originalsamples and then submit the form',
      () => {
        before(() => {
          cy.visitAsAdmin('/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused');
          fillInTheForm();
        });

        it('allocates new Work', () => {
          cy.findByRole('button', { name: /Submit/i }).click();
          cy.findByText(
            /Assigned SGP\d+ \(TEST_WT_1 - 5 blocks and 15 slides and 1 original samples\) to project \(cost code description\) TEST999, Omero project OMERO_TEST999, DNAP study name 'S10315 - Orphan Tumour Study_NB_sNuc' and program PROGRAM_999 using cost code S999 with the work requester et2/
          ).should('exist');
        });

        describe('when the create work fails on the server side', () => {
          before(() => {
            cy.msw().then(({ graphql, worker }) => {
              worker.use(
                graphql.mutation<CreateWorkMutation, CreateWorkMutationVariables>('CreateWork', () => {
                  return HttpResponse.json({
                    errors: [
                      {
                        message: 'Exception while fetching data (/createWork) : An error occurred'
                      }
                    ]
                  });
                })
              );
            });
            cy.visitAsAdmin(
              '/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused'
            );
            fillInTheForm();
          });
          it('shows an error message', () => {
            cy.findByRole('button', { name: /Submit/i }).click();
            cy.findByText('SGP Request Error').should('exist');
            cy.findByText('An error occurred').should('exist');
          });
        });
      }
    );

    context('blocks, slide, original samples validation', () => {
      before(() => {
        cy.visitAsAdmin('/sgp');
      });

      it('should not show an error message if Number of Blocks has a value', () => {
        cy.get("input[name='numBlocks']").type('1');
        cy.findByRole('button', { name: /Submit/i })
          .should('be.visible')
          .click();
        cy.findByText('Number of blocks, slides or original samples required').should('not.exist');
      });

      it('should not show an error message if Number of slides has a value', () => {
        cy.get("input[name='numSlides']").type('1');
        cy.findByRole('button', { name: /Submit/i })
          .should('be.visible')
          .click();
        cy.findByText('Number of blocks, slides or original samples required').should('not.exist');
      });

      it('should not show an error message if Number of original samples has a value', () => {
        cy.get("input[name='numOriginalSamples']").type('1');
        cy.findByRole('button', { name: /Submit/i })
          .should('be.visible')
          .click();
        cy.findByText('Number of blocks, slides or original samples required').should('not.exist');
      });
    });
  });

  describe('Editing the number of blocks, slides and original samples column for Work ', () => {
    context(
      "Entering a value in 'Number of blocks', 'Number of slides' and 'Number of original samples' cells in table",
      () => {
        before(() => {
          cy.findByTestId('SGP1008-block').type('1');
          cy.findByTestId('SGP1008-slide').type('2');
          cy.findByTestId('SGP1008-originalSamples').type('3').blur();
        });

        it('updates the number of blocks', () => {
          cy.findByTestId('SGP1008-block').should('have.value', 1);
        });

        it('updates the number of slides', () => {
          cy.findByTestId('SGP1008-slide').should('have.value', 2);
        });

        it('updates the number of original samples', () => {
          cy.findByTestId('SGP1008-originalSamples').should('have.value', 3);
        });
      }
    );
  });
  describe('Editing the priority column for Work ', () => {
    context("Entering a value in 'Priority' cell in table", () => {
      before(() => {
        cy.visit('/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused');
        cy.findByTestId('SGP1008-priority').clear().type('A12').blur();
      });
      it('updates priority', () => {
        cy.findByTestId('SGP1008-priority').scrollIntoView().should('have.value', 'A12');
      });
    });

    context("Entering an invalid value in 'Priority' cell in table", () => {
      before(() => {
        cy.findByTestId('SGP1008-priority').clear().type('15').blur();
      });

      it('displays a validation error message', () => {
        cy.findByText('Invalid format').scrollIntoView().should('be.visible');
      });
    });
  });

  describe('Editing the status of Work', () => {
    context('when I click the Edit Status button', () => {
      before(() => {
        cy.visit('/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused');
        cy.findAllByRole('button', { name: /Edit Status/i }).then((editButtons) => {
          editButtons[0].click();
        });
      });

      it('shows a form to edit the status', () => {
        cy.findByLabelText('New Status').scrollIntoView().should('be.visible');
        cy.findByRole('button', { name: /Cancel/i }).should('be.visible');
        cy.findByRole('button', { name: /Save/i }).should('be.visible');
      });
    });

    context('when saving active status', () => {
      before(() => {
        selectOptionForMultiple('status', 'Active', 0);
        cy.findByRole('button', { name: /Save/i }).click({ force: true });
      });
      it('updates the Work status', () => {
        cy.findByRole('table').within(() => {
          cy.findAllByText(/ACTIVE/i).should('have.length.at.least', 1);
        });
      });
    });
  });
  describe('Editing the  table column for Work ', () => {
    context('Selecting a value in Omero project cell in table', () => {
      before(() => {
        cy.visit('/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused');
        selectOption('SGP1008-OmeroProject', 'OMERO_TEST999');
      });

      it('updates omero project column', () => {
        shouldDisplaySelectedValue('SGP1008-OmeroProject', 'OMERO_TEST999');
      });
    });

    context('Selecting a value in DNAP Study Id and name cell in table', () => {
      before(() => {
        cy.visit('/sgp?status[]=unstarted&status[]=active&status[]=failed&status[]=completed&status[]=paused');
        cy.findByTestId('SGP1008-DnapStudy').scrollIntoView().clear({ force: true }).type('11', { force: true }).blur();
      });

      it('updates dnap study column', () => {
        cy.findByText('S40315 - Heart Study_NB').scrollIntoView().should('exist');
      });
    });
  });

  describe('Sorting the SGP management table', () => {
    context('Filter SGP Numbers', () => {
      it('should show the correct work when a filter is applied', () => {
        removeSelections('status');
        selectOption('status', 'Unstarted');
        cy.findByRole('button', { name: /Search/i })
          .should('be.visible')
          .click();
        cy.get("table[data-testid='work-allocation-table']").find('tr').should('have.length.at.least', 7);
      });
    });

    context('while sorting using SGP number', () => {
      before(() => {
        cy.findByRole('button', { name: /SGP Number/i }).click();
      });

      it('displays the table sorted with SGP number in ascending order', () => {
        cy.get('td').eq(1).should('have.text', 'R&D1005');
      });
    });
  });

  context('When user is logged in as end user', () => {
    before(() => {
      cy.visitAsEndUser('/sgp');
    });
    it('shows only Allocate new SGP Number section', () => {
      cy.findByText('Allocate a new SGP number').scrollIntoView().should('be.visible');
      cy.findByText('Filter SGP Numbers').should('not.exist');
      cy.findByRole('table').should('not.exist');
    });
    it('includes the current username within the work requester select options ', () => {
      shouldHaveOption('workRequester', 'jb1');
    });
    context('when a work is allocated', () => {
      before(() => {
        fillInTheForm();
        cy.findByRole('button', { name: /Submit/i }).click();
      });

      it('displays succes message and notification to complete RNAscope/IHC template', () => {
        cy.findByText(
          /Assigned SGP\d+ \(TEST_WT_1 - 5 blocks and 15 slides and 1 original samples\) to project \(cost code description\) TEST999, Omero project OMERO_TEST999, DNAP study name 'S10315 - Orphan Tumour Study_NB_sNuc' and program PROGRAM_999 using cost code S999 with the work requester et2/
        ).should('exist');
        cy.findAllByTestId('reminder-div').should('have.length', 2);
      });
    });
  });

  context('when adding a new Project (Cost code description)', () => {
    before(() => {
      cy.visitAsEndUser('/sgp');
      cy.findByTestId('addNewProject-btn').click();
    });
    context('when a new project is been created successfully', () => {
      before(() => {
        cy.findByTestId('project').type('new project');
        cy.findByRole('button', { name: /Save/i }).click();
      });
      it('hides the add new config option form', () => {
        cy.findByLabelText('Add New Project').should('not.exist');
        cy.findByRole('button', { name: /Save/i }).should('not.exist');
      });
      it('displays the project select box with the newly added project name', () => {
        shouldDisplaySelectedValue('project', 'new project');
      });
    });
    context('when a new project fails to be created', () => {
      before(() => {
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.mutation('AddProject', () => {
              return HttpResponse.json({
                data: {
                  addProject: null
                }
              });
            })
          );
        });
        cy.findByTestId('addNewProject-btn').click();
        cy.findByTestId('project').type('new project');
        cy.findByRole('button', { name: /Save/i }).click();
      });
      it('keeps the add new config option form', () => {
        cy.findByLabelText('Add New Project').should('be.visible');

        cy.findByRole('button', { name: /Save/i }).should('be.visible');
      });
    });
  });

  context('when adding a new Cost code)', () => {
    before(() => {
      cy.visitAsEndUser('/sgp');
      cy.findByTestId('addNewCostCode-btn').click();
    });
    context('when a new cost code is been created successfully', () => {
      before(() => {
        cy.findByTestId('costCode').type('S12345');
        cy.findByRole('button', { name: /Save/i }).click();
      });
      it('hides the add new config option form', () => {
        cy.findByLabelText('Add New Cost Code').should('not.exist');
        cy.findByRole('button', { name: /Save/i }).should('not.exist');
      });
      it('displays the cost code select box with the newly added cost code', () => {
        shouldDisplaySelectedValue('costCode', 'S12345');
      });
    });
    context('when a new cost code fails to be created', () => {
      before(() => {
        cy.msw().then(({ graphql, worker }) => {
          worker.use(
            graphql.mutation('AddCostCode', () => {
              return HttpResponse.json({
                data: {
                  addCostCode: null
                }
              });
            })
          );
        });
        cy.findByTestId('addNewCostCode-btn').click();
        cy.findByTestId('costCode').type('S12345');
        cy.findByRole('button', { name: /Save/i }).click();
      });
      it('keeps the add new config option form', () => {
        cy.findByLabelText('Add New Cost Code').should('be.visible');
        cy.findByRole('button', { name: /Save/i }).should('be.visible');
      });

      describe('When the user clicks outside of add new option', () => {
        before(() => {
          cy.findByRole('button', { name: /Submit/i }).click();
        });
        it('hides the add new option component', () => {
          cy.findByLabelText('Add New Cost Code').should('not.exist');
        });
        it('displays cost code select option', () => {
          cy.findByTestId('costCode').should('be.visible');
        });
      });
    });
  });

  /*
  describe("Comments are shown or hidden dependent on chosen new status", () => {
    before(() => {
      cy.findAllByRole("button", { name: /Edit Status/i }).then(
        (editButtons) => {
          editButtons[0].click();
        }
      );
    });
    context("when new status is Fail", () => {
      before(() => {
        cy.findByLabelText("New Status").select("Fail");
      });

      it("shows the comments", () => {
        cy.findByLabelText("Comment").should("be.visible");
      });
    });

    context("when new status is Complete", () => {
      before(() => {
        cy.findByLabelText("New Status").select("Complete");
      });

      it("does not show the comments", () => {
        cy.findByLabelText("Comment").should("not.exist");
      });
    });
  });

  describe("Saving the Work status", () => {
    context("when I click save", () => {
      before(() => {
        cy.findByLabelText("New Status").select("Complete");
        cy.findByRole("button", { name: /Save/i }).click();
      });

      it("updates the Work status", () => {
        cy.findByTestId("work-allocation-table").within(() => {
          cy.findByText(/COMPLETED/i).should("exist");
        });
      });
    });
  });*/
});

const fillInTheForm = () => {
  selectOption('workType', 'TEST_WT_1');
  selectOption('workRequester', 'et2');
  selectOption('project', 'TEST999');
  cy.findByTestId('DNAP study ID').type('123');
  selectOption('omeroProject', 'OMERO_TEST999');
  selectOption('program', 'PROGRAM_999');
  selectOption('costCode', 'S999');
  cy.findByLabelText('Number of blocks').type('5');
  cy.findByLabelText('Number of slides').type('15');
  cy.findByLabelText('Number of original samples').type('1');
};
