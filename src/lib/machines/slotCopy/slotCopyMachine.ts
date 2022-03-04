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
  AddressPermData,
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
  workNumber?: string;
  operationType: OperationTypeName;
  outputLabwareType: LabwareTypeName;
  slotCopyContent: Array<SlotCopyContent>;
  permDataInputLabware: Map<string, AddressPermData[]>;
  serverErrors?: Maybe<ClientError>;
  outputLabwares: Array<LabwareFieldsFragment>;
}

type UpdateSlotCopyContentType = {
  type: "UPDATE_SLOT_COPY_CONTENT";
  slotCopyContent: Array<SlotCopyContent>;
  anySourceMapped: boolean;
};

type SaveEvent = { type: "SAVE" };

export type SlotCopyEvent =
  | { type: "UPDATE_WORK_NUMBER"; workNumber?: string }
  | UpdateSlotCopyContentType
  | SaveEvent
  | MachineServiceDone<"copySlots", SlotCopyMutation>
  | MachineServiceDone<"getPermTimes", FindPermDataQuery[]>
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
        },
      },
      readyToCopy: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: "assignWorkNumber",
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: "permtimeUpdate",
              cond: (ctx, e) => !e.anySourceMapped,
              actions: ["assignSCC"],
            },
            {
              actions: ["assignSCC"],
            },
          ],

          SAVE: "copying",
        },
      },
      permtimeUpdate: {
        invoke: {
          src: "getPermTimes",
          onDone: {
            target: "mapping",
            actions: ["assignPermTimes"],
          },
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

      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== "UPDATE_WORK_NUMBER") return;
        ctx.workNumber = e.workNumber;
      }),

      emptyServerError: assign((ctx) => {
        ctx.serverErrors = null;
      }),
      assignPermTimes: assign((ctx, e) => {
        if (e.type !== "done.invoke.getPermTimes") return;
        e.data.forEach((data) => {
          ctx.permDataInputLabware.set(
            data.visiumPermData.labware.barcode,
            data.visiumPermData.addressPermData
          );
        });
      }),
    },
    services: {
      getPermTimes: (ctx) => {
        const slotCopyContentSourceBarcodes = ctx.slotCopyContent.map(
          (scc) => scc.sourceBarcode
        );
        const validKeys = Array.from(
          ctx.permDataInputLabware.keys()
        ).filter((key) =>
          slotCopyContentSourceBarcodes.some((barcode) => barcode === key)
        );

        const results: FindPermDataQuery[] = [];
        ctx.slotCopyContent.forEach(async (scc) => {
          if (!validKeys.includes(scc.sourceBarcode)) {
            const result = await stanCore.FindPermData({
              barcode: scc.sourceBarcode,
            });
            results.push(result.visiumPermData);
          } else {
            const permData = ctx.permDataInputLabware.get(scc.sourceBarcode);
            if (permData) {
              results.push(permData);
            }
          }
        });
        return new Promise<FindPermDataQuery[]>((resolve, reject) => {
          return resolve(results);
        });
      },
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
    },
  }
);

export default slotCopyMachine;
