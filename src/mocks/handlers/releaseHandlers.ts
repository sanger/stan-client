import { graphql } from 'msw';
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
  graphql.query<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>('GetReleaseInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        releaseDestinations: releaseDestinationRepository.findAll().filter((rd) => rd.enabled),
        releaseRecipients: releaseRecipientRepository.findAll().filter((rr) => rr.enabled),
        releaseColumnOptions
      })
    );
  }),
  graphql.query<GetReleaseColumnOptionsQuery, GetReleaseColumnOptionsQueryVariables>(
    'GetReleaseColumnOptions',
    (req, res, ctx) => {
      return res(
        ctx.data({
          releaseColumnOptions
        })
      );
    }
  ),

  graphql.mutation<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>('ReleaseLabware', (req, res, ctx) => {
    const { releaseLabware, recipient, destination } = req.variables.releaseRequest;

    return res(
      ctx.data({
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
      })
    );
  })
];

export default releaseHandlers;
