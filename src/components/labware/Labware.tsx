import React, { useCallback, useEffect, useImperativeHandle, useMemo } from 'react';
import classNames from 'classnames';
import { Slot } from './Slot';
import {
  buildAddresses,
  GridDirection,
  isSameArray,
  LabwareDirection,
  Position,
  SECTION_GROUPS_BG_COLORS
} from '../../lib/helpers';
import _ from 'lodash';
import { FlagPriority, LabwareFlaggedFieldsFragment, SlotFieldsFragment } from '../../types/sdk';
import createLabwareMachine from './labware.machine';
import { Selectable, SelectionMode } from './labware.types';
import { NewFlaggedLabwareLayout, NewLabwareLayout } from '../../types/stan';
import { useMachine } from '@xstate/react';
import * as slotHelper from '../../lib/helpers/slotHelper';
import SlotColumnInfo from './SlotColumnInfo';
import { Link } from 'react-router-dom';
import FlagIcon from '../icons/FlagIcon';
import BarcodeIcon from '../icons/BarcodeIcon';
import BubleChatIcon from '../icons/BubleChatIcon';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';

export interface LabwareProps {
  /**
   * The labware to display. May be a new piece of labware not yet persisted on core.
   */
  labware: LabwareFlaggedFieldsFragment | NewFlaggedLabwareLayout | NewLabwareLayout;

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
   * A callback used to manage references to individual labware elements.
   * This is useful for dynamically tracking labware elements in a collection.
   */
  labwareRefCallback?: (el: LabwareImperativeRef) => void;

  /**
   * A callback that will be called for each slot in the labware. Must return a react component that will be placed
   * in the labelled slot beside the component
   * @param slot a slot on the given labware
   */
  slotBuilder?: (slot: SlotFieldsFragment) => React.ReactNode;

  /**
   * Cleaned out addresses are addresses that have been cleaned out and should not be used for storing samples.
   * Cleaned out addresses are displayed crossed over in the UI.
   */
  cleanedOutAddresses?: string[];

  barcodeInfoPosition?: Position;

  /**
   * Specifies the grid direction used to determine the positioning of wells inside the labware.
   */
  gridDirection?: GridDirection;

  /**
   * Callback to highlight slots due to an external action
   * without requiring direct selection or clicking on the slot.
   * This is useful when existing actions are already hooked to
   * the `onSelect` and `onClick` events.
   * @param addresses The addresses of the slots to highlight.
   */
  highlightedSlots?: Set<string>;

  /**
   * Specifies the orientation of the labware layout. Defaults to vertical.
   */
  labwareDirection?: LabwareDirection;

