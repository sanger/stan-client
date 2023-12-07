import { graphql } from 'msw';
import {
  FindFlaggedLabwareQuery,
  FindFlaggedLabwareQueryVariables,
  FlagLabwareMutation,
  FlagLabwareMutationVariables,
  GetLabwareFlagDetailsQuery,
  GetLabwareFlagDetailsQueryVariables
} from '../../types/sdk';
import labwareFactory from '../../lib/factories/labwareFactory';

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
    const labware = labwareFactory.build({ barcode: barcode });
    const payload: FindFlaggedLabwareQuery = {
      labwareFlagged: {
        __typename: 'LabwareFlagged',
        id: labware.id,
        barcode: labware.barcode,
        externalBarcode: labware.externalBarcode,
        destroyed: labware.destroyed,
        discarded: labware.discarded,
        released: labware.released,
        created: labware.created,
        flagged: barcode.endsWith('00'),
        state: labware.state,
        labwareType: {
          __typename: 'LabwareType',
          name: labware.labwareType.name,
          numRows: labware.labwareType.numRows,
          numColumns: labware.labwareType.numColumns,
          labelType: labware.labwareType.labelType
        },
        slots: labware.slots.map((slot) => ({
          __typename: 'Slot',
          id: slot.id,
          address: slot.address,
          labwareId: slot.labwareId,
          blockHighestSection: slot.blockHighestSection,
          block: slot.block,
          samples: slot.samples.map((sample) => ({
            id: sample.id,
            section: sample.section,
            bioState: {
              __typename: 'BioState',
              name: sample.bioState.name
            },
            tissue: {
              donor: {
                donorName: sample.tissue.donor.donorName,
                lifeStage: sample.tissue.donor.lifeStage,
                __typename: 'Donor'
              },
              externalName: sample.tissue.externalName,
              spatialLocation: {
                tissueType: {
                  name: sample.tissue.spatialLocation.tissueType.name,
                  __typename: 'TissueType'
                },
                code: sample.tissue.spatialLocation.code,
                __typename: 'SpatialLocation'
              },
              replicate: sample.tissue.replicate,
              medium: {
                name: sample.tissue.medium.name,
                __typename: 'Medium'
              },
              fixative: {
                name: sample.tissue.fixative.name,
                enabled: sample.tissue.fixative.enabled,
                __typename: 'Fixative'
              },
              __typename: 'Tissue'
            },
            __typename: 'Sample'
          }))
        }))
      }
    };

    return res(ctx.data(payload));
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
