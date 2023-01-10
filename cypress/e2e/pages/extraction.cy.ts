import { ExtractMutation, ExtractMutationVariables } from '../../../src/types/sdk';

function scanInLabware() {
  cy.get('#labwareScanInput').type('STAN-011{enter}');
  cy.get('#labwareScanInput').type('STAN-012{enter}');
  cy.get('#labwareScanInput').type('STAN-013{enter}');
}

function selectWorkNumber() {
  cy.get('select').select('SGP1008');
}

describe('RNA Extraction', () => {
  context('when extraction fails', () => {
    before(() => {
      cy.visit('/lab/extraction');

      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<ExtractMutation, ExtractMutationVariables>('Extract', (req, res, ctx) => {
            return res.once(
              ctx.errors([
                {
                  message: 'Exception while fetching data (/extract) : Failed to extract'
                }
              ])
            );
          })
        );
      });

      scanInLabware();
      selectWorkNumber();
      cy.findByText('Extract').click();
    });

    it("doesn't lock the labware scan table", () => {
      cy.get('#labwareScanInput').should('not.be.disabled');
    });

    it("doesn't disable the Extract button", () => {
      cy.findByRole('button', { name: 'Extract' }).should('not.be.disabled');
    });

    it('shows an error message', () => {
      cy.findByText('Failed to extract').should('be.visible');
    });
  });

  context('when extraction is successful', () => {
    before(() => {
      cy.visit('/lab/extraction');
      scanInLabware();
      selectWorkNumber();
      cy.findByRole('button', { name: 'Extract' }).click();
    });

    it('hides the Extract button', () => {
      cy.findByRole('button', { name: 'Extract' }).should('not.exist');
    });

    it('shows a success message', () => {
      cy.findByText('Extraction Complete').should('be.visible');
    });
    it('shows a copy label button', () => {
      cy.findByRole('button', { name: /Copy Labels/i }).should('be.visible');
    });
  });
});
