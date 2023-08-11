import { graphql } from 'msw';
import { RecordProbeOperationMutation, RecordProbeOperationMutationVariables } from '../../types/sdk';

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
  )
];

export default probeHybridisationHandlers;
