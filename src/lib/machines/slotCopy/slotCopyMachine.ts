import { MachineConfig, MachineOptions } from "xstate";
import {
  SlotCopyContext,
  SlotCopySchema,
  SlotCopyEvent,
} from "./slotCopyMachineTypes";
import { assign } from "@xstate/immer";
import { createMachineBuilder } from "../index";
import * as slotCopyService from "../../services/slotCopyService";
import { castDraft } from "immer";

/**
 * SlotCopy Machine Options
 */
const machineOptions: Partial<MachineOptions<
  SlotCopyContext,
  SlotCopyEvent
>> = {
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

    emptyServerError: assign((ctx, e) => {
      ctx.serverErrors = null;
    }),
  },
  services: {
    copySlots: (ctx) => {
      return slotCopyService.copySlots({
        operationType: ctx.operationType,
        labwareType: ctx.outputLabwareType,
        contents: ctx.slotCopyContent,
      });
    },
  },
};

/**
 * SlotCopy Machine Config
 */
export const machineConfig: MachineConfig<
  SlotCopyContext,
  SlotCopySchema,
  SlotCopyEvent
> = {
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
};

const createSlotCopyMachine = createMachineBuilder<
  SlotCopyContext,
  SlotCopySchema,
  SlotCopyEvent
>(machineConfig, machineOptions);

export default createSlotCopyMachine;
