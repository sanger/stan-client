import { graphql, HttpResponse } from 'msw';
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
  graphql.mutation<RecordPermMutation, RecordPermMutationVariables>('RecordPerm', () => {
    return HttpResponse.json({ data: { recordPerm: { operations: [{ id: 1 }] } } });
  }),

  graphql.mutation<VisiumAnalysisMutation, VisiumAnalysisMutationVariables>('VisiumAnalysis', () => {
    return HttpResponse.json({ data: { visiumAnalysis: { operations: [{ id: 100 }] } } });
  }),

  graphql.query<FindPermDataQuery, FindPermDataQueryVariables>('FindPermData', ({ variables }) => {
    const barcode = variables.barcode;

    if (!barcode.startsWith('STAN-')) {
      return HttpResponse.json(
        {
          errors: [
            { message: `Exception while fetching data (/findPermData) : No labware found with barcode: ${barcode}` }
          ]
        },
        { status: 200 }
      );
    }

    const labware = createFlaggedLabware(barcode);
    const samplePositionResults: SamplePositionFieldsFragment[] = [];
    return HttpResponse.json({
      data: {
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
      }
    });
  })
];

export default handlers;
