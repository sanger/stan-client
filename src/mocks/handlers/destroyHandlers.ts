import { graphql } from 'msw';
import {
  DestroyMutation,
  DestroyMutationVariables,
  GetDestroyInfoQuery,
  GetDestroyInfoQueryVariables
} from '../../types/sdk';
import destructionReasonRepository from '../repositories/destructionReasonRepository';

const destroyHandlers = [
  graphql.query<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>('GetDestroyInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        destructionReasons: destructionReasonRepository.findAll().filter((dr) => dr.enabled)
      })
    );
  }),

  graphql.mutation<DestroyMutation, DestroyMutationVariables>('Destroy', (req, res, ctx) => {
    const destructions = req.variables.request.barcodes.map((barcode) => ({
      labware: { barcode }
    }));

    return res(
      ctx.data({
        destroy: {
          destructions
        }
      })
    );
  })
];

export default destroyHandlers;
