import { AliquotMutation, LabwareFieldsFragment } from "../../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { castDraft } from "immer";
import { stanCore } from "../../sdk";

export interface AliquotContext {
  /**The barcode of the source labware.**/
  workNumber?: string;

  /**The barcode of the source labware.**/
  labware: LabwareFieldsFragment | undefined;

  /**The number of destination labware to create.**/
  numLabware: number;

  /**The result returned by aliquot api*/
  aliquotResult?: AliquotMutation;

  /**Error returned from server**/
  serverErrors?: ClientError;
}

type UpdateLabwareEvent = {
  type: "UPDATE_LABWARE";
  labware: LabwareFieldsFragment;
};
type UpdateNumLabwareEvent = {
  type: "UPDATE_NUM_LABWARE";
  numLabware: number;
};

type AliquotEvent = {
  type: "ALIQUOT";
};
type AliquotDoneEvent = {
  type: "done.invoke.aliquot";
  data: AliquotMutation;
};
type AliquotErrorEvent = {
  type: "error.platform.aliquot";
  data: ClientError;
};

export type AliquottingEvent =
  | { type: "UPDATE_WORK_NUMBER"; workNumber?: string }
  | AliquotEvent
  | AliquotDoneEvent
  | AliquotErrorEvent
  | UpdateLabwareEvent
  | UpdateNumLabwareEvent;

export const aliquotMachine = createMachine<AliquotContext, AliquottingEvent>(
  {
    id: "aliquot",
    initial: "ready",
    states: {
      ready: {
        on: {
          UPDATE_WORK_NUMBER: { actions: "assignWorkNumber" },
          UPDATE_LABWARE: { actions: "assignLabware" },
          UPDATE_NUM_LABWARE: { actions: "assignNumLabware" },
          ALIQUOT: { target: "aliquoting", cond: "validAliquotInput" },
        },
      },
      aliquoting: {
        invoke: {
          src: "aliquot",
          onDone: {
            target: "aliquotingDone",
            actions: "assignAliquotResult",
          },
          onError: {
            target: "aliquotFailed",
            actions: "assignServerErrors",
          },
        },
      },
      aliquotFailed: {
        on: {
          ALIQUOT: { target: "aliquoting", cond: "validAliquotInput" },
        },
      },
      aliquotingDone: {},
    },
  },
  {
    actions: {
      assignLabware: assign((ctx, e) => {
        if (e.type !== "UPDATE_LABWARE") {
          return;
        }
        ctx.labware = e.labware;
      }),
      assignNumLabware: assign((ctx, e) => {
        if (e.type !== "UPDATE_NUM_LABWARE") {
          return;
        }
        ctx.numLabware = e.numLabware;
      }),
      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== "UPDATE_WORK_NUMBER") {
          return;
        }
        ctx.workNumber = e.workNumber;
      }),
      assignAliquotResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.aliquot") {
          return;
        }
        ctx.aliquotResult = e.data;
      }),
      assignServerErrors: assign((ctx, e) => {
        if (e.type !== "error.platform.aliquot") return;
        ctx.serverErrors = castDraft(e.data);
      }),
    },
    guards: {
      validAliquotInput: (ctx) =>
        ctx.labware !== undefined &&
        ctx.labware.barcode.length > 0 &&
        ctx.numLabware > 0,
    },
    services: {
      aliquot: (ctx, _e) => {
        if (ctx.labware) {
          return stanCore.Aliquot({
            request: {
              workNumber: ctx.workNumber,
              labwareType: "Tube",
              barcode: ctx.labware.barcode,
              numLabware: ctx.numLabware,
              operationType: "Aliquot",
            },
          });
        } else {
          return Promise.reject();
        }
      },
    },
  }
);

export default aliquotMachine;
