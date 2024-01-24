import { graphql, HttpResponse } from 'msw';
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
    () => {
      return HttpResponse.json({
        data: {
          comments: commentRepository
            .findAll()
            .filter((comment) => comment.category === 'Paraffin processing program' && comment.enabled)
        }
      });
    }
  ),

  graphql.mutation<PerformParaffinProcessingMutation, PerformParaffinProcessingMutationVariables>(
    'PerformParaffinProcessing',
    ({ variables }) => {
      const confirmedLabwares = variables.request.barcodes.map((barcode) => {
        const labware = createLabware(barcode);
        return buildLabwareFragment(labware);
      });
      return HttpResponse.json({
        data: {
          performParaffinProcessing: {
            labware: confirmedLabwares,
            operations: []
          }
        }
      });
    }
  )
];
export default paraffinProcessingHandlers;
