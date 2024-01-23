import {
  AddSlotRegionMutation,
  AddSlotRegionMutationVariables,
  SetSlotRegionEnabledMutation,
  SetSlotRegionEnabledMutationVariables,
  GetSlotRegionsQuery,
  GetSlotRegionsQueryVariables
} from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';
import slotRegionFactory from '../../lib/factories/slotRegionFactory';
import slotRegionRepository from '../repositories/slotRegionRepository';
import { isEnabled } from '../../lib/helpers';

const slotRegionHandlers = [
  graphql.query<GetSlotRegionsQuery, GetSlotRegionsQueryVariables>('GetSlotRegions', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          slotRegions: slotRegionRepository
            .findAll()
            .filter((slotRegion) => variables.includeDisabled || isEnabled(slotRegion))
        }
      },
      { status: 200 }
    );
  }),
  graphql.mutation<AddSlotRegionMutation, AddSlotRegionMutationVariables>('AddSlotRegion', ({ variables }) => {
    const addSlotRegion = slotRegionFactory.build({
      name: variables.name
    });
    slotRegionRepository.save(addSlotRegion);
    return HttpResponse.json({ data: { addSlotRegion } }, { status: 200 });
  }),
  graphql.mutation<SetSlotRegionEnabledMutation, SetSlotRegionEnabledMutationVariables>(
    'SetSlotRegionEnabled',
    ({ variables }) => {
      const slotRegion = slotRegionRepository.find('name', variables.name);
      if (slotRegion) {
        slotRegion.enabled = variables.enabled;
        slotRegionRepository.save(slotRegion);
        return HttpResponse.json({ data: { setSlotRegionEnabled: slotRegion } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Slot region: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default slotRegionHandlers;
