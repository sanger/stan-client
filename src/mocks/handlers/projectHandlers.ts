import { graphql } from 'msw';
import {
  AddProjectMutation,
  AddProjectMutationVariables,
  SetProjectEnabledMutation,
  SetProjectEnabledMutationVariables
} from '../../types/sdk';
import projectFactory from '../../lib/factories/projectFactory';
import projectRepository from '../repositories/projectRepository';

const projectHandlers = [
  graphql.mutation<AddProjectMutation, AddProjectMutationVariables>('AddProject', (req, res, ctx) => {
    const addProject = projectFactory.build({ name: req.variables.name });
    projectRepository.save(addProject);
    return res(ctx.data({ addProject }));
  }),

  graphql.mutation<SetProjectEnabledMutation, SetProjectEnabledMutationVariables>(
    'SetProjectEnabled',
    (req, res, ctx) => {
      const project = projectRepository.find('name', req.variables.name);
      if (project) {
        project.enabled = req.variables.enabled;
        projectRepository.save(project);
        return res(ctx.data({ setProjectEnabled: project }));
      } else {
        return res(ctx.errors([{ message: `Could not find Project: "${req.variables.name}"` }]));
      }
    }
  )
];

export default projectHandlers;
