import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { castDraft } from "immer";
import {
  LabwareTypeName,
  MachineServiceDone,
  MachineServiceError,
  OperationTypeName,
} from "../../../types/stan";
import {
  LabwareFieldsFragment,
  Maybe,
  SlotCopyContent,
  SlotCopyMutation,
} from "../../../types/sdk";
import { stanCore } from "../../sdk";
import { ClientError } from "graphql-request";

/**
 * Context for SlotCopy Machine
 */
export interface SlotCopyContext {
  operationType: OperationTypeName;
  outputLabwareType: LabwareTypeName;
  slotCopyContent: Array<SlotCopyContent>;
  serverErrors?: Maybe<ClientError>;
  outputLabwares: Array<LabwareFieldsFragment>;
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
 * SlotCopy Machine Config
 */
export const slotCopyMachine = createMachine<SlotCopyContext, SlotCopyEvent>(
  {
    id: "slotCopy",
    initial: "mapping",
    states: {
      mapping: {
        on: {
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: "readyToCopy",
              cond: (ctx, e) => e.allSourcesMapped,
              actions: ["assignSCC"],
            },
            {
              actions: ["assignSCC"],
            },
          ],
        },
      },
      readyToCopy: {
        on: {
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: "mapping",
              cond: (ctx, e) => !e.allSourcesMapped,
              actions: ["assignSCC"],
            },
            {
              actions: ["assignSCC"],
            },
          ],

          SAVE: "copying",
        },
      },
      copying: {
        entry: ["emptyServerError"],
        invoke: {
          src: "copySlots",
          onDone: {
            target: "copied",
            actions: ["assignResult"],
          },
          onError: {
            target: "readyToCopy",
            actions: ["assignServerError"],
          },
        },
      },
      copied: {
        type: "final",
      },
    },
  },
  {
    actions: {
      assignSCC: assign((ctx, e) => {
        e.type === "UPDATE_SLOT_COPY_CONTENT" &&
          (ctx.slotCopyContent = e.slotCopyContent);
      }),

      assignResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.copySlots") {
          return;
        }
        ctx.outputLabwares = e.data.slotCopy.labware;
      }),

      assignServerError: assign((ctx, e) => {
        if (e.type !== "error.platform.copySlots") {
          return;
        }
        ctx.serverErrors = castDraft(e.data);
      }),

      emptyServerError: assign((ctx) => {
        ctx.serverErrors = null;
      }),
    },
    services: {
      copySlots: (ctx) => {
        return stanCore.SlotCopy({
          request: {
            operationType: ctx.operationType,
            labwareType: ctx.outputLabwareType,
            contents: ctx.slotCopyContent,
          },
        });
      },
    },
  }
);

export default slotCopyMachine;
