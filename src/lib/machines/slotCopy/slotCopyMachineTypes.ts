import { Interpreter, State, StateNode } from "xstate";
import {
  LabwareTypeName,
  MachineServiceDone,
  MachineServiceError,
  OperationTypeName,
} from "../../../types/stan";
import {
  LabwareLayoutFragment,
  Maybe,
  SlotCopyContent,
  SlotCopyMutation,
} from "../../../types/graphql";
import { ApolloError } from "@apollo/client";

/**
 * Context for SlotCopy Machine
 */
export interface SlotCopyContext {
  operationType: OperationTypeName;
  outputLabwareType: LabwareTypeName;
  slotCopyContent: Array<SlotCopyContent>;
  serverErrors: Maybe<ApolloError>;
  outputLabwares: Array<LabwareLayoutFragment>;
}

/**
 * State Schema for SlotCopy Machine
 */
export interface SlotCopySchema {
  states: {
    mapping: {};
    readyToCopy: {};
    copying: {};
    copied: {};
  };
}

type UpdateSlotCopyContentType = {
  type: "UPDATE_SLOT_COPY_CONTENT";
  slotCopyContent: Array<SlotCopyContent>;
  allSourcesMapped: boolean;
};

type SaveEvent = { type: "SAVE" };

export type SlotCopyEvent =
  | UpdateSlotCopyContentType
  | SaveEvent
  | MachineServiceDone<"copySlots", SlotCopyMutation>
  | MachineServiceError<"copySlots">;

/**
 * The type of an interpreted SlotCopy Machine
 */
export type SlotCopyMachineService = Interpreter<
  SlotCopyContext,
  SlotCopySchema,
  SlotCopyEvent
>;

/**
 * SlotCopy Machine type
 */
export type SlotCopyMachine = StateNode<
  SlotCopyContext,
  SlotCopySchema,
  SlotCopyEvent
>;

/**
 * The type of an individual state (i.e. current returned from useMachine())
 */
export type SlotCopyState = State<
  SlotCopyContext,
  SlotCopyEvent,
  SlotCopySchema
>;
