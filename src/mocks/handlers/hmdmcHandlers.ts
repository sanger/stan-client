import { graphql, HttpResponse } from 'msw';
import {
  AddHmdmcMutation,
  AddHmdmcMutationVariables,
  SetHmdmcEnabledMutation,
  SetHmdmcEnabledMutationVariables
} from '../../types/sdk';
import hmdmcFactory from '../../lib/factories/hmdmcFactory';
import hmdmcRepository from '../repositories/hmdmcRepository';

const hmdmcHandlers = [
  graphql.mutation<AddHmdmcMutation, AddHmdmcMutationVariables>('AddHmdmc', ({ variables }) => {
    const addHmdmc = hmdmcFactory.build({
      hmdmc: variables.hmdmc
    });
    hmdmcRepository.save(addHmdmc);
    return HttpResponse.json({ data: { addHmdmc } }, { status: 200 });
  }),

  graphql.mutation<SetHmdmcEnabledMutation, SetHmdmcEnabledMutationVariables>('SetHmdmcEnabled', ({ variables }) => {
    const hmdmc = hmdmcRepository.find('hmdmc', variables.hmdmc);
    if (hmdmc) {
      hmdmc.enabled = variables.enabled;
      hmdmcRepository.save(hmdmc);
      return HttpResponse.json({ data: { setHmdmcEnabled: hmdmc } }, { status: 200 });
    } else {
      return HttpResponse.json(
        { errors: [{ message: `Could not find HMDMC: "${variables.hmdmc}"` }] },
        { status: 404 }
      );
    }
  })
];

export default hmdmcHandlers;
