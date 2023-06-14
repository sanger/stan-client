import { NewLabwareLayout } from '../../types/stan';
import {
  FindPassFailsQuery,
  LabwareFieldsFragment,
  SlotCopyContent,
  SlotPassFailFieldsFragment
} from '../../types/sdk';
import { ClientError } from 'graphql-request';

export interface SlotMapperProps {
  /**
   * Callback that's called whenever a slot is mapped or unmapped
   *
   * @param slotCopyContent the current mapping of source to destination slots
   * @param allSourcesMapped true if input labware exists and their non-empty slots have been mapped, false otherwise
   */
  onChange?: (labware: NewLabwareLayout, slotCopyContent: Array<SlotCopyContent>, allSourcesMapped: boolean) => void;

  /**
   * Callback to notify whenever an input labware is scanned/removed
   */
  onInputLabwareChange?: (labwaresWithoutPerm: LabwareFieldsFragment[]) => void;

  /**
   * Callback to notify whenever an output labware is removed
   */
  onOutputLabwareChange?: (labwaresWithoutPerm: NewLabwareLayout[]) => void;

  /**
   * Lock the SlotMapper.
   */
  locked?: boolean;

  /**
   * Input labware
   */
  initialInputLabware?: Array<LabwareFieldsFragment>;

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

  /**Callback to notify when an output labware is selected (through pagination)**/
  onSelectOutputLabware?: (labware: NewLabwareLayout) => void;

  /**Callback to notify when an output labware is selected (through pagination)**/
  onSelectInputLabware?: (labware: LabwareFieldsFragment) => void;
}
export type OutputSlotCopyData = {
  labware: NewLabwareLayout;
  slotCopyContent: Array<SlotCopyContent>;
};
export interface SlotMapperContext {
  /**All input labware scanned**/
  inputLabware: Array<LabwareFieldsFragment>;
  /**Mapped slots data**/
  outputSlotCopies: Array<OutputSlotCopyData>;
  /**Map between color to display in slots and labware**/
  colorByBarcode: Map<string, string>;
  /**Failed slots, if any**/
  failedSlots: Map<string, SlotPassFailFieldsFragment[]>;
  /**Any mapping errors*/
  errors: Map<string, ClientError>;
  /**Is it required to failed slots check**/
  failedSlotsCheck: boolean;
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
  labware: Array<LabwareFieldsFragment>;
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
  type: 'done.invoke.passFailsSlots';
  data: {
    barcode: string;
    result: FindPassFailsQuery;
  };
};
type SlotPassFailErrorEvent = {
  type: 'error.platform.passFailsSlots';
  barcode: string;
  error: ClientError;
};

type LockEvent = { type: 'LOCK' };
type UnlockEvent = { type: 'UNLOCK' };

export type SlotMapperEvent =
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
