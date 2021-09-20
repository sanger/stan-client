import { graphql } from "msw";
import {
  GetStainingQcInfoQuery,
  GetStainingQcInfoQueryVariables,
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
              (comment) => comment.category === "result" && comment.enabled
            ),
        })
      );
    }
  ),
];

export default stainingQCHandlers;
