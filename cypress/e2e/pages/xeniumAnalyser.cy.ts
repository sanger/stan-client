import { selectOption, shouldDisplaySelectedValue } from '../shared/customReactSelect.cy';
import {
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  RecordAnalyserMutation,
  RecordAnalyserMutationVariables
} from '../../../src/types/sdk';

describe('Xenium Analyser', () => {
  before(() => {
    cy.visit('/lab/xenium_analyser');
  });

  describe('On load', () => {
    it('displays the correct title', () => {
      cy.findByText('Xenium Analyser').should('be.visible');
    });
    it('displays the labware scanner', () => {
      cy.findByText('Labware').should('be.visible');
    });
    it('should not display the Analyser Details', () => {
      cy.findByText('Analyser Details').should('not.exist');
    });
  });
  describe('when scanning labware which has not recorded probe hybridisation', () => {
    before(() => {
      //FindLatestOperationQuery should return null
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>(
            'FindLatestOperation',
            (req, res, ctx) => {
              return res.once(
                ctx.data({
                  findLatestOp: null
                })
              );
            }
          )
        );
      });
    });
    it('should display a warning message', () => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
      cy.findByText('No probe hybridisation recorded for STAN-3111').should('be.visible');
      cy.findByText('Analyser Details').should('not.exist');
    });
    after(() => {
      cy.findByTestId('removeButton').click();
    });
  });
  describe('When a labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
    });
    it('shows labware table', () => {
      cy.findAllByRole('table').eq(0).should('have.length.above', 0);
      //Table should display barcode of labware scanned
      cy.findAllByRole('table').contains('td', 'STAN-3111');
    });
    it('should display Analyser Details', () => {
      cy.findByTestId('performed').should('be.visible');
      cy.findByTestId('runName').should('be.visible');
      cy.findByTestId('lotNumber').should('be.visible');
      cy.findByTestId('workNumberAll').should('be.visible');
      cy.findAllByRole('table').should('have.length', 2);
      cy.findAllByRole('table').eq(1).contains('th', 'Barcode');
      cy.findAllByRole('table').eq(1).contains('th', 'SGP Number');
      cy.findAllByRole('table').eq(1).contains('th', 'Cassette Position');
      cy.findAllByRole('table').eq(1).contains('th', 'Samples');
      cy.findAllByRole('table').eq(1).contains('STAN-3111');
      cy.findByTestId('STAN-3111-workNumber').should('exist');
      cy.findByTestId('STAN-3111-position').should('exist');
      cy.findByTestId('STAN-3111-samples').should('exist');
    });
  });
  describe('When  two labware is scanned ', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3112{enter}'); //scan second labware
    });
    it('should display Analyser Details for STAN-3112', () => {
      cy.findAllByRole('table').eq(1).contains('STAN-3112');
      cy.findByTestId('STAN-3112-workNumber').should('exist');
      cy.findByTestId('STAN-3112-position').should('exist');
      cy.findByTestId('STAN-3112-samples').should('exist');
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
      cy.findByTestId('STAN-3112-workNumber').should('not.exist');
      cy.findByTestId('STAN-3112-position').should('not.exist');
      cy.findByTestId('STAN-3112-samples').should('not.exist');
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
  describe('Time', () => {
    it('should display the current date', () => {
      cy.findByTestId('performed').should('contain.value', new Date().toISOString().split('T')[0]);
    });
    context('Entering no value', () => {
      before(() => {
        cy.findByLabelText('Time').clear().blur();
      });
      it('should display an error message', () => {
        cy.findByText('Time is a required field').should('be.visible');
      });
    });
    context('Entering a future date', () => {
      before(() => {
        cy.findByLabelText('Time').clear().type('2075-01-01T10:00').blur();
      });
      it('should display an error message', () => {
        cy.findByText('Please select a date and time on or before current time').should('be.visible');
      });
    });
    context('Entering a past date', () => {
      before(() => {
        cy.findByLabelText('Time').clear().type('2020-01-01T10:00').blur();
      });
      it('should display an error message', () => {
        cy.findByTestId('performed').should('contain.value', '2020-01-01');
      });
    });
  });
  describe('Run Name', () => {
    it('should display an error message on blur when no value is entered', () => {
      cy.findByTestId('runName').clear().blur();
      cy.findByText('Run Name is a required field').should('be.visible');
    });
    it('should display an error message when entered value is more than 255 characters', () => {
      const text = new Array(257).join('a');
      cy.findByTestId('runName').clear().type(text).blur();
      cy.findByText('Run name should be a string of maximum length 255').should('be.visible');
    });
    it('should not display error message when entered a valid value', () => {
      cy.findByTestId('runName').clear().type('Run 123').blur();
      cy.findByText('Run name should be a string of maximum length 255').should('not.exist');
      cy.findByText('Run Name is a required field').should('not.exist');
    });
  });
  describe('Decoding reagent lot number', () => {
    it('should display an error message on blur when no value is entered', () => {
      cy.findByTestId('lotNumber').clear().blur();
      cy.findByText('Decoding reagent lot number is a required field').should('be.visible');
    });
    it('should display an error message when entered value is more than 20 characters', () => {
      const text = new Array(25).join('a');
      cy.findByTestId('lotNumber').clear().type(text).blur();
      cy.findByText(
        'Decoding reagent lot number should be a string of maximum length 20 of capital letters, numbers and underscores.'
      ).should('be.visible');
    });
    it('should display an error message when entered value contins any characters other than capital letters, numbers and underscores', () => {
      cy.findByTestId('lotNumber').clear().type('a*456bh').blur();
      cy.findByText(
        'Decoding reagent lot number should be a string of maximum length 20 of capital letters, numbers and underscores.'
      ).should('be.visible');
    });
    it('should not display error message when entered a valid value', () => {
      cy.findByTestId('lotNumber').clear().type('LOT_123').blur();
      cy.findByText(
        'Decoding reagent lot number should be a string of maximum length 20 of capital letters, numbers and underscores.'
      ).should('not.exist');
      cy.findByText('Decoding reagent lot number is a required field').should('not.exist');
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
        cy.findByTestId('performed').clear().blur();
      });
      it('should disable Save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      after(() => {
        cy.findByLabelText('Time').clear().type('2020-01-01T10:00').blur();
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
    context('when Cassette position is removed', () => {
      before(() => {
        selectOption('STAN-3111-position', '');
      });
      it('should disable Save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      after(() => {
        selectOption('STAN-3111-position', 'Left');
      });
    });
    context('when roi  is removed', () => {
      before(() => {
        cy.findByTestId('STAN-3111-0-roi').clear().blur();
      });
      it('should disable Save button', () => {
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      it('should display an error message', () => {
        const text = new Array(70).join('a');
        cy.findByTestId('STAN-3111-0-roi').clear().type(text).blur();
        cy.findByTestId('STAN-3111-1-roi').clear().type('1234').blur();
        cy.findByText('Region of interest field should be string of maximum length 64').should('be.visible');
        cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      });
      after(() => {
        cy.findByTestId('STAN-3111-0-roi').clear().blur().type('123456789');
      });
    });
  });

  describe('On save', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
      fillInForm();
    });
    context('When there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>(
              'RecordAnalyser',
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
        cy.findByText('Xenium analyser recorded on all labware').should('be.visible');
      });
    });
  });

  /**Fill all required fields in Xenium Analyser Details form */
  function fillInForm() {
    cy.findByTestId('performed').clear().type('2020-01-01T10:00').blur();
    cy.findByTestId('runName').clear().type('Run 123').blur();
    cy.findByTestId('lotNumber').clear().type('LOT_123').blur();
    selectOption('STAN-3111-workNumber', 'SGP1008');
    selectOption('STAN-3111-position', 'Left');
    for (let indx = 0; indx < 8; indx++) {
      cy.findByTestId(`STAN-3111-${indx}-roi`).clear().type('123456789').blur();
    }
  }
});
