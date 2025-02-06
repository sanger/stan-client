import { graphql, HttpResponse } from 'msw';
import {
  FindFlaggedLabwareQuery,
  FindFlaggedLabwareQueryVariables,
  FlagLabwareMutation,
  FlagLabwareMutationVariables,
  FlagPriority,
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
  graphql.query<FindFlaggedLabwareQuery, FindFlaggedLabwareQueryVariables>('FindFlaggedLabware', ({ variables }) => {
    const barcode = variables.barcode;
    if (!barcode.startsWith('STAN-')) {
      return HttpResponse.json({
        errors: [
          {
            message: `Exception while fetching data (/labware) : Invalid barcode: ${barcode}`
          }
        ]
      });
    }
    const payload: FindFlaggedLabwareQuery = {
      labwareFlagged: createFlaggedLabware(barcode)
    };
    return HttpResponse.json({ data: payload }, { status: 200 });
  }),

  graphql.query<GetLabwareFlagDetailsQuery, GetLabwareFlagDetailsQueryVariables>(
    'GetLabwareFlagDetails',
    ({ variables }) => {
      const barcode = variables.barcodes[0];
      return HttpResponse.json({
        data: {
          labwareFlagDetails: variables.barcodes[0].endsWith('00')
            ? [
                {
                  barcode: barcode,
                  flags: [
                    { barcode: barcode, description: 'Flagged for testing', priority: FlagPriority.Note },
                    { barcode: 'STAN-1234', description: 'ancestor 1 flagged', priority: FlagPriority.Flag },
                    { barcode: 'STAN-1235', description: 'ancestor 2 flagged', priority: FlagPriority.Flag },
                    {
                      barcode: 'STAN-1235',
                      description:
                        'And don’t forget to try our lorem ipsum generator, find placeholder images for your next design, or add a lorem ipsum plugin to the CMS or text editor of your choice.\n' +
                        '\n' +
                        'Need more fonts? Cool symbols? Check out Glyphy for the ultimate copy and paste experience.',
                      priority: FlagPriority.Note
                    }
                  ]
                }
              ]
            : []
        }
      });
    }
  ),
  graphql.mutation<FlagLabwareMutation, FlagLabwareMutationVariables>('FlagLabware', () => {
    return HttpResponse.json({
      data: {
        flagLabware: {
          operations: [
            {
              id: 1
            }
          ]
        }
      }
    });
  })
];

export const createFlaggedLabware = (barcode: string): LabwareFlaggedFieldsFragment => {
  const labwareJson = sessionStorage.getItem(`labware-${barcode}`);
  const labware: Labware = labwareJson ? JSON.parse(labwareJson) : createLabware(barcode);
  const flaggedLabware = convertLabwareToFlaggedLabware([buildLabwareFragment(labware)])[0];
  if (barcode.endsWith('00')) {
    flaggedLabware.flagged = true;
    flaggedLabware.flagPriority = FlagPriority.Flag;
  }
  if (barcode.endsWith('99')) {
    flaggedLabware.flagged = true;
    flaggedLabware.flagPriority = FlagPriority.Note;
  }
  flaggedLabware.__typename = 'LabwareFlagged';
  return flaggedLabware;
};

export const buildFlaggedLabwareFragment = (lw: Labware): LabwareFlaggedFieldsFragment => {
  const labware = buildLabwareFragment(lw) as LabwareFlaggedFieldsFragment;
  labware.flagged = lw.barcode.endsWith('00');
  labware.__typename = 'LabwareFlagged';
  return labware;
};
