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
  FindPermDataQuery,
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
  /**
   * The work number associated with this operation
   */
  workNumber: string;
  operationType: OperationTypeName;
  outputLabwareType: LabwareTypeName;
  slotCopyContent: Array<SlotCopyContent>;
  serverErrors?: Maybe<ClientError>;
  outputLabwares: Array<LabwareFieldsFragment>;
  inputLabwarePermData: FindPermDataQuery[];
}

type UpdateSlotCopyContentType = {
  type: "UPDATE_SLOT_COPY_CONTENT";
  slotCopyContent: Array<SlotCopyContent>;
  anySourceMapped: boolean;
};

type UPDATE_INPUT_LABWARE_PERMTIME = {
  type: "UPDATE_INPUT_LABWARE_PERMTIME";
  labwares: Array<LabwareFieldsFragment>;
};

type FindPermDataEvent = {
  type: "done.invoke.findPermTime";
  data: {
    findPermTimes: FindPermDataQuery[];
    inputLabwares: LabwareFieldsFragment[];
  };
};

type SaveEvent = { type: "SAVE" };

export type SlotCopyEvent =
  | { type: "UPDATE_WORK_NUMBER"; workNumber: string }
  | UpdateSlotCopyContentType
  | UPDATE_INPUT_LABWARE_PERMTIME
  | SaveEvent
  | FindPermDataEvent
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
          UPDATE_WORK_NUMBER: {
            actions: "assignWorkNumber",
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: "readyToCopy",
              cond: (ctx, e) => e.anySourceMapped,
              actions: ["assignSCC"],
            },
            {
              actions: ["assignSCC"],
            },
          ],
          UPDATE_INPUT_LABWARE_PERMTIME: {
            target: "updateLabwarePermTime",
          },
        },
      },
      readyToCopy: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: "assignWorkNumber",
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: "mapping",
              cond: (ctx, e) => !e.anySourceMapped,
              actions: ["assignSCC"],
            },
            {
              actions: ["assignSCC"],
            },
          ],
          UPDATE_INPUT_LABWARE_PERMTIME: {
            target: "updateLabwarePermTime",
          },

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
      updateLabwarePermTime: {
        invoke: {
          src: "findPermTime",
          onDone: [
            {
              target: "readyToCopy",
              cond: (context, e) =>
                e.data.inputLabwares.length > 0 &&
                context.slotCopyContent.length > 0,
              actions: "assignLabwarePermTimes",
            },
            {
              target: "mapping",
              actions: "assignLabwarePermTimes",
            },
          ],
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

      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== "UPDATE_WORK_NUMBER") return;
        ctx.workNumber = e.workNumber;
      }),
      assignLabwarePermTimes: assign((ctx, e) => {
        if (e.type !== "done.invoke.findPermTime") return;
        //Sync the permData array with current input labware list
        ctx.inputLabwarePermData = ctx.inputLabwarePermData.filter((permData) =>
          e.data.inputLabwares.some(
            (lw) => lw.barcode === permData.visiumPermData.labware.barcode
          )
        );
        //Add newly fetched perm times if any
        e.data.findPermTimes.forEach((permData) => {
          ctx.inputLabwarePermData.push(permData);
        });
        //update slot copy content with updated labware
        ctx.slotCopyContent = ctx.slotCopyContent.filter((scc) =>
          e.data.inputLabwares.some((lw) => lw.barcode === scc.sourceBarcode)
        );
      }),

      emptyServerError: assign((ctx) => {
        ctx.serverErrors = null;
      }),
    },
    services: {
      copySlots: (ctx) => {
        return stanCore.SlotCopy({
          request: {
            workNumber: ctx.workNumber,
            operationType: ctx.operationType,
            labwareType: ctx.outputLabwareType,
            contents: ctx.slotCopyContent,
          },
        });
      },
      findPermTime: async (ctx, e) => {
        const findPermDataQueries: FindPermDataQuery[] = [];
        if (e.type !== "UPDATE_INPUT_LABWARE_PERMTIME") return Promise.reject();
        for (const inputlw of e.labwares) {
          if (
            !ctx.inputLabwarePermData.some(
              (permData) =>
                permData.visiumPermData.labware.barcode === inputlw.barcode
            )
          ) {
            const val = await stanCore.FindPermData({
              barcode: inputlw.barcode,
            });
            findPermDataQueries.push(val);
          }
        }
        return new Promise<{
          findPermTimes: FindPermDataQuery[];
          inputLabwares: LabwareFieldsFragment[];
        }>((resolve) => {
          return resolve({
            findPermTimes: findPermDataQueries,
            inputLabwares: e.labwares,
          });
        });
      },
    },
  }
);

export default slotCopyMachine;
