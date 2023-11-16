import { graphql } from 'msw';
import { ReactivateLabwareMutation, ReactivateLabwareMutationVariables } from '../../types/sdk';

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
            ]
          }
        })
      );
    }
  )
];

export default reactivateHandlers;
