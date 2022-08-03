import { graphql } from 'msw';
import {
  AddSpeciesMutation,
  AddSpeciesMutationVariables,
  SetSpeciesEnabledMutation,
  SetSpeciesEnabledMutationVariables
} from '../../types/sdk';
import speciesFactory from '../../lib/factories/speciesFactory';
import speciesRepository from '../repositories/speciesRepository';

const speciesHandlers = [
  graphql.mutation<AddSpeciesMutation, AddSpeciesMutationVariables>('AddSpecies', (req, res, ctx) => {
    const addSpecies = speciesFactory.build({
      name: req.variables.name
    });
    speciesRepository.save(addSpecies);
    return res(ctx.data({ addSpecies }));
  }),

  graphql.mutation<SetSpeciesEnabledMutation, SetSpeciesEnabledMutationVariables>(
    'SetSpeciesEnabled',
    (req, res, ctx) => {
      const species = speciesRepository.find('name', req.variables.name);
      if (species) {
        species.enabled = req.variables.enabled;
        speciesRepository.save(species);
        return res(ctx.data({ setSpeciesEnabled: species }));
      } else {
        return res(
          ctx.errors([
            {
              message: `Could not find Species: "${req.variables.name}"`
            }
          ])
        );
      }
    }
  )
];

export default speciesHandlers;
