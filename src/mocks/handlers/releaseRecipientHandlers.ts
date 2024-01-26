import { graphql, HttpResponse } from 'msw';
import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
  SetReleaseRecipientEnabledMutation,
  SetReleaseRecipientEnabledMutationVariables,
  UpdateReleaseRecipientFullNameMutation,
  UpdateReleaseRecipientFullNameMutationVariables
} from '../../types/sdk';
import releaseRecipientFactory from '../../lib/factories/releaseRecipientFactory';
import releaseRecipientRepository from '../repositories/releaseRecipientRepository';

const releaseRecipientHandlers = [
  graphql.mutation<AddReleaseRecipientMutation, AddReleaseRecipientMutationVariables>(
    'AddReleaseRecipient',
    ({ variables }) => {
      const addReleaseRecipient = releaseRecipientFactory.build({
        username: variables.username,
        fullName: variables.fullName
      });
      releaseRecipientRepository.save(addReleaseRecipient);
      return HttpResponse.json({ data: { addReleaseRecipient } }, { status: 200 });
    }
  ),

  graphql.mutation<SetReleaseRecipientEnabledMutation, SetReleaseRecipientEnabledMutationVariables>(
    'SetReleaseRecipientEnabled',
    ({ variables }) => {
      const releaseRecipient = releaseRecipientRepository.find('username', variables.username);
      if (releaseRecipient) {
        releaseRecipient.enabled = variables.enabled;
        releaseRecipientRepository.save(releaseRecipient);
        return HttpResponse.json({ data: { setReleaseRecipientEnabled: releaseRecipient } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find release recipient: "${variables.username}"` }] },
          { status: 404 }
        );
      }
    }
  ),

  graphql.mutation<UpdateReleaseRecipientFullNameMutation, UpdateReleaseRecipientFullNameMutationVariables>(
    'UpdateReleaseRecipientFullName',
    ({ variables }) => {
      const updateReleaseRecipientFullName = releaseRecipientFactory.build({
        username: variables.username,
        fullName: variables.fullName
      });
      releaseRecipientRepository.save(updateReleaseRecipientFullName);
      return HttpResponse.json({ data: { updateReleaseRecipientFullName } }, { status: 200 });
    }
  )
];

export default releaseRecipientHandlers;
