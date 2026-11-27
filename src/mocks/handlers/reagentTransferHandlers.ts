import { graphql, HttpResponse } from 'msw';
import {
  FindLabwareQueryVariables,
  FindReagentPlateQuery,
  RecordReagentTransferMutation,
  RecordReagentTransferMutationVariables
} from '../../types/sdk';

const reagentTransferHandlers = [
  graphql.mutation<RecordReagentTransferMutation, RecordReagentTransferMutationVariables>(
    'RecordReagentTransfer',
    () => {
      return HttpResponse.json({ data: { reagentTransfer: { operations: [{ id: 1 }] } } }, { status: 200 });
    }
  ),

  graphql.query<FindReagentPlateQuery, FindLabwareQueryVariables>('FindReagentPlate', () => {
    return HttpResponse.json({ data: { reagentPlate: null } }, { status: 200 });
  })
];

export default reagentTransferHandlers;
