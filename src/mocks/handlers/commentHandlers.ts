import { graphql } from "msw";
import {
  AddCommentMutation,
  AddCommentMutationVariables,
  GetCommentsQuery,
  GetCommentsQueryVariables,
  SetCommentEnabledMutation,
  SetCommentEnabledMutationVariables,
} from "../../types/sdk";
import commentFactory from "../../lib/factories/commentFactory";
import commentRepository from "../repositories/commentRepository";
import { isEnabled } from "../../lib/helpers";

const commentHandlers = [
  graphql.mutation<AddCommentMutation, AddCommentMutationVariables>(
    "AddComment",
    (req, res, ctx) => {
      const addComment = commentFactory.build({
        text: req.variables.text,
      });
      commentRepository.save(addComment);
      return res(ctx.data({ addComment }));
    }
  ),

  graphql.mutation<
    SetCommentEnabledMutation,
    SetCommentEnabledMutationVariables
  >("SetCommentEnabled", (req, res, ctx) => {
    const comment = commentRepository.find("id", req.variables.commentId);
    if (comment) {
      comment.enabled = req.variables.enabled;
      commentRepository.save(comment);
      return res(ctx.data({ setCommentEnabled: comment }));
    } else {
      return res(
        ctx.errors([
          {
            message: `Could not find comment: "${req.variables.commentId}"`,
          },
        ])
      );
    }
  }),

  graphql.query<GetCommentsQuery, GetCommentsQueryVariables>(
    "GetComments",
    (req, res, ctx) => {
      commentFactory.build();
      return res(
        ctx.data({
          comments: commentRepository
            .findAll()
            .filter(
              (comment) =>
                comment.category === req.variables.commentCategory &&
                isEnabled(comment)
            ),
        })
      );
    }
  ),
];

export default commentHandlers;
