import React from "react";
import { Slot as SlotModel } from "../types/graphql";
import classNames from "classnames";
import { NewLabwareLayout } from "../types/stan";
import BarcodeIcon from "./icons/BarcodeIcon";
import { rowMajor } from "../lib/helpers/labwareHelper";
import { brightenColor } from "../lib/helpers/tailwindHelper";

interface LabwareProps {
  labware: NewLabwareLayout;
  onClick?: (labware: NewLabwareLayout) => void;
  onSlotClick?: (slot: NewLabwareLayout["slots"][number]) => void;
  slotText?: (slot: NewLabwareLayout["slots"][number]) => string | undefined;
  slotColor?: (slot: NewLabwareLayout["slots"][number]) => string | undefined;
  slotSelected?: (slot: NewLabwareLayout["slots"][number]) => boolean;
  className?: string;
}

const Labware: React.FC<LabwareProps> = ({
  labware,
  onClick,
  onSlotClick,
  slotText,
  slotColor,
  slotSelected,
  className = "",
}) => {
  const { labwareType } = labware;

  const labwareClasses = classNames(
    {
      "hover:bg-blue-200 cursor-pointer": !!onClick,
    },
    `w-48 bg-blue-100 rounded-lg transition duration-300 ease-in-out ${className}`
  );

  const slotGrid = `grid grid-rows-${labwareType.numRows} grid-cols-${labwareType.numColumns} py-4 px-2 gap-4`;

  return (
    <div className={labwareClasses}>
      <div className={slotGrid} onClick={() => onClick && onClick(labware)}>
        {rowMajor(labware.slots).map((slot, i) => (
          <Slot
            key={i}
            slot={slot}
            onClick={onSlotClick}
            text={slotText}
            color={slotColor}
            selected={slotSelected}
          />
        ))}
      </div>

      <div className="flex flex-col items-start justify-between py-1 px-2 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
        <span>{labware.labwareType.name}</span>
        {labware.barcode && (
          <span className="inline-flex">
            <BarcodeIcon className="mr-1 h-4 w-4 text-gray-500" />
            {labware.barcode}
          </span>
        )}
      </div>
    </div>
  );
};

export default Labware;

function defaultSlotText(slot: Pick<SlotModel, "address">) {
  return slot.address;
}

interface SlotParams {
  slot: NewLabwareLayout["slots"][number];
  onClick?: LabwareProps["onSlotClick"];
  color?: LabwareProps["slotColor"];
  text?: LabwareProps["slotText"];
  selected?: LabwareProps["slotSelected"];
}

const Slot: React.FC<SlotParams> = ({
  slot,
  onClick,
  color,
  text,
  selected,
}) => {
  const slotText = (text && text(slot)) ?? defaultSlotText(slot);
  const bgColor = color && color(slot);
  const slotSelected = !!selected ? selected(slot) : false;

  const slotClassNames = classNames(
    {
      "transition duration-150 ease-in-out cursor-pointer": onClick,
      "hover:bg-gray-200": onClick && !bgColor,
      [`hover:bg-${brightenColor(bgColor)}`]: onClick && bgColor,
      [`bg-${bgColor} text-gray-100`]: bgColor,
      "bg-gray-100 text-gray-800": !bgColor,
      "ring ring-pink-600 ring-offset-2": slotSelected,
      "border border-gray-800": !slotSelected,
    },
    "inline-flex items-center justify-center mx-auto h-20 w-20 rounded-full text-xs font-semibold"
  );

  return (
    <div onClick={() => onClick && onClick(slot)} className={slotClassNames}>
      <p className="truncate">{slotText}</p>
    </div>
  );
};
