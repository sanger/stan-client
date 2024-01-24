import { graphql } from 'msw';
import {
  RecordCompletionMutation,
  RecordCompletionMutationVariables,
  RecordProbeOperationMutation,
  RecordProbeOperationMutationVariables
} from '../../types/sdk';

const probeHybridisationHandlers = [
  graphql.mutation<RecordProbeOperationMutation, RecordProbeOperationMutationVariables>(
    'RecordProbeOperation',
    (req, res, ctx) => {
      return res(
        ctx.data({
          recordProbeOperation: {
            operations: [
              {
                id: 1
              }
            ]
          }
        })
      );
    }
  ),

  graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>('RecordCompletion', (req, res, ctx) => {
    return res(
      ctx.data({
        recordCompletion: {
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

export default probeHybridisationHandlers;
