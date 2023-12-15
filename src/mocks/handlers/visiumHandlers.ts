import { graphql } from 'msw';
import {
  FindPermDataQuery,
  FindPermDataQueryVariables,
  RecordPermMutation,
  RecordPermMutationVariables,
  SamplePositionFieldsFragment,
  VisiumAnalysisMutation,
  VisiumAnalysisMutationVariables
} from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import { createFlaggedLabware } from './flagLabwareHandlers';

const handlers = [
  graphql.mutation<RecordPermMutation, RecordPermMutationVariables>('RecordPerm', (req, res, ctx) => {
    return res(
      ctx.data({
        recordPerm: {
          operations: [
            {
              id: 1
            }
          ]
        }
      })
    );
  }),

  graphql.mutation<VisiumAnalysisMutation, VisiumAnalysisMutationVariables>('VisiumAnalysis', (req, res, ctx) => {
    return res(
      ctx.data({
        visiumAnalysis: {
          operations: [
            {
              id: 100
            }
          ]
        }
      })
    );
  }),

  graphql.query<FindPermDataQuery, FindPermDataQueryVariables>('FindPermData', (req, res, ctx) => {
    const barcode = req.variables.barcode;

    if (!barcode.startsWith('STAN-')) {
      return res(
        ctx.errors([
          {
            message: `Exception while fetching data (/findPermData) : No labware found with barcode: ${barcode}`
          }
        ])
      );
    }

    const labware = createFlaggedLabware(barcode);
    const samplePositionResults: SamplePositionFieldsFragment[] = [];
    return res(
      ctx.data({
        visiumPermData: {
          samplePositionResults,
          labware,
          addressPermData: labware.slots
            .filter(isSlotFilled)
            .reduce<FindPermDataQuery['visiumPermData']['addressPermData']>((memo, value, index) => {
              if (index % 2 === 0) {
                memo.push({
                  address: value.address,
                  selected: index === 0,
                  controlType: null,
                  seconds: (index + 1) * 60
                });
                return memo;
              }
              return memo;
            }, [])
        }
      })
    );
  })
];

export default handlers;
