import { graphql } from "msw";
import {
  DestroyMutation,
  DestroyMutationVariables,
  GetDestroyInfoQuery,
  GetDestroyInfoQueryVariables,
} from "../../types/graphql";

const destroyHandlers = [
  graphql.query<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>(
    "GetDestroyInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          destructionReasons: [
            { id: 1, text: "No tissue remaining in block." },
            { id: 2, text: "Operator error." },
            { id: 3, text: "Experiment complete." },
          ],
        })
      );
    }
  ),

  graphql.mutation<DestroyMutation, DestroyMutationVariables>(
    "Destroy",
    (req, res, ctx) => {
      const destructions = req.variables.request.barcodes.map((barcode) => ({
        labware: { barcode },
      }));

      return res(
        ctx.data({
          destroy: {
            destructions,
          },
        })
      );
    }
  ),
];

export default destroyHandlers;
