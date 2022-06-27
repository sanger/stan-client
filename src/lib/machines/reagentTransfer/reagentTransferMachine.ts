import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { castDraft } from "immer";

import { ClientError } from "graphql-request";
import {
  FindReagentPlateQuery,
  LabwareFieldsFragment,
  Maybe,
  ReagentPlate,
  ReagentTransfer,
  RecordReagentTransferMutation,
} from "../../../types/sdk";
import {
  MachineServiceDone,
  MachineServiceError,
  OperationTypeName,
} from "../../../types/stan";
import { stanCore } from "../../sdk";

/**
 * Context for SlotCopy Machine
 */
export interface ReagentTransferContext {
  /**
   * The work number associated with this operation
   */
  workNumber: string;
  /**
   * The operation type associated with reagent transfer
   */
  operationType: OperationTypeName;

  /**Source barcode**/
  sourceBarcode?: string;

  /**
   * Dual Index plate, which is the source labware, from which the reagent is copied.
   * This is fetched and if doesn't exist it will be created
   */
  sourceReagentPlate: ReagentPlate | undefined;

  /**
   * 96 well plate, which is the destination labware, to which the reagent is copied
   */
  destLabware: LabwareFieldsFragment | undefined;

  /**
   * All the transfers to record between slots in source and destination
   */
  reagentTransfers: Array<ReagentTransfer>;

  /**The result returned by reagentTransfer api*/
  reagentTransferResult?: RecordReagentTransferMutation;

  /**
   * Errors from server, if any
   */
  serverErrors?: Maybe<ClientError>;

  validationError?: string;
}

type UpdateTransferContent = {
  type: "UPDATE_TRANSFER_CONTENT";
  reagentTransfers: Array<ReagentTransfer>;
};

type UpdateWorkNumber = {
  type: "UPDATE_WORK_NUMBER";
  workNumber: string;
};

type SetSourceLabware = {
  type: "SET_SOURCE_LABWARE";
  barcode: string;
};

type SetDestinationLabware = {
  type: "SET_DESTINATION_LABWARE";
  labware: LabwareFieldsFragment;
};

type SaveEvent = { type: "SAVE" };

export type ReagentTransferEvent =
  | UpdateWorkNumber
  | SetSourceLabware
  | SetDestinationLabware
  | UpdateTransferContent
  | SaveEvent
  | MachineServiceDone<"reagentTransfer", RecordReagentTransferMutation>
  | MachineServiceError<"reagentTransfer">
  | MachineServiceDone<"findReagentPlate", FindReagentPlateQuery>
  | MachineServiceError<"findReagentPlate">;

/**
 * Reagent Transfer Machine Config
 */
export const reagentTransferMachine = createMachine<
  ReagentTransferContext,
  ReagentTransferEvent
>(
  {
    id: "slotCopy",
    initial: "ready",
    states: {
      ready: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: "assignWorkNumber",
          },
          SET_SOURCE_LABWARE: [
            {
              target: "finding",
              cond: (ctx, e) => /^[0-9]{24}$/.test(e.barcode),
              actions: ["emptyValidationError", "assignSourceBarcode"],
            },
            {
              actions: "assignValidationError",
            },
          ],
          SET_DESTINATION_LABWARE: {
            actions: "assignDestination",
          },
          UPDATE_TRANSFER_CONTENT: [
            {
              target: "readyToCopy",
              cond: (ctx) =>
                ctx.sourceReagentPlate !== undefined &&
                ctx.destLabware !== undefined,
              actions: "assignTransfers",
            },
            {
              actions: "assignTransfers",
            },
          ],
        },
      },
      finding: {
        invoke: {
          src: "findReagentPlate",
          id: "findReagentPlate",
          onDone: {
            target: "ready",
            actions: "assignReagentPlate",
          },
          onError: {
            target: "ready",
            actions: ["assignServerError"],
          },
        },
      },
      readyToCopy: {
        on: {
          UPDATE_WORK_NUMBER: {
            actions: "assignWorkNumber",
          },
          UPDATE_TRANSFER_CONTENT: {
            actions: ["assignTransfers"],
          },
          SAVE: "transferring",
        },
      },
      transferring: {
        entry: ["emptyServerError"],
        invoke: {
          src: "reagentTransfer",
          id: "reagentTransfer",
          onDone: {
            target: "transferred",
            actions: "assignResult",
          },
          onError: {
            target: "readyToCopy",
            actions: ["assignServerError"],
          },
        },
      },
      transferred: {
        type: "final",
      },
    },
  },
  {
    actions: {
      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== "UPDATE_WORK_NUMBER") return;
        ctx.workNumber = e.workNumber;
      }),
      assignSourceBarcode: assign((ctx, e) => {
        if (e.type !== "SET_SOURCE_LABWARE") return;
        ctx.sourceBarcode = e.barcode;
      }),
      assignDestination: assign((ctx, e) => {
        if (e.type !== "SET_DESTINATION_LABWARE") return;
        ctx.destLabware = e.labware;
      }),

      assignReagentPlate: assign((ctx, e) => {
        if (
          e.type !== "done.invoke.findReagentPlate" ||
          ctx.sourceBarcode === undefined
        )
          return;
        ctx.sourceReagentPlate = e.data.reagentPlate
          ? {
              barcode: e.data.reagentPlate.barcode,
              slots: e.data.reagentPlate.slots ?? [],
            }
          : { barcode: ctx.sourceBarcode, slots: [] };
      }),
      assignTransfers: assign((ctx, e) => {
        e.type === "UPDATE_TRANSFER_CONTENT" &&
          (ctx.reagentTransfers = e.reagentTransfers);
      }),

      assignResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.reagentTransfer") {
          return;
        }
        ctx.reagentTransferResult = e.data;
      }),

      assignServerError: assign((ctx, e) => {
        if (
          e.type !== "error.platform.reagentTransfer" &&
          e.type !== "error.platform.findReagentPlate"
        ) {
          return;
        }
        ctx.serverErrors = castDraft(e.data);
      }),

      emptyServerError: assign((ctx) => {
        ctx.serverErrors = null;
      }),
      assignValidationError: assign((ctx) => {
        ctx.validationError = "24 digit number required";
      }),
      emptyValidationError: assign((ctx) => {
        ctx.validationError = undefined;
      }),
    },
    services: {
      reagentTransfer: (ctx) => {
        if (!ctx.sourceReagentPlate) {
          return Promise.reject();
        }
        return stanCore.RecordReagentTransfer({
          request: {
            workNumber: ctx.workNumber,
            operationType: ctx.operationType,
            destinationBarcode: ctx.destLabware!.barcode,
            transfers: ctx.reagentTransfers,
          },
        });
      },
      findReagentPlate: (ctx, e) => {
        if (e.type !== "SET_SOURCE_LABWARE") return Promise.reject();
        return stanCore.FindReagentPlate({ barcode: e.barcode });
      },
    },
  }
);

export default reagentTransferMachine;
