import {
  ExtractResultQuery,
  ExtractResultQueryVariables,
  LabwareFlagged,
  RecordRnaAnalysisMutation,
  RecordRnaAnalysisMutationVariables
} from '../../../src/types/sdk';
import { labwareTypeInstances } from '../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../src/types/stan';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { selectOption } from '../shared/customReactSelect.cy';
function scanLabware(barcode: string) {
  cy.get('#labwareScanInput').should('not.be.disabled').clear().type(`${barcode}{enter}`);
}
describe('RNA Analysis', () => {
  before(() => {
    cy.visit('/lab/rna_analysis');
  });

  context('when barcode is scanned whose extraction is recorded', () => {
    before(() => {
      scanLabware('STAN-3111');
    });
    it('displays the table with the barcode', () => {
      cy.findByRole('table').contains('STAN-3111');
    });
    it('enables the Analysis button', () => {
      cy.get('#analysis').should('be.enabled');
    });
  });
  context('when same barcode is entered multiple times', () => {
    before(() => {
      scanLabware('STAN-3111');
    });
    it('displays the error message', () => {
      cy.findByText(`"STAN-3111" has already been scanned`).should('be.visible');
    });
  });

  context('removes the row when delete button is pressed ', () => {
    before(() => {
      cy.findByTestId('remove').click();
    });
    it('should remove the row', () => {
      cy.get('[data-testid=remove]').should('not.exist');
    });
    it('disables the Analysis button', () => {
      cy.get('#analysis').should('be.disabled');
    });
    after(() => {
      scanLabware('STAN-3111');
    });
  });
  context('when barcode is scanned whose extraction is not recorded', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        const labwareType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.TUBE);
        // Create the new bit of labware
        const newLabware = labwareFactory.build({
          labwareType,
          barcode: 'STAN-3112'
        });
        worker.use(
          graphql.query<ExtractResultQuery, ExtractResultQueryVariables>('ExtractResult', (req, res, ctx) => {
            return res.once(
              ctx.data({
                extractResult: {
                  result: undefined,
                  labware: newLabware as LabwareFlagged,
                  concentration: undefined
                }
              })
            );
          })
        );
      });
      scanLabware('STAN-3112');
    });
    it('displays a warning message', () => {
      cy.findByText('No result recorded for extraction of the tube STAN-3112').should('be.visible');
    });
    it('will not display STAN-3112 in table', () => {
      cy.findByRole('table').get('STAN-3112').should('not.exist');
    });
  });

  context('when analysis button is pressed', () => {
    before(() => {
      cy.get('#analysis').click();
    });
    it('should display lock icon in extraction result table', () => {
      cy.get('[data-testid=remove]').should('not.exist');
    });
    it('should display lock icon', () => {
      cy.get('[data-testid=lock]').should('exist');
    });
  });
  context('when submit button is clicked and it return an error', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<RecordRnaAnalysisMutation, RecordRnaAnalysisMutationVariables>(
            'RecordRNAAnalysis',
            (req, res, ctx) => {
              return res(
                ctx.errors([
                  {
                    message: 'Exception while fetching data (/performRnaAnalysis) : An error occured'
                  }
                ])
              );
            }
          )
        );
      });
      selectOption('analysisType', 'DV200');
      selectOption('equipmentId', 'Bioanalyser');
      cy.findByText('Save').click();
    });
    it('should display Submit failure message', () => {
      cy.findByText('Failed to record RNA Analysis results').should('be.visible');
      cy.findByText('An error occured').should('be.visible');
    });
  });

  context('when submit button is clicked', () => {
    before(() => {
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<RecordRnaAnalysisMutation, RecordRnaAnalysisMutationVariables>(
            'RecordRNAAnalysis',
            (req, res, ctx) => {
              return res(ctx.data({ recordRNAAnalysis: { operations: [] } }));
            }
          )
        );
      });
      selectOption('equipmentId', 'Bioanalyser');
      selectOption('analysisType', 'DV200');
      cy.findByText('Save').click();
    });
    it('should display Submit success message', () => {
      cy.findByText('RNA Analysis data saved').should('be.visible');
    });
  });
});
