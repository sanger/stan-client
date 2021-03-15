import React, { useEffect, useImperativeHandle } from "react";
import classNames from "classnames";
import BarcodeIcon from "../icons/BarcodeIcon";
import { Slot } from "./Slot";
import { genAddresses } from "../../lib/helpers";
import _ from "lodash";
import { LabwareLayoutFragment, SlotFieldsFragment } from "../../types/graphql";
import createLabwareMachine from "./labware.machine";
import { Selectable, SelectionMode } from "./labware.types";
import { usePresentationModel } from "../../lib/hooks";
import LabwarePresentationModel from "./labwarePresentationModel";
import { NewLabwareLayout } from "../../types/stan";

export interface LabwareProps {
  /**
   * The labware to display. May be a new piece of labware not yet persisted on core.
   */
  labware: LabwareLayoutFragment | NewLabwareLayout;

  /**
   * (Optional) Name to be displayed on the labware
   */
  name?: string;

  /**
   * Callback for when the labware is clicked
   */
  onClick?: () => void;

  /**
   * What selection mode should the labware be in
   */
  selectionMode?: SelectionMode;

  /**
   * Which slots are allowed to be selected?
   * This is ignored when SelectionMode is NONE
   */
  selectable?: Selectable;

  /**
   * Callback for when a slot is clicked
   * @param address the address of the clicked slot
   * @param slot the slot
   */
  onSlotClick?: (address: string, slot: SlotFieldsFragment) => void;

  /**
   * Callback for when slots are selected
   * @param selected the addresses of the selected slots
   */
  onSelect?: (selected: Array<string>) => void;

  /**
   * Callback for when the mouse first hovers over a slot
   * @param address the address of the slot
   * @param slot the slot
   */
  onSlotMouseEnter?: (address: string, slot: SlotFieldsFragment) => void;

  /**
   * Callback for when the mouse moves off a slot
   * @param address the address of the slot
   * @param slot the slot
   */
  onSlotMouseLeave?: (address: string, slot: SlotFieldsFragment) => void;

  /**
   * Callback to customise the text for an individual slot
   * @param address the address of the slot to customise text of
   * @param slot the slot
   */
  slotText?: (address: string, slot: SlotFieldsFragment) => string | undefined;

  /**
   * Callback to customise the text for an individual slot
   * @param address the address of the slot
   * @param slot the slot
   */
  slotColor?: (address: string, slot: SlotFieldsFragment) => string | undefined;

  labwareRef?: React.RefObject<LabwareImperativeRef>;
}

export type LabwareImperativeRef = {
  deselectAll: () => void;
};

const Labware = ({
  labware,
  onClick,
  onSlotClick,
  selectionMode = "single",
  selectable = "none",
  name,
  onSelect,
  onSlotMouseEnter,
  onSlotMouseLeave,
  slotText,
  slotColor,
  labwareRef,
}: React.PropsWithChildren<LabwareProps>) => {
  const model = usePresentationModel(
    createLabwareMachine({
      selectionMode,
      selectable,
      slots: labware.slots,
    }),
    (current, service) => new LabwarePresentationModel(current, service)
  );

  const {
    labwareType: { numRows, numColumns },
    slots,
    barcode,
  } = labware;

  useImperativeHandle(labwareRef, () => ({
    deselectAll: () => model.resetSelected(),
  }));

  const setSelectionMode = model.setSelectionMode;
  useEffect(() => {
    setSelectionMode(selectionMode, selectable);
  }, [setSelectionMode, selectionMode, selectable]);

  const updateSlots = model.updateSlots;
  useEffect(() => {
    updateSlots(slots ?? []);
  }, [updateSlots, slots]);

  useEffect(() => {
    onSelect?.(Array.from(model.context.selectedAddresses));
  }, [onSelect, model.context.selectedAddresses]);

  const labwareClasses =
    "inline-block py-2 bg-blue-100 rounded-lg transition duration-300 ease-in-out";

  const gridClasses = classNames(
    {
      "px-12 gap-4": numColumns <= 6,
      "px-6 gap-2": numColumns > 6,
    },
    `grid grid-rows-${numRows} grid-cols-${numColumns} py-4 select-none`
  );

  const slotByAddress = _.keyBy(slots, "address");

  const modelOnClick = model.onClick;
  const internalOnClick = React.useCallback(
    (address: string, slot: SlotFieldsFragment) => {
      onSlotClick?.(address, slot);
      modelOnClick(address);
    },
    [onSlotClick, modelOnClick]
  );

  return (
    <div onClick={() => onClick?.()} className={labwareClasses}>
      <div className={gridClasses}>
        {Array.from(genAddresses({ numColumns, numRows })).map((address, i) => (
          <Slot
            key={i}
            address={address}
            slot={slotByAddress[address]}
            size={numColumns > 6 || numRows > 6 ? "small" : "large"}
            onClick={internalOnClick}
            onCtrlClick={model.onCtrlClick}
            onShiftClick={model.onShiftClick}
            onMouseEnter={onSlotMouseEnter}
            onMouseLeave={onSlotMouseLeave}
            text={slotText}
            color={slotColor}
            selected={model.isSlotSelected(address)}
          />
        ))}
      </div>

      <div className="flex flex-col items-start justify-between py-1 px-2 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
        {name && <span>{name}</span>}
        {barcode && (
          <span className="inline-flex">
            <BarcodeIcon className="mr-1 h-4 w-4 text-gray-500" />
            {barcode}
          </span>
        )}
      </div>
    </div>
  );
};

export default Labware;
