import { graphql, HttpResponse } from 'msw';
import {
  AddProgramMutation,
  AddProgramMutationVariables,
  GetProgramsQuery,
  GetProgramsQueryVariables,
  SetProgramEnabledMutation,
  SetProgramEnabledMutationVariables
} from '../../types/sdk';
import programFactory from '../../lib/factories/programFactory';
import programRepository from '../repositories/programRepository';

const programHandlers = [
  graphql.query<GetProgramsQuery, GetProgramsQueryVariables>('GetPrograms', () => {
    return HttpResponse.json({ data: { programs: programRepository.findAll() } }, { status: 200 });
  }),
  graphql.mutation<AddProgramMutation, AddProgramMutationVariables>('AddProgram', ({ variables }) => {
    const addProgram = programFactory.build({ name: variables.name });
    programRepository.save(addProgram);
    return HttpResponse.json({ data: { addProgram } }, { status: 200 });
  }),
  graphql.mutation<SetProgramEnabledMutation, SetProgramEnabledMutationVariables>(
    'SetProgramEnabled',
    ({ variables }) => {
      const program = programRepository.find('name', variables.name);
      if (program) {
        program.enabled = variables.enabled;
        programRepository.save(program);
        return HttpResponse.json({ data: { setProgramEnabled: program } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Program: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default programHandlers;
