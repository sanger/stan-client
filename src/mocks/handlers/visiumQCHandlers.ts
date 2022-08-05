import { graphql } from 'msw';
import {
  GetVisiumQcInfoQuery,
  GetVisiumQcInfoQueryVariables,
  RecordOpWithSlotMeasurementsMutation,
  RecordOpWithSlotMeasurementsMutationVariables,
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables
} from '../../types/sdk';
import commentRepository from '../repositories/commentRepository';

const visiumQCHandllers = [
  graphql.query<GetVisiumQcInfoQuery, GetVisiumQcInfoQueryVariables>('GetVisiumQCInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        comments: commentRepository.findAll().filter((comment) => comment.category === 'Visium QC' && comment.enabled)
      })
    );
  }),
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
  )
];

export default visiumQCHandllers;
