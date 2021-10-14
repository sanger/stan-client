import { graphql } from "msw";
import { UnreleaseMutation, UnreleaseMutationVariables } from "../../types/sdk";

const unreleaseHandlers = [
  graphql.mutation<UnreleaseMutation, UnreleaseMutationVariables>(
    "Unrelease",
    (req, res, ctx) => {
      return res(
        ctx.data({
          unrelease: {
            operations: [
              {
                id: 1,
              },
            ],
          },
        })
      );
    }
  ),
];

export default unreleaseHandlers;