  /**
   * Optional mapping of section groups.
   * Each key represents a section name or ID, and the value is an array of addresses belonging to that section.
   */
  sectionGroups?: Record<string, PlannedSectionDetails>;
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
  slotBuilder,
  cleanedOutAddresses,
  barcodeInfoPosition,
  gridDirection,
  highlightedSlots,
  labwareDirection,
  labwareRefCallback,
  sectionGroups
}: React.PropsWithChildren<LabwareProps>) => {
  const labwareMachine = React.useMemo(() => {
    return createLabwareMachine();
  }, []);
  const [current, send] = useMachine(labwareMachine, {
    input: {
      selectionMode,
      selectable,
      slots: labware.slots,
      selectedAddresses: new Set<string>(),
      lastSelectedAddress: null
    }
  });
  const { selectedAddresses } = current.context;

  const selectedAddressesRef = React.useRef<Set<string>>();
  const {
    labwareType: { numRows, numColumns },
    slots,
    barcode
  } = labware;

  const isFlagged = useMemo(() => {
    return (labware as LabwareFlaggedFieldsFragment).flagged;
  }, [labware]);

  useImperativeHandle(labwareRef, () => ({
    deselectAll: () => send({ type: 'RESET_SELECTED' })
  }));
  useImperativeHandle(labwareRefCallback, () => ({
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

  const isBarcodeInfoAtTheTop = barcodeInfoPosition === Position.TopLeft || barcodeInfoPosition === Position.TopRight;

  const isBarcodeInfoAtTheBottom =
    barcodeInfoPosition === Position.BottomRight || barcodeInfoPosition === Position.BottomLeft;

  const isBarcodeInfoAtTheLeft =
    barcodeInfoPosition === Position.TopLeft || barcodeInfoPosition === Position.BottomLeft;

  const isBarcodeInfoAtTheLeftSide = barcodeInfoPosition === Position.Left;

  const isBarcodeInfoAtTheRightSide = barcodeInfoPosition === Position.Right;

  const labwareDisplayClass =
    isBarcodeInfoAtTheLeftSide || isBarcodeInfoAtTheRightSide ? 'flex flex row' : 'inline-block';

  const labwareClasses = `${labwareDisplayClass} border border-sdb py-2 rounded-lg bg-blue-100 transition duration-300 ease-in-out items-center`;

  const grid =
    labwareDirection && labwareDirection === LabwareDirection.Horizontal
      ? `grid grid-cols-${numRows} grid-rows-${numColumns}`
      : `grid grid-rows-${numRows} grid-cols-${numColumns}`;

  const gridClasses = classNames(
    {
      'px-12 gap-4 md:px-3 md:gap-1': numColumns <= 3,
      'px-10 gap-3 md:px-2 md:gap-1': numColumns > 3 && numColumns <= 5,
      'px-6 gap-2 md:px-1 md:gap-1': numColumns > 6
    },

    `${grid} py-4 select-none md:py-1`
  );

  // Give slots some default styles if some haven't been passed in
  const _slotColor =
    slotColor ??
    ((address, slot) => {
      if (slotHelper.hasMultipleSamples(slot)) {
        return 'bg-linear-to-r from-purple-400 via-pink-500 to-red-500';
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

  const barcodePositionClassName = (): string => {
    if (barcodeInfoPosition && isBarcodeInfoAtTheLeft) return 'items-end';
    return 'items-start';
  };

  const BarcodeInformation = () => (
    <div
      className={
        'flex flex-col py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider ' +
        barcodePositionClassName()
      }
      style={{
        writingMode: isBarcodeInfoAtTheRightSide
          ? 'vertical-rl'
          : isBarcodeInfoAtTheLeftSide
            ? 'vertical-lr'
            : 'initial'
      }}
    >
      {name && <span>{name}</span>}
      {barcode && !isFlagged && (
        <span className="inline-flex">
          <BarcodeIcon className="mr-1 h-4 w-4 text-gray-500" />
          {barcode}
        </span>
      )}
      {barcode && 'flagPriority' in labware ? (
        <span>
          <Link
            className="flex flex-row text-sp-700 hover:text-sp-800 font-semibold hover:underline"
            to={`/labware/${barcode}`}
            target="_blank"
          >
            {labware.flagPriority === FlagPriority.Flag && (
              <FlagIcon className="h-4 w-4 inline-block mb-2 mr-1 -ml-1" />
            )}
            {labware.flagPriority === FlagPriority.Note && (
              <BubleChatIcon className="h-4 w-4 inline-block mb-2 mr-1 -ml-1" />
            )}

            {barcode}
          </Link>
        </span>
      ) : (
        ''
      )}
    </div>
  );

  const slotSectionBgColor = (): Record<string, string> => {
    const result: Record<string, string> = {};

    if (!sectionGroups) return result;
    Object.entries(sectionGroups).forEach(([groupId, sectionDetails]) => {
      sectionDetails.addresses.forEach((address) => {
        result[address] = SECTION_GROUPS_BG_COLORS[Number(groupId)];
      });
    });
    return result;
  };

  return (
    <div className={'flex flex-row'} data-testid={`labware-${labware.barcode ?? ''}`}>
      {slotColumns.length > 0 && slotBuilder && (
        <SlotColumnInfo slotColumn={slotColumns[0]} slotBuilder={slotBuilder} numRows={numRows} />
      )}
      <div onClick={() => onClick?.()} className={labwareClasses}>
        {(isBarcodeInfoAtTheLeftSide || isBarcodeInfoAtTheTop) && BarcodeInformation()}
        <div className={gridClasses}>
          {buildAddresses({ numColumns, numRows }, gridDirection).map((address, i) => {
            return (
              <>
                <div key={address} className={`p-1 ${slotSectionBgColor()[address]} rounded-lg transition`}>
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
                    selected={selectedAddresses?.has(address) || (highlightedSlots?.has(address) ?? false)}
                    isCleanedOut={cleanedOutAddresses?.includes(address)}
                  />
                </div>
              </>
            );
          })}
        </div>
        {(!barcodeInfoPosition || isBarcodeInfoAtTheBottom || isBarcodeInfoAtTheRightSide) && BarcodeInformation()}
      </div>
      {slotColumns.length > 1 && slotBuilder && (
        <SlotColumnInfo slotColumn={slotColumns[1]} slotBuilder={slotBuilder} numRows={numRows} alignRight={true} />
      )}
    </div>
  );
};

export default Labware;
