import { graphql, HttpResponse } from 'msw';
import {
  CleanOutMutation,
  CleanOutMutationVariables,
  GetCleanedOutAddressesQuery,
  GetCleanedOutAddressesQueryVariables
} from '../../types/sdk';

const cleanOutHandlers = [
  graphql.query<GetCleanedOutAddressesQuery, GetCleanedOutAddressesQueryVariables>(
    'GetCleanedOutAddresses',
    ({ variables }) => {
      return HttpResponse.json(
        {
          data: {
            cleanedOutAddresses:
              variables.barcode === 'STAN-5555' ? ['A2', 'B2'] : variables.barcode === 'STAN-5333' ? ['A4', 'B4'] : []
          }
        }, // This is only for testing purposes
        { status: 200 }
      );
    }
  ),

  graphql.mutation<CleanOutMutation, CleanOutMutationVariables>('CleanOut', () => {
    return HttpResponse.json({ data: { cleanOut: { operations: [{ id: 1 }] } } });
  })
];

export default cleanOutHandlers;
