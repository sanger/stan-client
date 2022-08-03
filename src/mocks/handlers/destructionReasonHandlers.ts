import { graphql } from 'msw';
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
    (req, res, ctx) => {
      let destructionReasons = destructionReasonRepository.findAll();

      const includeDisabled = req.variables.includeDisabled ?? false;

      if (!includeDisabled) {
        destructionReasons = destructionReasons.filter((dr) => dr.enabled);
      }

      return res(ctx.data({ destructionReasons: destructionReasons }));
    }
  ),

  graphql.mutation<AddDestructionReasonMutation, AddDestructionReasonMutationVariables>(
    'AddDestructionReason',
    (req, res, ctx) => {
      const addDestructionReason = destructionReasonFactory.build({
        text: req.variables.text
      });
      destructionReasonRepository.save(addDestructionReason);
      return res(ctx.data({ addDestructionReason }));
    }
  ),

  graphql.mutation<SetDestructionReasonEnabledMutation, SetDestructionReasonEnabledMutationVariables>(
    'SetDestructionReasonEnabled',
    (req, res, ctx) => {
      const destructionReason = destructionReasonRepository.find('text', req.variables.text);
      if (destructionReason) {
        destructionReason.enabled = req.variables.enabled;
        destructionReasonRepository.save(destructionReason);
        return res(ctx.data({ setDestructionReasonEnabled: destructionReason }));
      } else {
        return res(
          ctx.errors([
            {
              message: `Could not find destruction reason: "${req.variables.text}"`
            }
          ])
        );
      }
    }
  )
];

export default destructionReasonHandlers;
