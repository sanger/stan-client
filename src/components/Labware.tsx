import React from "react";
import {
  LabwareLayoutFragment as LabwareLayout,
  Slot as SlotModel,
} from "../types/graphql";
import classNames from "classnames";
import { Nullable } from "../types/stan";

type UnregisteredLabwareLayout = Nullable<LabwareLayout, "id" | "barcode">;

interface LabwareProps {
  labware: UnregisteredLabwareLayout;
  onClick?: (labware: UnregisteredLabwareLayout) => void;
  onSlotClick?: (slot: UnregisteredLabwareLayout["slots"][number]) => void;
  slotText?: (
    slot: UnregisteredLabwareLayout["slots"][number]
  ) => string | undefined;
  slotColor?: (
    slot: UnregisteredLabwareLayout["slots"][number]
  ) => string | undefined;
}

const Labware: React.FC<LabwareProps> = ({
  labware,
  onClick,
  onSlotClick,
  slotText,
  slotColor,
}) => {
  const { labwareType } = labware;

  const labwareClassNames = classNames(
    {
      "grid-rows-1": labwareType.numRows === 1,
      "grid-rows-2": labwareType.numRows === 2,
      "grid-rows-3": labwareType.numRows === 3,
      "grid-rows-4": labwareType.numRows === 4,
      "grid-rows-5": labwareType.numRows === 5,
      "grid-rows-6": labwareType.numRows === 6,
      "grid-cols-1": labwareType.numColumns === 1,
      "grid-cols-2": labwareType.numColumns === 2,
      "hover:bg-blue-200 cursor-pointer": !!onClick,
    },
    "py-8 px-2 grid grid-flow-col gap-4 bg-blue-100 rounded-lg transition duration-300 ease-in-out"
  );

  return (
    <div className="w-48">
      <div
        className={labwareClassNames}
        onClick={() => onClick && onClick(labware)}
      >
        {labware.slots.map((slot, i) => (
          <Slot
            key={i}
            slot={slot}
            onClick={onSlotClick}
            text={slotText}
            color={slotColor}
          />
        ))}
      </div>
    </div>
  );
};

export default Labware;

function defaultSlotText(slot: Pick<SlotModel, "address">) {
  return slot.address;
}

interface SlotParams {
  slot: UnregisteredLabwareLayout["slots"][number];
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
    "border border-gray-500 inline-flex items-center justify-center mx-auto h-20 w-20 bg-gray-100 rounded-full text-xs font-semibold"
  );

  return (
    <span onClick={() => onClick && onClick(slot)} className={slotClassNames}>
      {slotText}
    </span>
  );
};
