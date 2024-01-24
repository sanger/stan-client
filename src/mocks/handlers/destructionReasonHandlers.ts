import { graphql, HttpResponse } from 'msw';
import {
  AddDestructionReasonMutation,
  AddDestructionReasonMutationVariables,
  GetDestructionReasonsQuery,
  GetDestructionReasonsQueryVariables,
  SetDestructionReasonEnabledMutation,
  SetDestructionReasonEnabledMutationVariables
} from '../../types/sdk';
import destructionReasonRepository from '../repositories/destructionReasonRepository';
import destructionReasonFactory from '../../lib/factories/destructionReasonFactory';

const destructionReasonHandlers = [
  graphql.query<GetDestructionReasonsQuery, GetDestructionReasonsQueryVariables>(
    'GetDestructionReasons',
    ({ variables }) => {
      let destructionReasons = destructionReasonRepository.findAll();

      const includeDisabled = variables.includeDisabled ?? false;

      if (!includeDisabled) {
        destructionReasons = destructionReasons.filter((dr) => dr.enabled);
      }
      return HttpResponse.json({ data: { destructionReasons } }, { status: 200 });
    }
  ),

  graphql.mutation<AddDestructionReasonMutation, AddDestructionReasonMutationVariables>(
    'AddDestructionReason',
    ({ variables }) => {
      const addDestructionReason = destructionReasonFactory.build({
        text: variables.text
      });
      destructionReasonRepository.save(addDestructionReason);
      return HttpResponse.json({ data: { addDestructionReason } }, { status: 200 });
    }
  ),

  graphql.mutation<SetDestructionReasonEnabledMutation, SetDestructionReasonEnabledMutationVariables>(
    'SetDestructionReasonEnabled',
    ({ variables }) => {
      const destructionReason = destructionReasonRepository.find('text', variables.text);
      if (destructionReason) {
        destructionReason.enabled = variables.enabled;
        destructionReasonRepository.save(destructionReason);
        return HttpResponse.json({ data: { setDestructionReasonEnabled: destructionReason } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find destruction reason: "${variables.text}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default destructionReasonHandlers;
