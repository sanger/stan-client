import { graphql } from 'msw';
import {
  FindLabwareQueryVariables,
  FindReagentPlateQuery,
  RecordReagentTransferMutation,
  RecordReagentTransferMutationVariables
} from '../../types/sdk';

const reagentTransferHandlers = [
  graphql.mutation<RecordReagentTransferMutation, RecordReagentTransferMutationVariables>(
    'RecordReagentTransfer',
    (req, res, ctx) => {
      return res(
        ctx.data({
          reagentTransfer: {
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

  graphql.query<FindReagentPlateQuery, FindLabwareQueryVariables>('FindReagentPlate', (req, res, ctx) => {
    return res(
      ctx.data({
        reagentPlate: undefined
      })
    );
  })
];

export default reagentTransferHandlers;
