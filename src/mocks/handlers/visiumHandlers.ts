import { graphql } from "msw";
import {
  RecordPermMutation,
  RecordPermMutationVariables,
} from "../../types/sdk";

const handlers = [
  graphql.mutation<RecordPermMutation, RecordPermMutationVariables>(
    "RecordPerm",
    (req, res, ctx) => {
      return res(
        ctx.data({
          recordPerm: {
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

export default handlers;
