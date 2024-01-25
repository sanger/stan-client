import { graphql, HttpResponse } from 'msw';
import {
  AddProjectMutation,
  AddProjectMutationVariables,
  SetProjectEnabledMutation,
  SetProjectEnabledMutationVariables
} from '../../types/sdk';
import projectFactory from '../../lib/factories/projectFactory';
import projectRepository from '../repositories/projectRepository';

const projectHandlers = [
  graphql.mutation<AddProjectMutation, AddProjectMutationVariables>('AddProject', ({ variables }) => {
    const addProject = projectFactory.build({ name: variables.name });
    projectRepository.save(addProject);
    return HttpResponse.json({ data: { addProject } }, { status: 200 });
  }),

  graphql.mutation<SetProjectEnabledMutation, SetProjectEnabledMutationVariables>(
    'SetProjectEnabled',
    ({ variables }) => {
      const project = projectRepository.find('name', variables.name);
      if (project) {
        project.enabled = variables.enabled;
        projectRepository.save(project);
        return HttpResponse.json({ data: { setProjectEnabled: project } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Project: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default projectHandlers;
