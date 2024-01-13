import {
  FindFlaggedLabwareQuery,
  FindFlaggedLabwareQueryVariables,
  FindLabwareQuery,
  FindLabwareQueryVariables,
  RecordOrientationQcMutation,
  RecordOrientationQcMutationVariables
} from '../../../src/types/sdk';
import { selectOption, selectSGPNumber } from '../shared/customReactSelect.cy';
import { createLabware } from '../../../src/mocks/handlers/labwareHandlers';
import { buildLabwareFragment } from '../../../src/lib/helpers/labwareHelper';
import { HttpResponse } from 'msw';
import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';

describe('Release Page', () => {
  beforeEach(() => {
    cy.msw().then(({ worker, graphql }) => {
      worker.use(
        graphql.query<FindFlaggedLabwareQuery, FindFlaggedLabwareQueryVariables>(
          'FindFlaggedLabware',
          ({ variables }) => {
            const barcode = variables.barcode;
            const labware = createFlaggedLabware(barcode);
            labware.slots = [labware.slots[0]];
            labware.slots[0].samples = [labware.slots[0].samples[0]];
            labware.slots[0].block = true;
            const payload: FindFlaggedLabwareQuery = {
              labwareFlagged: labware
            };
            return HttpResponse.json({ data: payload });
          }
        )
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
            () => {
              return HttpResponse.json({
                errors: [
                  {
                    message: `Exception while submitting : Something went wrong`
                  }
                ]
              });
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
