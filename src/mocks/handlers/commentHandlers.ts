import { graphql } from "msw";
import {
  AddCommentMutation,
  AddCommentMutationVariables,
  SetCommentEnabledMutation,
  SetCommentEnabledMutationVariables,
} from "../../types/sdk";
import commentFactory from "../../lib/factories/commentFactory";
import commentRepository from "../repositories/commentRepository";

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
];

export default commentHandlers;
