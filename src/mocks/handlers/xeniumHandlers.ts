import { graphql } from 'msw';
import {
  FindProbeHybridisationQuery,
  FindProbeHybridisationQueryVariables,
  RecordAnalyserMutation,
  RecordAnalyserMutationVariables
} from '../../types/sdk';

const xeniumHandlers = [
  graphql.query<FindProbeHybridisationQuery, FindProbeHybridisationQueryVariables>(
    'FindProbeHybridisation',
    (req, res, ctx) => {
      return res(
        ctx.data({
          probeHybridisationLabware: {
            barcode: 'STAN-123'
          }
        })
      );
    }
  ),

  graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('recordAnalyser', (req, res, ctx) => {
    return res(
      ctx.data({
        recordAnalyser: {
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

export default xeniumHandlers;
