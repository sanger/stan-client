import { graphql, HttpResponse } from 'msw';
import {
  AddCostCodeMutation,
  AddCostCodeMutationVariables,
  SetCostCodeEnabledMutation,
  SetCostCodeEnabledMutationVariables
} from '../../types/sdk';
import costCodeFactory from '../../lib/factories/costCodeFactory';
import costCodeRepository from '../repositories/costCodeRepository';

const costCodeHandlers = [
  graphql.mutation<AddCostCodeMutation, AddCostCodeMutationVariables>('AddCostCode', ({ variables }) => {
    const addCostCode = costCodeFactory.build({ code: variables.code });
    costCodeRepository.save(addCostCode);
    return HttpResponse.json({ data: { addCostCode } }, { status: 200 });
  }),

  graphql.mutation<SetCostCodeEnabledMutation, SetCostCodeEnabledMutationVariables>(
    'SetCostCodeEnabled',
    ({ variables }) => {
      const costCode = costCodeRepository.find('code', variables.code);
      if (costCode) {
        costCode.enabled = variables.enabled;
        costCodeRepository.save(costCode);
        return HttpResponse.json({ data: { setCostCodeEnabled: costCode } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Cost Code: "${variables.code}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default costCodeHandlers;
