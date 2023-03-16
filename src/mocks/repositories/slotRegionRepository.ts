import { SlotRegionFieldsFragment } from '../../types/sdk';
import slotRegionFactory from '../../lib/factories/slotRegionFactory';
import { createSessionStorageRepository } from './index';
const seeds: Array<SlotRegionFieldsFragment> = [
  slotRegionFactory.build({ name: 'Top Left', enabled: true }),
  slotRegionFactory.build({ name: 'Top Right', enabled: true }),
  slotRegionFactory.build({ name: 'Bottom Left', enabled: true }),
  slotRegionFactory.build({ name: 'Bottom Right', enabled: true }),
  slotRegionFactory.build({ name: 'Middle', enabled: true }),
  slotRegionFactory.build({ name: 'Top', enabled: true }),
  slotRegionFactory.build({ name: 'Bottom', enabled: true }),
  slotRegionFactory.build({ name: 'Left', enabled: true }),
  slotRegionFactory.build({ name: 'Right', enabled: true })
];
const slotRegionRepository = createSessionStorageRepository('SLOT REGION', 'name', seeds);
export default slotRegionRepository;
