import React from "react";
import { SlotFieldsFragment } from "../../types/sdk";
import Labware, { LabwareProps } from "../labware/Labware";
import classNames from "classnames";

type LabwareSlotsProps = LabwareProps & {
  /**
   * A callback that will be called for each slot in the labware. Must return a react component that will be placed
   * in the labelled slot beside the component
   * @param slot a slot on the given labware
   */
  slotBuilder: (slot: SlotFieldsFragment) => React.ReactNode;
};

/**
 * Component to display a labware along with its slots
 *
 * @example
 * <LabwareSlots
 *   labware={slideLabware}
 *   slotBuilder={(slot) => {
 *     return <p>This is slot {slot.address}</p>;
 *   }}
 * />
 */
export default function LabwareSlots({
  labware,
  slotBuilder,
}: LabwareSlotsProps) {
  const numColumns = labware.labwareType.numColumns;
  const numRows = labware.labwareType.numRows;

  /**
   * The labware to display must be a labware with up to two columns e.g. slides, tube.
   * If a labware with more than 2 columns is given, there will be a {@code console.error}, and the component will
   * render nothing.
   */
  if (numColumns > 2) {
    console.log(
      "Warning: Cannot display a labware having more than two columns"
    );
    return <></>;
  }

  const gridClasses = classNames(
    `px-10 pt-4 gap-4 content-center grid grid-rows-${numRows} grid-cols-1 py-4 select-none`
  );

  /***
   * Display a column of slots
   */
  const SlotColumns = ({
    slots,
    alignRight,
  }: {
    slots: SlotFieldsFragment[];
    alignRight: boolean;
  }) => {
    return (
      <div className={gridClasses}>
        {slots.map((slot) => (
          <SlotField slot={slot} alignRight={alignRight} />
        ))}
      </div>
    );
  };
  /***
   * Display a slot field - contains a label with slot address and component returned by slotBuilder callback
   * @param slot Slot to display
   * @param alignRight alignment direction
   * @constructor
   */

  const SlotField = ({
    slot,
    alignRight,
  }: {
    slot: SlotFieldsFragment;
    alignRight: boolean;
  }) => {
    return (
      <div className={`flex flex-col ${alignRight && "items-end"}`}>
        <div className={"flex "}>{slot.address}</div>
        <div className={"flex"}>{slotBuilder(slot)}</div>
      </div>
    );
  };

  /***
   * This restores the columnLayout for the slots which converts an array of slots to column-wise array depending on the layout
   * @param slots Array of slots in labware
   * @param numColumns Number of columns in labware type
   */
  const createColumnLayoutForSlots = (
    slots: SlotFieldsFragment[],
    numColumns: number
  ): Array<SlotFieldsFragment>[] => {
    const slotColumns: Array<SlotFieldsFragment[]> = new Array<
      SlotFieldsFragment[]
    >(numColumns);
    slots.map((slot, index) => {
      const colIndex = index % numColumns;
      if (!slotColumns[colIndex])
        slotColumns[colIndex] = new Array<SlotFieldsFragment>();
      slotColumns[index % numColumns].push(slot);
    });
    return slotColumns;
  };

  const slotColumns = createColumnLayoutForSlots(labware.slots, numColumns);

  return (
    <div className={"flex flex-row"}>
      <SlotColumns slots={slotColumns[0]} alignRight={false} />
      <Labware labware={labware} />
      {numColumns === 2 && (
        <SlotColumns slots={slotColumns[1]} alignRight={true} />
      )}
    </div>
  );
}
