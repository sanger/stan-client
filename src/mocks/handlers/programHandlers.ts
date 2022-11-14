import { graphql } from 'msw';
import {
  AddProgramMutation,
  AddProgramMutationVariables,
  SetProgramEnabledMutation,
  SetProgramEnabledMutationVariables
} from '../../types/sdk';
import programFactory from '../../lib/factories/programFactory';
import programRepository from '../repositories/programRepository';

const programHandlers = [
  graphql.mutation<AddProgramMutation, AddProgramMutationVariables>('AddProgram', (req, res, ctx) => {
    const addProgram = programFactory.build({ name: req.variables.name });
    programRepository.save(addProgram);
    return res(ctx.data({ addProgram }));
  }),
  graphql.mutation<SetProgramEnabledMutation, SetProgramEnabledMutationVariables>(
    'SetProgramEnabled',
    (req, res, ctx) => {
      const program = programRepository.find('name', req.variables.name);
      if (program) {
        program.enabled = req.variables.enabled;
        programRepository.save(program);
        return res(ctx.data({ setProgramEnabled: program }));
      } else {
        return res(ctx.errors([{ message: `Could not find Program: "${req.variables.name}"` }]));
      }
    }
  )
];

export default programHandlers;
