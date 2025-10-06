import { graphql, HttpResponse } from 'msw';
import {
  GetStainingQcInfoQuery,
  GetStainingQcInfoQueryVariables,
  RecordStainResultMutation,
  RecordStainResultMutationVariables
} from '../../types/sdk';
import commentRepository from '../repositories/commentRepository';

const stainingQCHandlers = [
  graphql.query<GetStainingQcInfoQuery, GetStainingQcInfoQueryVariables>('GetStainingQCInfo', () => {
    return HttpResponse.json({
      data: {
        comments: commentRepository.findAll().filter((comment) => comment.category === 'Imaging QC' && comment.enabled)
      }
    });
  }),

  graphql.mutation<RecordStainResultMutation, RecordStainResultMutationVariables>('RecordStainResult', () => {
    return HttpResponse.json({ data: { recordStainResult: { operations: [{ id: 1 }] } } });
  })
];

export default stainingQCHandlers;
