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
  onChange?: (slotCopyContent: Array<SlotCopyContent>, allSourcesMapped: boolean) => void;

  /**
   * Callback to notify whenever an input labware is scanned
   */
  onInputLabwareChange?: (labwaresWithoutPerm: LabwareFieldsFragment[]) => void;

  /**
   * Lock the SlotMapper.
   */
  locked?: boolean;

  /**
   * Initial input labware
   */
  initialInputLabware?: Array<LabwareFieldsFragment>;

  /**
   * Initial output labware
   */
  initialOutputLabware?: Array<NewLabwareLayout>;
}

export interface SlotMapperContext {
  inputLabware: Array<LabwareFieldsFragment>;
  outputLabware: Array<NewLabwareLayout>;
  slotCopyContent: Array<SlotCopyContent>;
  colorByBarcode: Map<string, string>;
  failedSlots: Map<string, SlotPassFailFieldsFragment[]>;
  errors: Map<string, ClientError>;
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
  labware: Array<LabwareFieldsFragment>;
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
  | LockEvent
  | UnlockEvent
  | SlotPassFailEvent
  | SlotPassFailErrorEvent;