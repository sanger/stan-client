import { graphql, HttpResponse } from 'msw';
import {
  GetStainingQcInfoQuery,
  GetStainingQcInfoQueryVariables,
  RecordStainResultMutation,
  RecordStainResultMutationVariables
} from '../../types/sdk';
import commentRepository from '../repositories/commentRepository';
import { createLabware } from './labwareHandlers';

const stainingQCHandlers = [
  graphql.query<GetStainingQcInfoQuery, GetStainingQcInfoQueryVariables>('GetStainingQCInfo', () => {
    return HttpResponse.json({
      data: {
        comments: commentRepository.findAll().filter((comment) => comment.category === 'Imaging QC' && comment.enabled)
      }
    });
  }),

  graphql.mutation<RecordStainResultMutation, RecordStainResultMutationVariables>(
    'RecordStainResult',
    ({ variables }) => {
      const labware = variables.request.labwareResults.map((labwareResult) => createLabware(labwareResult.barcode));
      return HttpResponse.json({ data: { recordStainResult: { operations: [{ id: 1 }], labware } } });
    }
  )
];

export default stainingQCHandlers;
