import { graphql } from 'msw';
import {
  RecordOpWithSlotCommentsMutation,
  RecordOpWithSlotCommentsMutationVariables,
  RecordOpWithSlotMeasurementsMutation,
  RecordOpWithSlotMeasurementsMutationVariables,
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables
} from '../../types/sdk';

const visiumQCHandllers = [
  graphql.mutation<RecordVisiumQcMutation, RecordVisiumQcMutationVariables>('RecordVisiumQC', (req, res, ctx) => {
    return res(
      ctx.data({
        recordVisiumQC: {
          operations: [
            {
              id: 1
            }
          ]
        }
      })
    );
  }),
  graphql.mutation<RecordOpWithSlotMeasurementsMutation, RecordOpWithSlotMeasurementsMutationVariables>(
    'RecordOpWithSlotMeasurements',
    (req, res, ctx) => {
      return res(
        ctx.data({
          recordOpWithSlotMeasurements: {
            operations: [
              {
                id: 1
              }
            ]
          }
        })
      );
    }
  ),
  graphql.mutation<RecordOpWithSlotCommentsMutation, RecordOpWithSlotCommentsMutationVariables>(
    'RecordOpWithSlotComments',
    (req, res, ctx) => {
      return res(
        ctx.data({
          recordOpWithSlotComments: {
            operations: [
              {
                id: 1
              }
            ]
          }
        })
      );
    }
  )
];

export default visiumQCHandllers;
