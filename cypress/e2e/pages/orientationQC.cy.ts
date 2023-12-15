import {
  FindLabwareQuery,
  FindLabwareQueryVariables,
  RecordOrientationQcMutation,
  RecordOrientationQcMutationVariables
} from '../../../src/types/sdk';
import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';
import { buildLabwareFragment } from '../../../src/lib/helpers/labwareHelper';

describe('Release Page', () => {
  beforeEach(() => {
    cy.msw().then(({ worker, graphql }) => {
      worker.use(
        graphql.query<FindLabwareQuery, FindLabwareQueryVariables>('FindLabware', (req, res, ctx) => {
          const barcode = req.variables.barcode;
          const labware = createLabware(barcode);
          labware.slots = [labware.slots[0]];
          labware.slots[0].samples = [labware.slots[0].samples[0]];
          labware.slots[0].block = true;
          const payload: FindLabwareQuery = {
            labware: buildLabwareFragment(labware)
          };

          return res(ctx.data(payload));
        })
      );
    });
  });
  before(() => {
    cy.visit('lab/sectioning/orientation_qc');
  });
  context('when submitted succesfully', () => {
    it('should display Submit success message', () => {
      cy.get('#labwareScanInput').type('STAN-3112{enter}');
      selectSGPNumber('SGP1008');
      selectOption('orientation', 'Correct');
      cy.findByRole('button', { name: /Submit/i }).click();
      cy.findByText('Orientation QC submitted successfully.').should('be.visible');
    });
  });
  context('when submitted with error', () => {
    before(() => {
      cy.visit('lab/sectioning/orientation_qc');
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.mutation<RecordOrientationQcMutation, RecordOrientationQcMutationVariables>(
            'RecordOrientationQC',
            (req, res, ctx) => {
              return res.once(
                ctx.errors([
                  {
                    message: 'Exception while submitting : Something went wrong'
                  }
                ])
              );
            }
          )
        );
      });
    });
    it('shows an error', () => {
      cy.get('#labwareScanInput').type('STAN-3111{enter}');
      selectSGPNumber('SGP1008');
      selectOption('orientation', 'Correct');
      cy.findByRole('button', { name: /Submit/i }).click();
      cy.findByText('Something went wrong').should('be.visible');
    });
  });
});
