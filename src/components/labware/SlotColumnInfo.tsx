import { SlotFieldsFragment } from '../../types/sdk';
import React from 'react';

/***
 * Component to display a column of slot fields that contains a label with slot address and component returned by SlotBuilder callback
 */
const SlotColumnInfo = ({
  slotColumn,
  slotBuilder,
  alignRight = false,
  dataTestid
}: {
  slotColumn: SlotFieldsFragment[];
  slotBuilder: (slot: SlotFieldsFragment) => React.ReactNode;
  numRows: number;
  alignRight?: boolean;
  dataTestid?: string;
}) => {
  const gridClasses = 'flex flex-col px-8 py-2 select-none';
  return (
    <div data-testid={dataTestid ?? ''} className={gridClasses}>
      {slotColumn.map((slot) => (
        <div key={slot.address} data-testid="slot-address">
          <div className={`flex flex-col ${alignRight && 'items-end'} font-medium`}>{slot.address}</div>
          <div className={'flex'}>{slotBuilder(slot)}</div>
        </div>
      ))}
    </div>
  );
};
export default SlotColumnInfo;
