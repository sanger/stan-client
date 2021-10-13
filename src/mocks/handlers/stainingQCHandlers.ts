import { graphql } from "msw";
import {
  GetStainingQcInfoQuery,
  GetStainingQcInfoQueryVariables,
  RecordStainResultMutationVariables,
  RecordStainResultMutation,
} from "../../types/sdk";
import commentRepository from "../repositories/commentRepository";

const stainingQCHandlers = [
  graphql.query<GetStainingQcInfoQuery, GetStainingQcInfoQueryVariables>(
    "GetStainingQCInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: commentRepository
            .findAll()
            .filter(
              (comment) => comment.category === "stain QC" && comment.enabled
            ),
        })
      );
    }
  ),

  graphql.mutation<
    RecordStainResultMutation,
    RecordStainResultMutationVariables
  >("RecordStainResult", (req, res, ctx) => {
    return res(
      ctx.data({
        recordStainResult: {
          operations: [
            {
              id: 1,
            },
          ],
        },
      })
    );
  }),
];

export default stainingQCHandlers;
