import { graphql } from 'msw';
import {
  AddDnapStudyMutation,
  AddDnapStudyMutationVariables,
  SetDnapStudyEnabledMutation,
  SetDnapStudyEnabledMutationVariables
} from '../../types/sdk';
import dnapStudyFactory from '../../lib/factories/dnapStudyFactory';
import dnapStudyRepository from '../repositories/dnapStudyRepository';

const dnapStudyHandlers = [
  graphql.mutation<AddDnapStudyMutation, AddDnapStudyMutationVariables>('AddDnapStudy', (req, res, ctx) => {
    const addDnapStudy = dnapStudyFactory.build({
      name: req.variables.name
    });
    dnapStudyRepository.save(addDnapStudy);
    return res(ctx.data({ addDnapStudy }));
  }),

  graphql.mutation<SetDnapStudyEnabledMutation, SetDnapStudyEnabledMutationVariables>(
    'SetDnapStudyEnabled',
    (req, res, ctx) => {
      const dnapStudy = dnapStudyRepository.find('name', req.variables.name);
      if (dnapStudy) {
        dnapStudy.enabled = req.variables.enabled;
        dnapStudyRepository.save(dnapStudy);
        return res(ctx.data({ setDnapStudyEnabled: dnapStudy }));
      } else {
        return res(
          ctx.errors([
            {
              message: `Could not find Dnap study: "${req.variables.name}"`
            }
          ])
        );
      }
    }
  )
];

export default dnapStudyHandlers;
