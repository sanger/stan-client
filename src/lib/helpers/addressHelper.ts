import { GridDirection } from '../../types/sdk';
import { orderBy } from 'lodash';
import { getColumnIndex, getRowIndex } from './labwareHelper';

/**
 * Sort a list of addresses by the direction given
 * @param addresses list of addresses
 * @param direction a {@link GridDirection}
 */
export function sortWithDirection(addresses: Array<string>, direction: GridDirection): Array<string> {
  const byColumnIndex = (address: string) => getColumnIndex(address);
  const byRowIndex = (address: string) => getRowIndex(address);

  const iteratees = direction === GridDirection.DownRight ? [byColumnIndex, byRowIndex] : [byRowIndex, byColumnIndex];

  return orderBy(addresses, iteratees, ['asc', 'asc']);
}
