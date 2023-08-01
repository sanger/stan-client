import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import classNames from 'classnames';
import BarcodeIcon from '../icons/BarcodeIcon';
import { Slot } from './Slot';
import { buildAddresses, isSameArray } from '../../lib/helpers';
import _ from 'lodash';
import { LabwareFieldsFragment, SlotFieldsFragment } from '../../types/sdk';
import createLabwareMachine from './labware.machine';
import { Selectable, SelectionMode } from './labware.types';
import { NewLabwareLayout } from '../../types/stan';
import { useMachine } from '@xstate/react';
import * as slotHelper from '../../lib/helpers/slotHelper';
import SlotColumnInfo from './SlotColumnInfo';

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
   * Callback for when a slot is clicked with Ctrl button held
   * @param address the address of the clicked slot
   * @param slot the slot
   */
  onSlotCtrlClick?: (address: string, slot: SlotFieldsFragment) => void;

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
  slotSecondaryText?: (address: string, slot: SlotFieldsFragment) => string | undefined;

  /**
   * Callback to customise the text for an individual slot
   * @param address the address of the slot
   * @param slot the slot
   */
  slotColor?: (address: string, slot: SlotFieldsFragment) => string | undefined;

  labwareRef?: React.RefObject<LabwareImperativeRef>;

  /**
   * A callback that will be called for each slot in the labware. Must return a react component that will be placed
   * in the labelled slot beside the component
   * @param slot a slot on the given labware
   */
  slotBuilder?: (slot: SlotFieldsFragment) => React.ReactNode;
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
  onSlotCtrlClick,
  selectionMode = 'single',
  selectable = 'none',
  name,
  onSelect,
  onSlotMouseEnter,
  onSlotMouseLeave,
  slotText,
  slotSecondaryText,
  slotColor,
  labwareRef,
  slotBuilder
}: React.PropsWithChildren<LabwareProps>) => {
  const labwareMachine = React.useMemo(() => {
    return createLabwareMachine();
  }, []);
  const [current, send] = useMachine(labwareMachine, {
    context: {
      selectionMode,
      selectable,
      slots: labware.slots
    }
  });
  const { selectedAddresses } = current.context;
  const selectedAddressesRef = React.useRef<Set<string>>();
  debugger;
  const {
    labwareType: { numRows, numColumns },
    slots,
    barcode
  } = labware;

  useImperativeHandle(labwareRef, () => ({
    deselectAll: () => send({ type: 'RESET_SELECTED' })
  }));

  useEffect(() => {
    send({
      type: 'CHANGE_SELECTION_MODE',
      selectionMode,
      selectable
    });
  }, [send, selectionMode, selectable]);

  useEffect(() => {
    send({ type: 'UPDATE_SLOTS', slots: slots ?? [] });
  }, [send, slots]);

  /**When ever selected address changes, a callback is invoked**/
  useEffect(() => {
    //Make sure that there is a change in selected addresses, if not don't call the callback function
    if (
      selectedAddressesRef.current &&
      isSameArray(Array.from(selectedAddresses), Array.from(selectedAddressesRef.current))
    ) {
      return;
    }
    selectedAddressesRef.current = selectedAddresses;
    onSelect?.(Array.from(selectedAddresses));
  }, [onSelect, selectedAddresses]);

  const labwareClasses =
    'inline-block border border-sdb py-2 bg-blue-100 rounded-lg transition duration-300 ease-in-out';

  const gridClasses = classNames(
    {
      'px-12 gap-4': numColumns <= 3,
      'px-10 gap-3': numColumns <= 5,
      'px-6 gap-2': numColumns > 6
    },
    `grid grid-rows-${numRows} grid-cols-${numColumns} py-4 select-none`
  );

  // Give slots some default styles if some haven't been passed in
  const _slotColor =
    slotColor ??
    ((address, slot) => {
      if (slotHelper.hasMultipleSamples(slot)) {
        return 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500';
      } else if (slotHelper.isSlotFilled(slot)) {
        return 'bg-sdb-300';
      }
    });

  const slotByAddress = _.keyBy(slots, 'address');

  const internalOnClick = React.useCallback(
    (address: string, slot: SlotFieldsFragment) => {
      onSlotClick?.(address, slot);
      send({ type: 'SELECT_SLOT', address });
    },
    [onSlotClick, send]
  );

  const onCtrlClick = useCallback(
    (address: string, slot: SlotFieldsFragment) => {
      onSlotCtrlClick?.(address, slot);
      send({ type: 'CTRL_SELECT_SLOT', address });
    },
    [send, onSlotCtrlClick]
  );

  const onShiftClick = useCallback(
    (address: string) => {
      send({ type: 'SELECT_TO_SLOT', address });
    },
    [send]
  );

  /***
   * This creates an array of slots with the same column layout as of the labware type
   */
  const slotColumns = React.useMemo(() => {
    if (numColumns > 2) return [];
    const slotColumns: Array<SlotFieldsFragment[]> = new Array<SlotFieldsFragment[]>(numColumns);
    slots.forEach((slot, index) => {
      const colIndex = index % numColumns;
      if (!slotColumns[colIndex]) slotColumns[colIndex] = new Array<SlotFieldsFragment>();
      slotColumns[index % numColumns].push(slot);
    });
    return slotColumns;
  }, [numColumns, slots]);

  return (
    <div className={'flex flex-row'}>
      {slotColumns.length > 0 && slotBuilder && (
        <SlotColumnInfo slotColumn={slotColumns[0]} slotBuilder={slotBuilder} numRows={numRows} />
      )}
      <div onClick={() => onClick?.()} className={labwareClasses}>
        <div className={gridClasses}>
          {buildAddresses({ numColumns, numRows }).map((address, i) => (
            <Slot
              key={i}
              address={address}
              slot={slotByAddress[address]}
              size={numColumns > 2 ? 'medium' : numColumns > 6 || numRows > 6 ? 'small' : 'large'}
              onClick={internalOnClick}
              onCtrlClick={onCtrlClick}
              onShiftClick={onShiftClick}
              onMouseEnter={onSlotMouseEnter}
              onMouseLeave={onSlotMouseLeave}
              text={slotText}
              secondaryText={slotSecondaryText}
              color={_slotColor}
              selected={selectedAddresses.has(address)}
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
      {slotColumns.length > 1 && slotBuilder && (
        <SlotColumnInfo slotColumn={slotColumns[1]} slotBuilder={slotBuilder} numRows={numRows} alignRight={true} />
      )}
    </div>
  );
};

export default Labware;
