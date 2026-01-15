import React from 'react';
import classNames from 'classnames';
import { brightenColor } from '../../lib/helpers/tailwindHelper';
import { LabwareProps } from './Labware';
import { SlotFieldsFragment } from '../../types/sdk';
import CrossOverIcon from '../icons/CrossOverIcon';

type SlotProps = {
  address: string;
  slot: SlotFieldsFragment;
  slotSizeProps: { size: string; parentDivSize: string; textSize: string };
  onClick?: (address: string, slot: SlotFieldsFragment) => void;
  onCtrlClick?: (address: string, slot: SlotFieldsFragment) => void;
  onShiftClick?: (address: string, slot: SlotFieldsFragment) => void;
  onMouseEnter?: LabwareProps['onSlotMouseEnter'];
  onMouseLeave?: LabwareProps['onSlotMouseLeave'];
  color?: LabwareProps['slotColor'];
  text?: LabwareProps['slotText'];
  secondaryText?: LabwareProps['slotSecondaryText'];
  selected: boolean;
  isCleanedOut?: boolean;
};

export function Slot({
  address,
  slot,
  slotSizeProps,
  onClick,
  onCtrlClick,
  onShiftClick,
  onMouseEnter,
  onMouseLeave,
  color,
  text,
  secondaryText,
  selected,
  isCleanedOut
}: SlotProps) {
  const slotText = (text && text(address, slot)) ?? address;
  const slotSecondaryText = (secondaryText && secondaryText(address, slot)) ?? null;
  const bgColor = color && color(address, slot);

  const slotClassNames = classNames(
    {
      'transition duration-150 ease-in-out cursor-pointer': onClick && !isCleanedOut,
      'hover:bg-gray-200': onClick && !bgColor && !isCleanedOut,
      [`hover:${brightenColor(bgColor)}`]: onClick && bgColor && !isCleanedOut,
      [`${bgColor} text-gray-100`]: bgColor,
      'bg-gray-100 text-gray-800': !bgColor,
      'ring-3 ring-pink-600 ring-offset-2': selected,
      'border border-gray-800': !selected
    },
    `${slotSizeProps.size} ${slotSizeProps.textSize} inline-flex flex-col items-center justify-center mx-auto rounded-full font-semibold`
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

  return isCleanedOut ? (
    <div
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
      className={slotClassNames}
      data-testid={'slot'}
    >
      <CrossOverIcon />
      {secondaryText && <p className="truncate">{slotSecondaryText}</p>}
    </div>
  ) : (
    <div
      onClick={onClickHandler}
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
      className={slotClassNames}
      data-testid={'slot'}
    >
      <p className="truncate">{slotText}</p>
      {secondaryText && <p className="truncate">{slotSecondaryText}</p>}
    </div>
  );
}
