import { graphql } from 'msw';
import {
  AddSolutionMutation,
  AddSolutionMutationVariables,
  SetSolutionEnabledMutation,
  SetSolutionEnabledMutationVariables
} from '../../types/sdk';
import solutionFactory from '../../lib/factories/solutionFactory';
import solutionRepository from '../repositories/solutionRepository';

const solutionHandlers = [
  graphql.mutation<AddSolutionMutation, AddSolutionMutationVariables>('AddSolution', (req, res, ctx) => {
    const addSolution = solutionFactory.build({
      name: req.variables.name
    });
    solutionRepository.save(addSolution);
    return res(ctx.data({ addSolution }));
  }),

  graphql.mutation<SetSolutionEnabledMutation, SetSolutionEnabledMutationVariables>(
    'SetSolutionEnabled',
    (req, res, ctx) => {
      const solution = solutionRepository.find('name', req.variables.name);
      if (solution) {
        solution.enabled = req.variables.enabled;
        solutionRepository.save(solution);
        return res(ctx.data({ setSolutionEnabled: solution }));
      } else {
        return res(
          ctx.errors([
            {
              message: `Could not find Solution: "${req.variables.name}"`
            }
          ])
        );
      }
    }
  )
];

export default solutionHandlers;
