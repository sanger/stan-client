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
   * Callback to notify whenever an input labware is scanned
   */
  onInputLabwareChange?: (labwaresWithoutPerm: LabwareFieldsFragment[]) => void;

  /**
   * Callback to notify whenever an input labware is scanned
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

  inputLabwareConfigPanel?: React.ReactNode;

  outputLabwareConfigPanel?: React.ReactNode;

  onSelectOutputLabware?: (labware: NewLabwareLayout) => void;
  onSelectInputLabware?: (labware: LabwareFieldsFragment) => void;
}
export type OutputSlotCopyData = {
  labware: NewLabwareLayout;
  slotCopyContent: Array<SlotCopyContent>;
};
export interface SlotMapperContext {
  inputLabware: Array<LabwareFieldsFragment>;
  outputSlotCopies: Array<OutputSlotCopyData>;
  colorByBarcode: Map<string, string>;
  failedSlots: Map<string, SlotPassFailFieldsFragment[]>;
  errors: Map<string, ClientError>;
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

type CopySlotsEvent = {
  type: 'COPY_SLOTS';
  inputLabwareId: number;
  inputAddresses: Array<string>;
  outputLabwareId: number;
  outputAddress: string;
};

type ClearSlotsEvent = {
  type: 'CLEAR_SLOTS';
  outputLabwareId: number;
  outputAddresses: Array<string>;
};

type ClearAllSlotMappingsEvent = {
  type: 'CLEAR_ALL_SLOT_MAPPINGS';
  outputLabwareId: number;
};

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
  | CopySlotsEvent
  | ClearSlotsEvent
  | ClearAllSlotMappingsEvent
  | ClearAllSlotMappingsBetweenEvent
  | LockEvent
  | UnlockEvent
  | SlotPassFailEvent
  | SlotPassFailErrorEvent;
