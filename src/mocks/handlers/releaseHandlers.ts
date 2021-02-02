import { graphql } from "msw";
import {
  GetReleaseInfoQuery,
  GetReleaseInfoQueryVariables,
  ReleaseLabwareMutation,
  ReleaseLabwareMutationVariables,
} from "../../types/graphql";

const releaseHandlers = [
  graphql.query<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>(
    "GetReleaseInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          releaseDestinations: [
            { name: "Cell Gen wet lab team" },
            { name: "Teichmann lab" },
            { name: "Vento lab" },
            { name: "Bayrakter lab" },
          ],
          releaseRecipients: [
            { username: "et2" },
            { username: "cm18" },
            { username: "cs41" },
            { username: "kr19" },
            { username: "lb28" },
            { username: "re5" },
            { username: "lh7" },
            { username: "vk8" },
            { username: "cc36" },
            { username: "aw24" },
          ],
        })
      );
    }
  ),

  graphql.mutation<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>(
    "ReleaseLabware",
    (req, res, ctx) => {
      const { barcodes, recipient, destination } = req.variables.releaseRequest;

      return res(
        ctx.data({
          release: {
            releases: barcodes.map((barcode) => ({
              labware: { barcode },
              recipient: {
                username: recipient,
              },
              destination: {
                name: destination,
              },
            })),
          },
        })
      );
    }
  ),
];

export default releaseHandlers;
