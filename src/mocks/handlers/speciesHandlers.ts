import { graphql, HttpResponse } from 'msw';
import {
  AddSpeciesMutation,
  AddSpeciesMutationVariables,
  SetSpeciesEnabledMutation,
  SetSpeciesEnabledMutationVariables
} from '../../types/sdk';
import speciesFactory from '../../lib/factories/speciesFactory';
import speciesRepository from '../repositories/speciesRepository';

const speciesHandlers = [
  graphql.mutation<AddSpeciesMutation, AddSpeciesMutationVariables>('AddSpecies', ({ variables }) => {
    const addSpecies = speciesFactory.build({
      name: variables.name
    });
    speciesRepository.save(addSpecies);
    return HttpResponse.json({ data: { addSpecies } }, { status: 200 });
  }),

  graphql.mutation<SetSpeciesEnabledMutation, SetSpeciesEnabledMutationVariables>(
    'SetSpeciesEnabled',
    ({ variables }) => {
      const species = speciesRepository.find('name', variables.name);
      if (species) {
        species.enabled = variables.enabled;
        speciesRepository.save(species);
        return HttpResponse.json({ data: { setSpeciesEnabled: species } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Species: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default speciesHandlers;
