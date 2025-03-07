import { NewFlaggedLabwareLayout } from '../../types/stan';
import {
  FindPassFailsQuery,
  LabwareFlaggedFieldsFragment,
  SlotCopyContent,
  SlotPassFailFieldsFragment
} from '../../types/sdk';
import { ClientError } from 'graphql-request';
import { Draft } from 'immer';

export enum DestinationSelectionMode {
  PLATE = '96 Well Plate',
  STRIP_TUBE = '8 Strip Tube',
  SCAN = 'Scan Labware'
}
export interface SlotMapperProps {
  /**
   * Callback that's called whenever a slot is mapped or unmapped
   *
   * @param slotCopyContent the current mapping of source to destination slots
   * @param allSourcesMapped true if input labware exists and their non-empty slots have been mapped, false otherwise
   */
  onChange?: (
    labware: NewFlaggedLabwareLayout,
    slotCopyContent: Array<SlotCopyContent>,
    allSourcesMapped: boolean
  ) => void;

  /**
   * Callback to notify whenever an input labware is scanned/removed
   */
  onInputLabwareChange?: (
    labwaresWithoutPerm: LabwareFlaggedFieldsFragment[],
    cleanedOutAddresses?: Map<number, string[]>
  ) => void;

  /**
   * Callback to notify whenever an output labware is removed
   */
  onOutputLabwareChange?: (labwaresWithoutPerm: NewFlaggedLabwareLayout[]) => void;

  /**
   * Lock the SlotMapper.
   */
  locked?: boolean;

  /**
   * Input labware
   */
  initialInputLabware?: Array<LabwareFlaggedFieldsFragment>;

  /**
   * Output labware
   */
  initialOutputLabware?: Array<OutputSlotCopyData>;

  /**
   *Is it required to check failed slots in slide processing
   */
  failedSlotsCheck?: boolean;

  /**
   * Maximum number of input labware allowed to scan, if required
   */
  inputLabwareLimit?: number;

  /**
   * Disabled slots in output labware , if any
   */
  disabledOutputSlotAddresses?: string[];

  /**Panel to display on top of input labware, if any**/
  inputLabwareConfigPanel?: React.ReactNode;

  /**Panel to display on top of output labware, if any**/
  outputLabwareConfigPanel?: React.ReactNode;

  /**Slot copy modes**/
  slotCopyModes?: SlotCopyMode[];

  /**Display mapping table**/
  displayMappedTable?: boolean;

  /**Callback to notify when an output labware is selected (through pagination)**/
  onSelectOutputLabware?: (labware: NewFlaggedLabwareLayout) => void;

  /**Callback to notify when an input labware is selected (through pagination)**/
  onSelectInputLabware?: (labware: LabwareFlaggedFieldsFragment) => void;

  /**Callback to notify when an output labware selection type changes*/
  onOutputLabwareSelectionModeChange?: (mode: DestinationSelectionMode) => void;

  selectedDestinationMode?: DestinationSelectionMode;

  cleanedOutInputAddresses?: Map<number, string[]>;
}
export type OutputSlotCopyData = {
  labware: NewFlaggedLabwareLayout;
  slotCopyContent: Array<SlotCopyContent>;
  cleanedOutAddresses?: Array<string>;
};
export interface SlotMapperContext {
  /**All input labware scanned**/
  inputLabware: Array<LabwareFlaggedFieldsFragment>;
  /**Mapped slots data**/
  outputSlotCopies: Array<OutputSlotCopyData>;
  /**
   * Map between labware and the background color class name for active slots.
   */
  colorByBarcode: Map<string, string>;
  /**
   * Map between labware and the background color class name for disabled (already mapped) slots.
   */
  disabledColorByBarcode: Map<string, string>;
  /**Failed slots, if any**/
  failedSlots: Map<string, SlotPassFailFieldsFragment[]>;
  /**Any mapping errors*/
  errors: Map<string, ClientError>;
  /**Is it required to failed slots check**/
  failedSlotsCheck: boolean;
  /**cleaned out addresses related to the input labware**/
  cleanedOutInputAddresses?: Map<number, string[]>;
}

export interface SlotMapperSchema {
  states: {
    ready: {};
    locked: {};
    updatingLabware: {};
  };
}

type UpdateInputLabwareEvent = {
  type: 'UPDATE_INPUT_LABWARE';
  labware: Array<LabwareFlaggedFieldsFragment>;
  cleanedOutAddresses?: Map<number, string[]>;
};
type UpdateOutputLabwareEvent = {
  type: 'UPDATE_OUTPUT_LABWARE';
  outputSlotCopyContent: Array<OutputSlotCopyData>;
};

export enum SlotCopyMode {
  ONE_TO_ONE = 'One to one',
  ONE_TO_MANY = 'One to many',
  MANY_TO_ONE = 'Many to one'
}

type CopyOneToOneSlotsEvent = {
  type: 'COPY_ONE_TO_ONE_SLOTS';
  inputLabwareId: number;
  inputAddresses: Array<string>;
  outputLabwareId: number;
  outputAddress: string;
};

type CopyOneToManySlotsEvent = {
  type: 'COPY_ONE_TO_MANY_SLOTS';
  inputLabwareId: number;
  inputAddress: string;
  outputLabwareId: number;
  outputAddress: string;
};
type CopyManyToOneSlotsEvent = {
  type: 'COPY_MANY_TO_ONE_SLOTS';
  inputLabwareId: number;
  inputAddresses: Array<string>;
  outputLabwareId: number;
  outputAddress: string;
};

/**Clears the mapping in slot for the given slot address and output labware id**/
type ClearSlotsEvent = {
  type: 'CLEAR_SLOTS';
  outputLabwareId: number;
  outputAddresses: Array<string>;
};

/**Clears all mappings between given input and output labware**/
type ClearAllSlotMappingsBetweenEvent = {
  type: 'CLEAR_ALL_SLOT_MAPPINGS_BETWEEN';
  outputLabwareId: number;
  inputLabwareBarcode: string;
};

type SlotPassFailEvent = {
  type: 'xstate.done.actor.passFailsSlots';
  output: {
    barcode: string;
    result: FindPassFailsQuery;
  };
};
type SlotPassFailErrorEvent = {
  type: 'xstate.error.actor.passFailsSlots';
  barcode: string;
  error: Draft<ClientError>;
};

type SetFromDraftEvent = {
  type: 'SET_FROM_DRAFT';
  labware: Array<LabwareFlaggedFieldsFragment>;
  cleanedOutInputAddresses: Map<number, string[]>;
  outputSlotCopyContent: Array<OutputSlotCopyData>;
};

type LockEvent = { type: 'LOCK' };
type UnlockEvent = { type: 'UNLOCK' };

export type SlotMapperEvent =
  | SetFromDraftEvent
  | UpdateInputLabwareEvent
  | UpdateOutputLabwareEvent
  | CopyOneToOneSlotsEvent
  | CopyOneToManySlotsEvent
  | CopyManyToOneSlotsEvent
  | ClearSlotsEvent
  | ClearAllSlotMappingsBetweenEvent
  | LockEvent
  | UnlockEvent
  | SlotPassFailEvent
  | SlotPassFailErrorEvent;
