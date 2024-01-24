import { graphql, HttpResponse } from 'msw';
import {
  AddOmeroProjectMutation,
  AddOmeroProjectMutationVariables,
  SetOmeroProjectEnabledMutation,
  SetOmeroProjectEnabledMutationVariables
} from '../../types/sdk';
import omeroProjectFactory from '../../lib/factories/omeroProjectFactory';
import omeroProjectRepository from '../repositories/omeroProjectRepository';

const projectHandlers = [
  graphql.mutation<AddOmeroProjectMutation, AddOmeroProjectMutationVariables>('AddOmeroProject', ({ variables }) => {
    const addOmeroProject = omeroProjectFactory.build({ name: variables.name });
    omeroProjectRepository.save(addOmeroProject);
    return HttpResponse.json({ data: { addOmeroProject } }, { status: 200 });
  }),

  graphql.mutation<SetOmeroProjectEnabledMutation, SetOmeroProjectEnabledMutationVariables>(
    'SetOmeroProjectEnabled',
    ({ variables }) => {
      const omeroProject = omeroProjectRepository.find('name', variables.name);
      if (omeroProject) {
        omeroProject.enabled = variables.enabled;
        omeroProjectRepository.save(omeroProject);
        return HttpResponse.json({ data: { setOmeroProjectEnabled: omeroProject } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Omero Project: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default projectHandlers;
