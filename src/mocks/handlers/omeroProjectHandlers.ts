import { graphql } from 'msw';
import {
  AddOmeroProjectMutation,
  AddOmeroProjectMutationVariables,
  SetOmeroProjectEnabledMutation,
  SetOmeroProjectEnabledMutationVariables
} from '../../types/sdk';
import omeroProjectFactory from '../../lib/factories/omeroProjectFactory';
import omeroProjectRepository from '../repositories/omeroProjectRepository';

const projectHandlers = [
  graphql.mutation<AddOmeroProjectMutation, AddOmeroProjectMutationVariables>('AddOmeroProject', (req, res, ctx) => {
    const addOmeroProject = omeroProjectFactory.build({ name: req.variables.name });
    omeroProjectRepository.save(addOmeroProject);
    return res(ctx.data({ addOmeroProject }));
  }),

  graphql.mutation<SetOmeroProjectEnabledMutation, SetOmeroProjectEnabledMutationVariables>(
    'SetOmeroProjectEnabled',
    (req, res, ctx) => {
      const omeroProject = omeroProjectRepository.find('name', req.variables.name);
      if (omeroProject) {
        omeroProject.enabled = req.variables.enabled;
        omeroProjectRepository.save(omeroProject);
        return res(ctx.data({ setOmeroProjectEnabled: omeroProject }));
      } else {
        return res(ctx.errors([{ message: `Could not find Omero Project: "${req.variables.name}"` }]));
      }
    }
  )
];

export default projectHandlers;
