import React, { useEffect, useImperativeHandle } from "react";
import classNames from "classnames";
import BarcodeIcon from "../icons/BarcodeIcon";
import { Slot } from "./Slot";
import { buildAddresses } from "../../lib/helpers";
import _ from "lodash";
import { LabwareFieldsFragment, SlotFieldsFragment } from "../../types/graphql";
import createLabwareMachine from "./labware.machine";
import { Selectable, SelectionMode } from "./labware.types";
import { usePresentationModel } from "../../lib/hooks";
import LabwarePresentationModel from "./labwarePresentationModel";
import { NewLabwareLayout } from "../../types/stan";

export interface LabwareProps {
  /**
   * The labware to display. May be a new piece of labware not yet persisted on core.
   */
  labware: LabwareFieldsFragment | NewLabwareLayout;

  /**
   * (Optional) Name to be displayed on the labware
   */
  name?: string;

  /**
   * Callback for when the labware is clicked
   */
  onClick?: () => void;

  /**
   * What selection mode should the labware be in? This parameter is ignored if `selectable` is `none`.
   *
   * <ul>
   *   <li>`single` - only a single slot can be selected at once</li>
   *   <li>`multi` - multiple slots can be selected at once</li>
   * </ul>
   */
  selectionMode?: SelectionMode;

  /**
   * Which slots are allowed to be selected?
   * <ul>
   *   <li>`none` - No slots can be selected</li>
   *   <li>`any` - Any slots can be selected</li>
   *   <li>`non_empty` - Only slots with samples in can be selected</li>
   *   <li>`empty` - Only slots without samples in can be selected</li>
   * </ul>
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
   * Callback to customise the secondary text for an individual slot. Secondary text appears under slotText.
   * @param address the address of the slot to customise secondary text of
   * @param slot the slot
   */
  slotSecondaryText?: (
    address: string,
    slot: SlotFieldsFragment
  ) => string | undefined;

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

/**
 * Component for displaying an individual piece of labware and its slots.
 *
 * Labware will contain a grid of slots, each of which can hold zero to many samples. The colour and text of each slot
 * can be controlled with callbacks to `slotColor` and `slotText`.
 *
 * Selection of slots can be controlled with the `selectionMode` and `selectable` parameters. See the params for more details.
 */
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
  slotSecondaryText,
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
        {buildAddresses({ numColumns, numRows }).map((address, i) => (
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
            secondaryText={slotSecondaryText}
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
