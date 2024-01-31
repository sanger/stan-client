import { selectOption } from '../shared/customReactSelect.cy';
import {
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  RecordAnalyserMutation,
  RecordAnalyserMutationVariables
} from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Xenium Analyser', () => {
  before(() => {
    cy.visit('/lab/xenium_analyser');
  });
  describe('when scanning labware which has not recorded probe hybridisation', () => {
    before(() => {
      //FindLatestOperationQuery should return null
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>('FindLatestOperation', () => {
            return HttpResponse.json({
              data: {
                findLatestOp: null
              }
            });
          })
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

  describe('On save', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
      fillInForm();
    });
    context('When there is a server error', () => {
      before(() => {
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('RecordAnalyser', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Exception while fetching data (/CytAssist) : The operation could not be validated.',
                    extensions: {
                      problems: ['Labware is discarded: [STAN-3111]']
                    }
                  }
                ]
              });
            })
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
    cy.findByTestId('lotNumberA').clear().type('Lot123').blur();
    cy.findByTestId('lotNumberB').clear().type('Lot456').blur();
    selectOption('equipmentId', 'Xenium 1');
    selectOption('STAN-3111-workNumber', 'SGP1008');
    selectOption('STAN-3111-position', 'Left');
    for (let indx = 0; indx < 8; indx++) {
      cy.findByTestId(`STAN-3111-${indx}-roi`).clear().type('123456789').blur();
    }
  }
});
