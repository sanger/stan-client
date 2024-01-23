import { graphql, HttpResponse } from 'msw';
import {
  DestroyMutation,
  DestroyMutationVariables,
  GetDestroyInfoQuery,
  GetDestroyInfoQueryVariables
} from '../../types/sdk';
import destructionReasonRepository from '../repositories/destructionReasonRepository';

const destroyHandlers = [
  graphql.query<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>('GetDestroyInfo', ({ variables }) => {
    return HttpResponse.json({
      data: {
        destructionReasons: destructionReasonRepository.findAll().filter((dr) => dr.enabled)
      }
    });
  }),

  graphql.mutation<DestroyMutation, DestroyMutationVariables>('Destroy', ({ variables }) => {
    const destructions = variables.request.barcodes.map((barcode) => ({
      labware: { barcode }
    }));

    return HttpResponse.json({ data: { destroy: { destructions } } }, { status: 200 });
  })
];

export default destroyHandlers;
