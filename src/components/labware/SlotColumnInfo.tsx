import { SlotFieldsFragment } from '../../types/sdk';
import React from 'react';

/***
 * Component to display a column of slot fields that contains a label with slot address and component returned by SlotBuilder callback
 */
const SlotColumnInfo = ({
  slotColumn,
  slotBuilder,
  numRows,
  alignRight = false
}: {
  slotColumn: SlotFieldsFragment[];
  slotBuilder: (slot: SlotFieldsFragment) => React.ReactNode;
  numRows: number;
  alignRight?: boolean;
}) => {
  const gridClasses = `px-10 pt-4 gap-4 content-center grid grid-rows-${numRows} grid-cols-1 py-4 select-none`;
  return (
    <div className={gridClasses}>
      {slotColumn.map((slot) => (
        <div key={slot.address}>
          <div className={`flex flex-col ${alignRight && 'items-end'} font-medium`}>{slot.address}</div>
          <div className={'flex'}>{slotBuilder(slot)}</div>
        </div>
      ))}
    </div>
  );
};
export default SlotColumnInfo;
