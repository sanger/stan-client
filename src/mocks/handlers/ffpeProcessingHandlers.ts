import { graphql } from 'msw';
import {
  GetFfpeProcessingInfoQuery,
  GetFfpeProcessingInfoQueryVariables,
  PerformFfpeProcessingMutation,
  PerformFfpeProcessingMutationVariables
} from '../../types/sdk';
import commentRepository from '../repositories/commentRepository';
import { createLabware } from './labwareHandlers';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';

const ffpeProcessingHandlers = [
  graphql.query<GetFfpeProcessingInfoQuery, GetFfpeProcessingInfoQueryVariables>(
    'GetFFPEProcessingInfo',
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: commentRepository
            .findAll()
            .filter((comment) => comment.category === 'FFPE processing program' && comment.enabled)
        })
      );
    }
  ),

  graphql.mutation<PerformFfpeProcessingMutation, PerformFfpeProcessingMutationVariables>(
    'PerformFFPEProcessing',
    (req, res, ctx) => {
      const confirmedLabwares = req.variables.request.barcodes.map((barcode) => {
        const labware = createLabware(barcode);
        return buildLabwareFragment(labware);
      });
      return res(
        ctx.data({
          performFFPEProcessing: {
            labware: confirmedLabwares,
            operations: []
          }
        })
      );
    }
  )
];
export default ffpeProcessingHandlers;
