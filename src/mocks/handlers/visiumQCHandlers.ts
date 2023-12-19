import { graphql, HttpResponse } from 'msw';
import {
  RecordOpWithSlotCommentsMutation,
  RecordOpWithSlotCommentsMutationVariables,
  RecordOpWithSlotMeasurementsMutation,
  RecordOpWithSlotMeasurementsMutationVariables,
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables
} from '../../types/sdk';

const visiumQCHandllers = [
  graphql.mutation<RecordVisiumQcMutation, RecordVisiumQcMutationVariables>('RecordVisiumQC', () => {
    return HttpResponse.json({ data: { recordVisiumQC: { operations: [{ id: 1 }] } } });
  }),
  graphql.mutation<RecordOpWithSlotMeasurementsMutation, RecordOpWithSlotMeasurementsMutationVariables>(
    'RecordOpWithSlotMeasurements',
    () => {
      return HttpResponse.json({ data: { recordOpWithSlotMeasurements: { operations: [{ id: 1 }] } } });
    }
  ),
  graphql.mutation<RecordOpWithSlotCommentsMutation, RecordOpWithSlotCommentsMutationVariables>(
    'RecordOpWithSlotComments',
    () => {
      return HttpResponse.json({ data: { recordOpWithSlotComments: { operations: [{ id: 1 }] } } });
    }
  )
];

export default visiumQCHandllers;
