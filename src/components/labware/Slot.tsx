import React from "react";
import classNames from "classnames";
import { brightenColor } from "../../lib/helpers/tailwindHelper";
import { LabwareProps } from "./Labware";
import { SlotFieldsFragment } from "../../types/graphql";

type SlotProps = {
  address: string;
  slot: SlotFieldsFragment;
  size: "small" | "large";
  onClick?: (address: string, slot: SlotFieldsFragment) => void;
  onCtrlClick?: (address: string, slot: SlotFieldsFragment) => void;
  onShiftClick?: (address: string, slot: SlotFieldsFragment) => void;
  onMouseEnter?: LabwareProps["onSlotMouseEnter"];
  onMouseLeave?: LabwareProps["onSlotMouseLeave"];
  color?: LabwareProps["slotColor"];
  text?: LabwareProps["slotText"];
  selected: boolean;
};

export function Slot({
  address,
  slot,
  size,
  onClick,
  onCtrlClick,
  onShiftClick,
  onMouseEnter,
  onMouseLeave,
  color,
  text,
  selected,
}: SlotProps) {
  const slotText = (text && text(address, slot)) ?? address;
  const bgColor = color && color(address, slot);

  const slotClassNames = classNames(
    {
      "transition duration-150 ease-in-out cursor-pointer": onClick,
      "hover:bg-gray-200": onClick && !bgColor,
      [`hover:bg-${brightenColor(bgColor)}`]: onClick && bgColor,
      [`bg-${bgColor} text-gray-100`]: bgColor,
      "bg-gray-100 text-gray-800": !bgColor,
      "ring ring-pink-600 ring-offset-2": selected,
      "border border-gray-800": !selected,
      "h-20 w-20": size === "large",
      "h-12 w-12": size === "small",
    },
    "inline-flex items-center justify-center mx-auto rounded-full text-xs font-semibold"
  );

  const onClickHandler = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.shiftKey) {
        onShiftClick?.(address, slot);
      } else if (e.ctrlKey || e.metaKey) {
        onCtrlClick?.(address, slot);
      } else {
        onClick?.(address, slot);
      }
    },
    [onClick, onCtrlClick, onShiftClick, address, slot]
  );

  const onMouseEnterHandler = React.useCallback(() => {
    onMouseEnter?.(address, slot);
  }, [onMouseEnter, address, slot]);

  const onMouseLeaveHandler = React.useCallback(() => {
    onMouseLeave?.(address, slot);
  }, [onMouseLeave, address, slot]);

  return (
    <div
      onClick={onClickHandler}
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
      className={slotClassNames}
    >
      <p className="truncate">{slotText}</p>
    </div>
  );
}
