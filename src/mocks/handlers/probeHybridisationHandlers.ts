import { graphql, HttpResponse } from 'msw';
import {
  RecordCompletionMutation,
  RecordCompletionMutationVariables,
  RecordProbeOperationMutation,
  RecordProbeOperationMutationVariables
} from '../../types/sdk';

const probeHybridisationHandlers = [
  graphql.mutation<RecordProbeOperationMutation, RecordProbeOperationMutationVariables>('RecordProbeOperation', () => {
    return HttpResponse.json(
      {
        data: {
          recordProbeOperation: {
            operations: [
              {
                id: 1
              }
            ]
          }
        }
      },
      { status: 200 }
    );
  }),

  graphql.mutation<RecordCompletionMutation, RecordCompletionMutationVariables>('RecordCompletion', () => {
    return HttpResponse.json(
      {
        data: {
          recordCompletion: {
            operations: [
              {
                id: 1
              }
            ]
          }
        }
      },
      { status: 200 }
    );
  })
];

export default probeHybridisationHandlers;
