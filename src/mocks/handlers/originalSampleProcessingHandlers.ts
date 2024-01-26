import { graphql, HttpResponse } from 'msw';
import {
  GetBlockProcessingInfoQuery,
  GetBlockProcessingInfoQueryVariables,
  GetNextReplicateNumberQuery,
  GetNextReplicateNumberQueryVariables,
  GetPotProcessingInfoQuery,
  GetPotProcessingInfoQueryVariables,
  GetSampleProcessingCommentsInfoQuery,
  GetSampleProcessingCommentsInfoQueryVariables,
  NextReplicateData,
  PerformTissueBlockMutation,
  PerformTissueBlockMutationVariables,
  PerformTissuePotMutation,
  PerformTissuePotMutationVariables,
  RecordSampleProcessingCommentsMutation,
  RecordSampleProcessingCommentsMutationVariables
} from '../../types/sdk';
import { createLabware } from './labwareHandlers';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import commentRepository from '../repositories/commentRepository';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import fixativeRepository from '../repositories/fixativeRepository';
import labwareFactory from '../../lib/factories/labwareFactory';

const originalSampleProcessingHandlers = [
  graphql.query<GetBlockProcessingInfoQuery, GetBlockProcessingInfoQueryVariables>('GetBlockProcessingInfo', () => {
    return HttpResponse.json({
      data: {
        mediums: [{ name: 'None' }, { name: 'OCT' }, { name: 'Paraffin' }],
        comments: commentRepository
          .findAll()
          .filter((comment) => comment.category === 'Sample Processing' && comment.enabled),
        labwareTypes: labwareTypeInstances
      }
    });
  }),
  graphql.query<GetPotProcessingInfoQuery, GetPotProcessingInfoQueryVariables>('GetPotProcessingInfo', () => {
    return HttpResponse.json({
      data: {
        comments: commentRepository
          .findAll()
          .filter((comment) => comment.category === 'Sample Processing' && comment.enabled),
        labwareTypes: labwareTypeInstances,
        fixatives: fixativeRepository.findAll().filter((fixative) => fixative.enabled)
      }
    });
  }),
  graphql.query<GetNextReplicateNumberQuery, GetNextReplicateNumberQueryVariables>(
    'GetNextReplicateNumber',
    ({ variables }) => {
      const sourceBarcodes = [...variables.barcodes];
      const nextReplicateData: NextReplicateData[] = [];
      /***Keeps labware in pairs as a group. This is to enable testing for all cases**/
      for (let indx = 0; indx < sourceBarcodes.length; indx += 2) {
        nextReplicateData.push({
          barcodes: sourceBarcodes.slice(indx, indx + 2),
          nextReplicateNumber: 5,
          donorId: 1,
          spatialLocationId: 1
        });
      }
      return HttpResponse.json({ data: { nextReplicateNumbers: nextReplicateData } });
    }
  ),
  graphql.query<GetSampleProcessingCommentsInfoQuery, GetSampleProcessingCommentsInfoQueryVariables>(
    'GetSampleProcessingCommentsInfo',
    () => {
      return HttpResponse.json({
        data: {
          comments: commentRepository
            .findAll()
            .filter((comment) => comment.category === 'Sample Processing' && comment.enabled)
        }
      });
    }
  ),
  graphql.mutation<PerformTissueBlockMutation, PerformTissueBlockMutationVariables>(
    'PerformTissueBlock',
    ({ variables }) => {
      const confirmedLabwares = variables.request.labware.map((confirmLabware) => {
        const labware = createLabware(confirmLabware.sourceBarcode);
        return buildLabwareFragment(labware);
      });

      return HttpResponse.json({
        data: {
          performTissueBlock: {
            labware: confirmedLabwares,
            operations: []
          }
        }
      });
    }
  ),
  graphql.mutation<PerformTissuePotMutation, PerformTissuePotMutationVariables>('PerformTissuePot', ({ variables }) => {
    const confirmedLabwares = variables.request.destinations.map(() => {
      const labware = labwareFactory.build({ id: Math.random() });
      return buildLabwareFragment(labware);
    });

    return HttpResponse.json({
      data: {
        performPotProcessing: {
          labware: confirmedLabwares,
          operations: []
        }
      }
    });
  }),
  graphql.mutation<RecordSampleProcessingCommentsMutation, RecordSampleProcessingCommentsMutationVariables>(
    'RecordSampleProcessingComments',
    ({ variables }) => {
      const confirmedLabwares = variables.request.labware.map((confirmLabware) => {
        const labware = createLabware(confirmLabware.barcode);
        return buildLabwareFragment(labware);
      });
      return HttpResponse.json({
        data: {
          recordSampleProcessingComments: {
            labware: confirmedLabwares,
            operations: []
          }
        }
      });
    }
  )
];

export default originalSampleProcessingHandlers;
