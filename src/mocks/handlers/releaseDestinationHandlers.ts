import { graphql, HttpResponse } from 'msw';
import {
  AddReleaseDestinationMutation,
  AddReleaseDestinationMutationVariables,
  SetReleaseDestinationEnabledMutation,
  SetReleaseDestinationEnabledMutationVariables
} from '../../types/sdk';
import releaseDestinationFactory from '../../lib/factories/releaseDestinationFactory';
import releaseDestinationRepository from '../repositories/releaseDestinationRepository';

const releaseDestinationHandlers = [
  graphql.mutation<AddReleaseDestinationMutation, AddReleaseDestinationMutationVariables>(
    'AddReleaseDestination',
    ({ variables }) => {
      const addReleaseDestination = releaseDestinationFactory.build({
        name: variables.name
      });
      releaseDestinationRepository.save(addReleaseDestination);
      return HttpResponse.json({ data: { addReleaseDestination } }, { status: 200 });
    }
  ),

  graphql.mutation<SetReleaseDestinationEnabledMutation, SetReleaseDestinationEnabledMutationVariables>(
    'SetReleaseDestinationEnabled',
    ({ variables }) => {
      const releaseDestination = releaseDestinationRepository.find('name', variables.name);
      if (releaseDestination) {
        releaseDestination.enabled = variables.enabled;
        releaseDestinationRepository.save(releaseDestination);
        return HttpResponse.json({ data: { setReleaseDestinationEnabled: releaseDestination } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find release destination: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default releaseDestinationHandlers;
