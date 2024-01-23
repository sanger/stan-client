import { graphql, HttpResponse } from 'msw';
import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  GetSectioningConfirmInfoQuery,
  GetSectioningConfirmInfoQueryVariables,
  GetSectioningInfoQuery,
  GetSectioningInfoQueryVariables
} from '../../types/sdk';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import commentRepository from '../repositories/commentRepository';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import { createLabware } from './labwareHandlers';
import slotRegionRepository from '../repositories/slotRegionRepository';

const sectioningHandlers = [
  graphql.query<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>('GetSectioningInfo', ({ variables }) => {
    return HttpResponse.json({ data: { labwareTypes: labwareTypeInstances } }, { status: 200 });
  }),

  graphql.query<GetSectioningConfirmInfoQuery, GetSectioningConfirmInfoQueryVariables>(
    'GetSectioningConfirmInfo',
    () => {
      return HttpResponse.json(
        {
          data: {
            comments: commentRepository.findAll().filter((c) => c.category === 'section'),
            slotRegions: slotRegionRepository.findAll().filter((slotRegion) => slotRegion.enabled)
          }
        },
        { status: 200 }
      );
    }
  ),

  graphql.mutation<ConfirmSectionMutation, ConfirmSectionMutationVariables>('ConfirmSection', ({ variables }) => {
    const confirmedLabwares = variables.request.labware.map((confirmLabware) => {
      const labware = createLabware(confirmLabware.barcode);
      return buildLabwareFragment(labware);
    });
    return HttpResponse.json(
      { data: { confirmSection: { labware: confirmedLabwares, operations: [] } } },
      { status: 200 }
    );
  })
];

export default sectioningHandlers;
