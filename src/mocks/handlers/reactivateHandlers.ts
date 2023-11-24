import { graphql } from 'msw';
import {
  LabwareState,
  ReactivateLabware,
  ReactivateLabwareMutation,
  ReactivateLabwareMutationVariables
} from '../../types/sdk';

const reactivateHandlers = [
  graphql.mutation<ReactivateLabwareMutation, ReactivateLabwareMutationVariables>(
    'ReactivateLabware',
    (req, res, ctx) => {
      return res(
        ctx.data({
          reactivateLabware: {
            operations: [
              {
                id: 1
              }
            ],
            labware: [
              {
                barcode: (req.variables.items as Array<ReactivateLabware>)[0].barcode,
                state: LabwareState.Active
              }
            ]
          }
        })
      );
    }
  )
];

export default reactivateHandlers;
