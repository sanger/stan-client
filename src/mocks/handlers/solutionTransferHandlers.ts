import { graphql, HttpResponse } from 'msw';
import {
  GetSolutionTransferInfoQuery,
  GetSolutionTransferInfoQueryVariables,
  PerformSolutionTransferMutation,
  PerformSolutionTransferMutationVariables
} from '../../types/sdk';
import { createLabware } from './labwareHandlers';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import solutionRepository from '../repositories/solutionRepository';

const solutionTransferHandlers = [
  graphql.query<GetSolutionTransferInfoQuery, GetSolutionTransferInfoQueryVariables>('GetSolutionTransferInfo', () => {
    return HttpResponse.json(
      { data: { solutions: solutionRepository.findAll().filter((soln) => soln.enabled) } },
      { status: 200 }
    );
  }),

  graphql.mutation<PerformSolutionTransferMutation, PerformSolutionTransferMutationVariables>(
    'PerformSolutionTransfer',
    ({ variables }) => {
      const confirmedLabwares = variables.request.labware.map((confirmLabware) => {
        const labware = createLabware(confirmLabware.barcode);
        return buildLabwareFragment(labware);
      });

      return HttpResponse.json(
        { data: { performSolutionTransfer: { labware: confirmedLabwares, operations: [] } } },
        { status: 200 }
      );
    }
  )
];

export default solutionTransferHandlers;
