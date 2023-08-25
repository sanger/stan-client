import { selectOption, shouldDisplaySelectedValue, shouldHaveOption } from '../shared/customReactSelect.cy';
import { RecordQcLabwareMutation, RecordQcLabwareMutationVariables } from '../../../src/types/sdk';
import commentRepository from '../../../src/mocks/repositories/commentRepository';

describe('Xenium QC', () => {
  const comments = commentRepository
    .findAll()
    .filter((comment) => comment.category === 'QC labware' && comment.enabled);

  before(() => {
    cy.visit('/lab/xenium_qc');
  });

  describe('On load', () => {
    it('displays the correct title', () => {
      cy.findByText('Xenium QC').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByText('Labware').should('be.visible');
    });
    it('should not display the Xenium qc details', () => {
      cy.findByTestId('xenium-qc-div').should('not.exist');
    });
  });

  describe('When a labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('shows labware', () => {
      cy.findByTestId('xenium-labware-qc').should('be.visible');
      //display work number for all labware
      cy.findByTestId('workNumberAll').should('be.visible');
      cy.findByTestId('completion').should('be.visible');
    });
  });
  describe('When  two labware is scanned ', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3112{enter}'); //scan second labware
    });
    it('should display Analyser Details for STAN-3112', () => {
      cy.findAllByTestId('xenium-labware-qc').should('have.length', 2);
      cy.findByTestId('STAN-3112-workNumber').should('exist');
      cy.findByTestId('STAN-3112-comments').should('exist');
    });
    it('should disable any further labware scanning', () => {
      cy.get('#labwareScanInput').should('be.disabled');
    });
  });
  describe('When  two labware is scanned and one is removed', () => {
    before(() => {
      cy.findAllByTestId('removeButton').eq(1).click();
    });
    it('should only display Analyser Details for STAN-3111', () => {
      cy.findByText('STAN-3112').should('not.exist');
      cy.findAllByTestId('xenium-labware-qc').should('have.length', 1);
    });
    it('should enable labware scanning', () => {
      cy.get('#labwareScanInput').should('be.enabled');
    });
  });
  describe('when SGP number is selected for all', () => {
    before(() => {
      selectOption('workNumberAll', 'SGP1008');
    });
    it('should display SGP number for all', () => {
      shouldDisplaySelectedValue('STAN-3111-workNumber', 'SGP1008');
    });
  });
  describe('Completion Time', () => {
    it('should display the current date', () => {
      cy.findByTestId('completion').should('contain.value', new Date().toISOString().split('T')[0]);
    });

    context('Entering a future date', () => {
      before(() => {
        cy.findByLabelText('Completion Time').clear().type('2075-01-01T10:00').blur();
      });
      it('should display an error message', () => {
        cy.findByText('Please select a date and time on or before current time').should('be.visible');
      });
    });
    context('Entering a past date', () => {
      before(() => {
        cy.findByLabelText('Completion Time').clear().type('2020-01-01T10:00').blur();
      });
      it('should display an error message', () => {
        cy.findByTestId('completion').should('contain.value', '2020-01-01');
      });
    });
  });
  describe('Comments', () => {
    it('should display comments', () => {
      comments.forEach((comment) => {
        shouldHaveOption('STAN-3111-comments', comment.text);
      });
    });
  });

  describe('Save button enabling', () => {
    before(() => {
      fillInForm();
    });
    it('should enable Save button when all fields are filled in ', () => {
      cy.findByRole('button', { name: 'Save' }).should('be.enabled');
    });

    context('when time field is empty', () => {
      before(() => {
        cy.findByTestId('completion').clear().blur();
      });
      it('should disable Save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      after(() => {
        cy.findByTestId('completion').clear().type('2020-01-01T10:00');
      });
    });
    context('when SGP number is removed', () => {
      before(() => {
        selectOption('STAN-3111-workNumber', '');
      });
      it('should disable Save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      after(() => {
        selectOption('STAN-3111-workNumber', 'SGP1008');
      });
    });
    context('when comments are removed', () => {
      before(() => {
        selectOption('STAN-3111-comments', '');
      });
      it('should not disable Save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.enabled');
      });
    });
  });

  describe('On save', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    context('When there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordQcLabwareMutation, RecordQcLabwareMutationVariables>(
              'RecordQCLabware',
              (req, res, ctx) => {
                return res.once(
                  ctx.errors([
                    {
                      message: 'Exception while fetching data (/CytAssist) : The operation could not be validated.',
                      extensions: {
                        problems: ['Labware is discarded: [STAN-3111]']
                      }
                    }
                  ])
                );
              }
            )
          );
        });

        cy.findByRole('button', { name: 'Save' }).click();
      });
      it('shows an error', () => {
        cy.findByText('Labware is discarded: [STAN-3111]').should('be.visible');
      });
    });
    context('When there is no server error', () => {
      before(() => {
        cy.findByRole('button', { name: 'Save' }).click();
      });

      it('shows a success message', () => {
        cy.findByText('Xenium QC recorded on all labware').should('be.visible');
      });
    });
  });

  /**Fill all required fields in Xenium Analyser Details form */
  function fillInForm() {
    cy.findByTestId('completion').clear().type('2020-01-01T10:00').blur();
    selectOption('STAN-3111-workNumber', 'SGP1008');
    selectOption('STAN-3111-comments', comments[0].text);
  }
});
