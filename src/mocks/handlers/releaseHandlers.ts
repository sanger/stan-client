import { graphql } from 'msw';
import {
  GetReleaseInfoQuery,
  GetReleaseInfoQueryVariables,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables
} from '../../types/sdk';
import releaseDestinationRepository from '../repositories/releaseDestinationRepository';
import releaseRecipientRepository from '../repositories/releaseRecipientRepository';

const releaseHandlers = [
  graphql.query<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>('GetReleaseInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        releaseDestinations: releaseDestinationRepository.findAll().filter((rd) => rd.enabled),
        releaseRecipients: releaseRecipientRepository.findAll().filter((rr) => rr.enabled)
      })
    );
  }),

  graphql.mutation<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>('ReleaseLabware', (req, res, ctx) => {
    const { barcodes, recipient, destination } = req.variables.releaseRequest;

    return res(
      ctx.data({
        release: {
          releases: barcodes.map((barcode, index) => ({
            id: index + 1001,
            labware: { barcode },
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
