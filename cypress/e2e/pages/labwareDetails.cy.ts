import { FindLabwareQuery, FindLabwareQueryVariables, LabwareState } from '../../../src/types/sdk';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { HttpResponse } from 'msw';

describe('Labware Info Page', () => {
  context('when I visit as a logged in user', () => {
    before(() => {
      cy.visit('/labware/STAN-0001F');
    });

    it('shows the label printer', () => {
      cy.findByText('Print Labels').should('be.visible');
    });
  });

  context('when I visit as a logged in user and the labware is not usable', () => {
    before(() => {
      cy.visit('/labware/STAN-0001F');

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<FindLabwareQuery, FindLabwareQueryVariables>('FindLabware', () => {
            return HttpResponse.json({
              data: {
                labware: labwareFactory.build({
                  state: LabwareState.Destroyed
                })
              }
            });
          })
        );
      });
    });

    it('shows label printing option', () => {
      cy.findByText('Print Labels').should('exist');
    });
  });

  context('when I check a flagged labware details', () => {
    before(() => {
      cy.visitAsGuest('/labware/STAN-100');
    });

    it('display the related flags table', () => {
      cy.findByText('Related Flags').should('be.visible');
      cy.findAllByTestId('flag-icon').should('have.length.at.least', 1);
    });
    it('does not show the label printer', () => {
      cy.findByText('Print Labels').should('not.exist');
    });
  });
});
