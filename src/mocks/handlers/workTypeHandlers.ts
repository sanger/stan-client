import { graphql, HttpResponse } from 'msw';
import {
  AddWorkTypeMutation,
  AddWorkTypeMutationVariables,
  GetWorkTypesQuery,
  GetWorkTypesQueryVariables,
  SetWorkTypeEnabledMutation,
  SetWorkTypeEnabledMutationVariables
} from '../../types/sdk';
import workTypeRepository from '../repositories/workTypeRepository';
import workRepository from '../repositories/workRepository';

const workTypeHandlers = [
  graphql.mutation<AddWorkTypeMutation, AddWorkTypeMutationVariables>('AddWorkType', ({ variables }) => {
    const workType = workTypeRepository.save({
      name: variables.name,
      enabled: true
    });

    return HttpResponse.json({ data: { addWorkType: workType } });
  }),

  graphql.mutation<SetWorkTypeEnabledMutation, SetWorkTypeEnabledMutationVariables>(
    'SetWorkTypeEnabled',
    ({ variables }) => {
      const workType = workTypeRepository.find('name', variables.name);

      if (!workType) {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Work Type "${variables.name}"` }] },
          { status: 400 }
        );
      } else {
        workType.enabled = variables.enabled;
        workTypeRepository.save(workType);
        return HttpResponse.json({ data: { setWorkTypeEnabled: workType } });
      }
    }
  ),

  graphql.query<GetWorkTypesQuery, GetWorkTypesQueryVariables>('GetWorkTypes', () => {
    return HttpResponse.json({
      data: { workTypes: workTypeRepository.findAll().concat(workRepository.findAll().map((work) => work.workType)) }
    });
  })
];

export default workTypeHandlers;
