import { Factory } from 'fishery';
import { CellClass } from '../../types/sdk';

export default Factory.define<CellClass>(({ params, sequence }) => ({
  __typename: 'CellClass',
  name: params.name ?? `Cell Class ${sequence}`,
  enabled: params.enabled ?? true
}));
