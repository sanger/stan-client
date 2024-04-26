import { selectOption } from '../shared/customReactSelect.cy';
import { CleanOutMutation, CleanOutMutationVariables } from '../../../src/types/sdk';
import { HttpResponse } from 'msw';

describe('Clean Out Page', () => {
  before(() => {
    cy.visit('/admin/cleanout');
  });

  context('when SGP number is selected', () => {
    before(() => {
      selectOption('workNumber', 'SGP1008');
    });
    it('updates the summary accordingly', () => {
      cy.contains('The selected SGP number: SGP1008.').should('be.visible');
    });
  });

  context('when labware is scanned', () => {
    before(() => {
      cy.get('#labwareScanInput').type('STAN-3456{enter}');
    });

    it('displays labware samples table information', () => {
      cy.findByRole('table').should('be.visible');
    });

    it('displays the labware layout', () => {
      cy.findByTestId('labware-STAN-3456').should('be.visible');
    });

    it('locks the labware scanner', () => {
      cy.get('#labwareScanInput').should('be.disabled');
    });

    it('updates the summary accordingly', () => {
      cy.contains('The selected labware barcode: STAN-3456.').should('be.visible');
    });
  });

  context('when slot(s) are selected', () => {
    before(() => {
      cy.findByTestId('labware-STAN-3456').within((elem) => {
        cy.wrap(elem).findByText('A1').wait(1000).click({ force: true });
        cy.wrap(elem).findByText('A2').wait(1000).click({ cmdKey: true, force: true });
      });
    });

    it('updates the summary accordingly', () => {
      cy.contains('2 slot(s) to be cleaned out.').should('be.visible');
    });

    it('enables the clean out button', () => {
      cy.findByRole('button', { name: 'Clean Out' }).should('be.enabled');
    });
  });

  context('when the scanned labware is deleted', () => {
    before(() => {
      cy.findByTestId('remove').click();
    });

    it('updates the summary accordingly', () => {
      cy.contains('No labware scanned').should('be.visible');
      cy.contains('No slot selected to be cleaned out.').should('be.visible');
    });

    it('disables the clean out button', () => {
      cy.findByRole('button', { name: 'Clean Out' }).should('be.disabled');
    });
  });

  context('submission', () => {
    context('when submission succeed', () => {
      before(() => {
        cy.reload();
        cleanOutSlots();
      });
      it('displays the operation complete modal', () => {
        cy.findByText('Slot(s) are cleaned out successively').should('be.visible');
      });
    });
    context('when submission fails', () => {
      before(() => {
        cy.reload();
        cy.msw().then(({ worker, graphql }) => {
          worker.use(
            graphql.mutation<CleanOutMutation, CleanOutMutationVariables>('CleanOut', () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: 'Could not valid the request'
                  }
                ]
              });
            })
          );
        });
        cleanOutSlots();
      });
      it('displays an error message', () => {
        cy.findByText('Could not valid the request').should('be.visible');
      });
    });
  });
});

const cleanOutSlots = () => {
  selectOption('workNumber', 'SGP1008');
  cy.get('#labwareScanInput').type('STAN-3456{enter}');
  cy.findByTestId('labware-STAN-3456').within((elem) => {
    cy.wrap(elem).findByText('A1').wait(1000).click({ force: true });
    cy.wrap(elem).findByText('A2').wait(1000).click({ cmdKey: true, force: true });
  });
  cy.findByRole('button', { name: 'Clean Out' }).click();
};
