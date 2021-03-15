import { NewLabwareLayout } from "../../types/stan";
import {
  LabwareLayoutFragment,
  Maybe,
  SlotCopyContent,
} from "../../types/graphql";

export interface SlotMapperProps {
  /**
   * Callback that's called whenever a slot is mapped or unmapped
   *
   * @param slotCopyContent the current mapping of source to destination slots
   * @param allSourcesMapped true if input labware exists and their non-empty slots have been mapped, false otherwise
   */
  onChange?: (
    slotCopyContent: Array<SlotCopyContent>,
    allSourcesMapped: boolean
  ) => void;

  /**
   * Lock the SlotMapper.
   */
  locked?: boolean;

  /**
   * Initial input labware
   */
  initialInputLabware?: Array<LabwareLayoutFragment>;

  /**
   * Initial output labware
   */
  initialOutputLabware?: Array<NewLabwareLayout>;
}

export interface SlotMapperContext {
  inputLabware: Array<LabwareLayoutFragment>;
  currentInputPage: number;
  currentInputLabware: Maybe<LabwareLayoutFragment>;
  outputLabware: Array<NewLabwareLayout>;
  currentOutputPage: number;
  currentOutputLabware: Maybe<NewLabwareLayout>;
  slotCopyContent: Array<SlotCopyContent>;
  colorByBarcode: Map<string, string>;
}

export interface SlotMapperSchema {
  states: {
    ready: {};
    locked: {};
  };
}

type UpdateInputLabwareEvent = {
  type: "UPDATE_INPUT_LABWARE";
  labware: Array<LabwareLayoutFragment>;
};

type CopySlotsEvent = {
  type: "COPY_SLOTS";
  inputLabwareId: number;
  inputAddresses: Array<string>;
  outputLabwareId: number;
  outputAddress: string;
};

type ClearSlotsEvent = {
  type: "CLEAR_SLOTS";
  outputLabwareId: number;
  outputAddresses: Array<string>;
};

type UpdateInputPageEvent = {
  type: "UPDATE_INPUT_PAGE";
  page: number;
};

type UpdateOutputPageEvent = {
  type: "UPDATE_OUTPUT_PAGE";
  page: number;
};

type LockEvent = { type: "LOCK" };
type UnlockEvent = { type: "UNLOCK" };

export type SlotMapperEvent =
  | UpdateInputLabwareEvent
  | CopySlotsEvent
  | ClearSlotsEvent
  | UpdateInputPageEvent
  | UpdateOutputPageEvent
  | LockEvent
  | UnlockEvent;
