import { graphql, HttpResponse } from 'msw';
import {
  AddCommentMutation,
  AddCommentMutationVariables,
  GetCommentsQuery,
  GetCommentsQueryVariables,
  SetCommentEnabledMutation,
  SetCommentEnabledMutationVariables
} from '../../types/sdk';
import commentFactory from '../../lib/factories/commentFactory';
import commentRepository from '../repositories/commentRepository';
import { isEnabled } from '../../lib/helpers';

const commentHandlers = [
  graphql.mutation<AddCommentMutation, AddCommentMutationVariables>('AddComment', ({ variables }) => {
    const addComment = commentFactory.build({
      text: variables.text
    });
    commentRepository.save(addComment);
    return HttpResponse.json({ data: { addComment } }, { status: 200 });
  }),

  graphql.mutation<SetCommentEnabledMutation, SetCommentEnabledMutationVariables>(
    'SetCommentEnabled',
    ({ variables }) => {
      const comment = commentRepository.find('id', variables.commentId);
      if (comment) {
        comment.enabled = variables.enabled;
        commentRepository.save(comment);
        return HttpResponse.json({ data: { setCommentEnabled: comment } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find comment: "${variables.commentId}"` }] },
          { status: 404 }
        );
      }
    }
  ),

  graphql.query<GetCommentsQuery, GetCommentsQueryVariables>('GetComments', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          comments: commentRepository
            .findAll()
            .filter(
              (comment) =>
                (!variables.commentCategory || variables.commentCategory === comment.category) &&
                (variables.includeDisabled || isEnabled(comment))
            )
        }
      },
      { status: 200 }
    );
  })
];

export default commentHandlers;
