import { ExtractMutation, ExtractMutationVariables } from '../../../src/types/sdk';
import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';

function scanInLabware() {
  const labwareScanInput = cy.get('#labwareScanInput');
  labwareScanInput.type('STAN-011{enter}');
  labwareScanInput.type('STAN-012{enter}');
  labwareScanInput.type('STAN-013{enter}');
}
const fillInTheFields = () => {
  scanInLabware;
  selectSGPNumber('SGP1008');
  selectOption('equipmentId', 'Automated - EZ2');
};

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

      fillInTheFields();
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
      fillInTheFields();
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
