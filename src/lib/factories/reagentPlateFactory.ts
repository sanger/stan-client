import { Factory } from 'fishery';
import { ReagentPlateFieldsFragment } from '../../types/sdk';
import { slotFactory } from './slotFactory';

export default Factory.define<ReagentPlateFieldsFragment>(({ params }) => ({
  __typename: 'ReagentPlate',
  barcode: params.barcode ?? '543767897643212345678652',
  plateType: params.plateType ?? 'Dual Index TT Set A',
  numRows: params.numRows ?? 8,
  numColumns: params.numColumns ?? 12,
  slots:
    params.slots ??
    slotFactory.buildList(96).map((_slot, index) => ({
      address: `${String.fromCharCode(65 + Math.floor(index / 12))}${(index % 12) + 1}`,
      used: false
    }))
}));
