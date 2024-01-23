import { graphql, HttpResponse } from 'msw';
import {
  GetReleaseColumnOptionsQuery,
  GetReleaseColumnOptionsQueryVariables,
  GetReleaseInfoQuery,
  GetReleaseInfoQueryVariables,
  ReleaseFileOptionFieldsFragment,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables
} from '../../types/sdk';
import releaseDestinationRepository from '../repositories/releaseDestinationRepository';
import releaseRecipientRepository from '../repositories/releaseRecipientRepository';
const releaseColumnOptions: ReleaseFileOptionFieldsFragment[] = [
  { displayName: 'Histology', queryParamName: 'histology' },
  { displayName: 'Sample Processing', queryParamName: 'sample_processing' },
  { displayName: 'Xenium', queryParamName: 'xenium' }
];
const releaseHandlers = [
  graphql.query<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>('GetReleaseInfo', () => {
    return HttpResponse.json(
      {
        data: {
          releaseDestinations: releaseDestinationRepository.findAll().filter((rd) => rd.enabled),
          releaseRecipients: releaseRecipientRepository.findAll().filter((rr) => rr.enabled),
          releaseColumnOptions
        }
      },
      { status: 200 }
    );
  }),
  graphql.query<GetReleaseColumnOptionsQuery, GetReleaseColumnOptionsQueryVariables>('GetReleaseColumnOptions', () => {
    return HttpResponse.json({ data: { releaseColumnOptions } }, { status: 200 });
  }),

  graphql.mutation<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>('ReleaseLabware', ({ variables }) => {
    const { releaseLabware, recipient, destination } = variables.releaseRequest;
    return HttpResponse.json(
      {
        data: {
          release: {
            releases: releaseLabware.map((releaseLw, index) => ({
              id: index + 1001,
              labware: { barcode: releaseLw.barcode },
              recipient: {
                username: recipient
              },
              destination: {
                name: destination
              }
            }))
          }
        }
      },
      { status: 200 }
    );
  })
];

export default releaseHandlers;
