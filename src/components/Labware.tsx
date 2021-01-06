import React from "react";
import { Slot as SlotModel } from "../types/graphql";
import classNames from "classnames";
import { NewLabwareLayout } from "../types/stan";
import BarcodeIcon from "./icons/BarcodeIcon";
import { rowMajor } from "../lib/helpers/labwareHelper";

interface LabwareProps {
  labware: NewLabwareLayout;
  onClick?: (labware: NewLabwareLayout) => void;
  onSlotClick?: (slot: NewLabwareLayout["slots"][number]) => void;
  slotText?: (slot: NewLabwareLayout["slots"][number]) => string | undefined;
  slotColor?: (slot: NewLabwareLayout["slots"][number]) => string | undefined;
}

const Labware: React.FC<LabwareProps> = ({
  labware,
  onClick,
  onSlotClick,
  slotText,
  slotColor,
}) => {
  const { labwareType } = labware;

  const labwareClasses = classNames(
    {
      "hover:bg-blue-200 cursor-pointer": !!onClick,
    },
    "w-48 bg-blue-100 rounded-lg transition duration-300 ease-in-out"
  );

  const slotGrid = classNames(
    {
      "grid-rows-1": labwareType.numRows === 1,
      "grid-rows-2": labwareType.numRows === 2,
      "grid-rows-3": labwareType.numRows === 3,
      "grid-rows-4": labwareType.numRows === 4,
      "grid-rows-5": labwareType.numRows === 5,
      "grid-rows-6": labwareType.numRows === 6,
      "grid-cols-1": labwareType.numColumns === 1,
      "grid-cols-2": labwareType.numColumns === 2,
    },
    "py-4 px-2 grid gap-4"
  );

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
}

const Slot: React.FC<SlotParams> = ({ slot, onClick, color, text }) => {
  const slotText = (text && text(slot)) ?? defaultSlotText(slot);
  const bgColor = color && color(slot);

  const slotClassNames = classNames(
    {
      "transition duration-150 ease-in-out cursor-pointer": onClick,
      "hover:bg-gray-200": onClick && !bgColor,
      [`hover:bg-${bgColor}-700`]: onClick && bgColor,
      [`bg-${bgColor}-600 text-gray-100`]: bgColor,
      "text-gray-800": !bgColor,
    },
    "border border-gray-800 inline-flex items-center justify-center mx-auto h-20 w-20 bg-gray-100 rounded-full text-xs font-semibold"
  );

  return (
    <span onClick={() => onClick && onClick(slot)} className={slotClassNames}>
      {slotText}
    </span>
  );
};
