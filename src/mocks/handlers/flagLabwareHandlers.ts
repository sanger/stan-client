import { graphql } from 'msw';
import {
  FindFlaggedLabwareQuery,
  FindFlaggedLabwareQueryVariables,
  FlagLabwareMutation,
  FlagLabwareMutationVariables,
  GetLabwareFlagDetailsQuery,
  GetLabwareFlagDetailsQueryVariables,
  Labware,
  LabwareFlaggedFieldsFragment
} from '../../types/sdk';
import { buildLabwareFragment, convertLabwareToFlaggedLabware } from '../../lib/helpers/labwareHelper';
import { createLabware } from './labwareHandlers';

/**
 * Returns a flagged labware if the given barcode ends with '00'
 */
export const flagLabwareHandlers = [
  graphql.query<FindFlaggedLabwareQuery, FindFlaggedLabwareQueryVariables>('FindFlaggedLabware', (req, res, ctx) => {
    const barcode = req.variables.barcode;
    if (!barcode.startsWith('STAN-')) {
      return res(
        ctx.errors([
          {
            message: `Exception while fetching data (/labware) : No labware found with barcode: ${barcode}`
          }
        ])
      );
    }
    return res(ctx.data({ labwareFlagged: createFlaggedLabware(barcode) }));
  }),

  graphql.query<GetLabwareFlagDetailsQuery, GetLabwareFlagDetailsQueryVariables>(
    'GetLabwareFlagDetails',
    (req, res, ctx) => {
      const barcode = req.variables.barcodes[0];
      return res(
        ctx.data({
          labwareFlagDetails: req.variables.barcodes[0].endsWith('00')
            ? [
                {
                  barcode: barcode,
                  flags: [
                    { barcode: barcode, description: 'Flagged for testing' },
                    { barcode: 'STAN-1234', description: 'ancestor 1 flagged' },
                    { barcode: 'STAN-1235', description: 'ancestor 2 flagged' },
                    {
                      barcode: 'STAN-1235',
                      description:
                        'And don’t forget to try our lorem ipsum generator, find placeholder images for your next design, or add a lorem ipsum plugin to the CMS or text editor of your choice.\n' +
                        '\n' +
                        'Need more fonts? Cool symbols? Check out Glyphy for the ultimate copy and paste experience.'
                    }
                  ]
                }
              ]
            : []
        })
      );
    }
  ),

  graphql.mutation<FlagLabwareMutation, FlagLabwareMutationVariables>('FlagLabware', (req, res, ctx) => {
    return res(
      ctx.data({
        flagLabware: {
          operations: [
            {
              id: 1
            }
          ]
        }
      })
    );
  })
];

export const createFlaggedLabware = (barcode: string): LabwareFlaggedFieldsFragment => {
  const labwareJson = sessionStorage.getItem(`labware-${barcode}`);
  const labware: Labware = labwareJson ? JSON.parse(labwareJson) : createLabware(barcode);
  const flaggedLabware = convertLabwareToFlaggedLabware([buildLabwareFragment(labware)])[0];
  flaggedLabware.flagged = barcode.endsWith('00');
  return flaggedLabware;
};

export const buildFlaggedLabwareFragment = (lw: Labware): LabwareFlaggedFieldsFragment => {
  const labware = buildLabwareFragment(lw) as LabwareFlaggedFieldsFragment;
  labware.flagged = lw.barcode.endsWith('00');
  return labware;
};
