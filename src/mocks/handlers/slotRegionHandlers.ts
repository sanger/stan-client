import {
  AddSlotRegionMutation,
  AddSlotRegionMutationVariables,
  SetSlotRegionEnabledMutation,
  SetSlotRegionEnabledMutationVariables,
  GetSlotRegionsQuery,
  GetSlotRegionsQueryVariables
} from '../../types/sdk';
import { graphql } from 'msw';
import slotRegionFactory from '../../lib/factories/slotRegionFactory';
import slotRegionRepository from '../repositories/slotRegionRepository';
import { isEnabled } from '../../lib/helpers';

const slotRegionHandlers = [
  graphql.query<GetSlotRegionsQuery, GetSlotRegionsQueryVariables>('GetSlotRegions', (req, res, ctx) => {
    return res(
      ctx.data({
        slotRegions: slotRegionRepository
          .findAll()
          .filter((slotRegion) => req.variables.includeDisabled || isEnabled(slotRegion))
      })
    );
  }),
  graphql.mutation<AddSlotRegionMutation, AddSlotRegionMutationVariables>('AddSlotRegion', (req, res, ctx) => {
    const addSlotRegion = slotRegionFactory.build({
      name: req.variables.name
    });
    slotRegionRepository.save(addSlotRegion);
    return res(ctx.data({ addSlotRegion }));
  }),
  graphql.mutation<SetSlotRegionEnabledMutation, SetSlotRegionEnabledMutationVariables>(
    'SetSlotRegionEnabled',
    (req, res, ctx) => {
      const slotRegion = slotRegionRepository.find('name', req.variables.name);
      if (slotRegion) {
        slotRegion.enabled = req.variables.enabled;
        slotRegionRepository.save(slotRegion);
        return res(ctx.data({ setSlotRegionEnabled: slotRegion }));
      } else {
        return res(
          ctx.errors([
            {
              message: `Could not find Slot region: "${req.variables.name}"`
            }
          ])
        );
      }
    }
  )
];

export default slotRegionHandlers;
