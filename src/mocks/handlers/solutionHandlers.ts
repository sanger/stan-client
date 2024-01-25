import { graphql, HttpResponse } from 'msw';
import {
  AddSolutionMutation,
  AddSolutionMutationVariables,
  SetSolutionEnabledMutation,
  SetSolutionEnabledMutationVariables
} from '../../types/sdk';
import solutionFactory from '../../lib/factories/solutionFactory';
import solutionRepository from '../repositories/solutionRepository';

const solutionHandlers = [
  graphql.mutation<AddSolutionMutation, AddSolutionMutationVariables>('AddSolution', ({ variables }) => {
    const addSolution = solutionFactory.build({
      name: variables.name
    });
    solutionRepository.save(addSolution);
    return HttpResponse.json({ data: { addSolution } }, { status: 200 });
  }),

  graphql.mutation<SetSolutionEnabledMutation, SetSolutionEnabledMutationVariables>(
    'SetSolutionEnabled',
    ({ variables }) => {
      const solution = solutionRepository.find('name', variables.name);
      if (solution) {
        solution.enabled = variables.enabled;
        solutionRepository.save(solution);
        return HttpResponse.json({ data: { setSolutionEnabled: solution } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Solution: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default solutionHandlers;
