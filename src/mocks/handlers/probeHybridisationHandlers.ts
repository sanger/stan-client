import { graphql, HttpResponse } from 'msw';
import {
  GetProbeHybSlotsQuery,
  GetProbeHybSlotsQueryVariables,
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
  }),
  graphql.query<GetProbeHybSlotsQuery, GetProbeHybSlotsQueryVariables>('GetProbeHybSlots', () => {
    return HttpResponse.json(
      {
        data: {
          probeHybSlots: ['A1', 'B1']
        }
      },
      { status: 200 }
    );
  })
];

export default probeHybridisationHandlers;
