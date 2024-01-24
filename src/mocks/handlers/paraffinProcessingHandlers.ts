import { graphql } from 'msw';
import {
  GetParaffinProcessingInfoQuery,
  GetParaffinProcessingInfoQueryVariables,
  PerformParaffinProcessingMutation,
  PerformParaffinProcessingMutationVariables
} from '../../types/sdk';
import commentRepository from '../repositories/commentRepository';
import { createLabware } from './labwareHandlers';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';

const paraffinProcessingHandlers = [
  graphql.query<GetParaffinProcessingInfoQuery, GetParaffinProcessingInfoQueryVariables>(
    'GetParaffinProcessingInfo',
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: commentRepository
            .findAll()
            .filter((comment) => comment.category === 'Paraffin processing program' && comment.enabled)
        })
      );
    }
  ),

  graphql.mutation<PerformParaffinProcessingMutation, PerformParaffinProcessingMutationVariables>(
    'PerformParaffinProcessing',
    (req, res, ctx) => {
      const confirmedLabwares = req.variables.request.barcodes.map((barcode) => {
        const labware = createLabware(barcode);
        return buildLabwareFragment(labware);
      });
      return res(
        ctx.data({
          performParaffinProcessing: {
            labware: confirmedLabwares,
            operations: []
          }
        })
      );
    }
  )
];
export default paraffinProcessingHandlers;
