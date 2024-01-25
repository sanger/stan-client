import { graphql, HttpResponse } from 'msw';
import {
  LabwareState,
  ReactivateLabware,
  ReactivateLabwareMutation,
  ReactivateLabwareMutationVariables
} from '../../types/sdk';

const reactivateHandlers = [
  graphql.mutation<ReactivateLabwareMutation, ReactivateLabwareMutationVariables>(
    'ReactivateLabware',
    ({ variables }) => {
      return HttpResponse.json(
        {
          data: {
            reactivateLabware: {
              operations: [
                {
                  id: 1
                }
              ],
              labware: [
                {
                  barcode: (variables.items as Array<ReactivateLabware>)[0].barcode,
                  state: LabwareState.Active
                }
              ]
            }
          }
        },
        { status: 200 }
      );
    }
  )
];

export default reactivateHandlers;
