import { FindPlanDataQuery, Maybe } from "../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../lib/sdk";

type PlanFinderContext = {
  /**
   * The current value of the scan input
   */
  barcode: string;

  /**
   * Map of labware barcode to plan retrieved for that barcode
   */
  plans: Map<string, FindPlanDataQuery>;

  /**
   * Description of what is invalid
   */
  validationError: Maybe<string>;

  /**
   * Error returned from a core request
   */
  requestError: Maybe<ClientError>;
};

type PlanFinderEvent =
  | { type: "UPDATE_BARCODE"; barcode: string }
  | { type: "SUBMIT_BARCODE" }
  | { type: "REMOVE_PLAN_BY_BARCODE"; barcode: string }
  | { type: "done.invoke.findPlan"; data: FindPlanDataQuery }
  | { type: "error.platform.findPlan"; data: ClientError };

export const planFinderMachine = createMachine<
  PlanFinderContext,
  PlanFinderEvent
>(
  {
    id: "planFinderMachine",
    initial: "idle",
    context: {
      barcode: "",
      plans: new Map(),
      validationError: null,
      requestError: null,
    },
    states: {
      idle: {
        on: {
          UPDATE_BARCODE: { actions: "assignBarcode" },
          REMOVE_PLAN_BY_BARCODE: { actions: "removePlanByBarcode" },
          SUBMIT_BARCODE: {
            target: "validatingBarcode",
            actions: "clearErrors",
          },
        },
      },
      validatingBarcode: {
        always: [
          {
            // Check plan hasn't already been found for this labware
            cond: (ctx) => ctx.plans.has(ctx.barcode),
            target: "idle",
            actions: "assignDuplicationError",
          },
          { target: "searching" },
        ],
      },
      searching: {
        invoke: {
          src: "findPlan",
          onDone: {
            target: "idle",
            actions: ["assignPlan", "resetBarcode"],
          },
          onError: {
            target: "idle",
            actions: "assignRequestError",
          },
        },
      },
    },
  },
  {
    actions: {
      assignBarcode: assign((ctx, e) => {
        if (e.type !== "UPDATE_BARCODE") return;
        ctx.barcode = e.barcode;
      }),

      assignDuplicationError: assign((ctx) => {
        ctx.validationError = `Plan has already been found for ${ctx.barcode}`;
      }),

      assignPlan: assign((ctx, e) => {
        if (e.type !== "done.invoke.findPlan") return;
        ctx.plans.set(ctx.barcode, e.data);
      }),

      assignRequestError: assign((ctx, e) => {
        if (e.type !== "error.platform.findPlan") return;
        ctx.requestError = e.data;
      }),

      clearErrors: assign((ctx) => {
        ctx.requestError = null;
        ctx.validationError = null;
      }),

      removePlanByBarcode: assign((ctx, e) => {
        if (e.type !== "REMOVE_PLAN_BY_BARCODE") return;
        ctx.plans.delete(e.barcode);
      }),

      resetBarcode: assign((ctx) => (ctx.barcode = "")),
    },

    services: {
      findPlan: (ctx) => stanCore.FindPlanData({ barcode: ctx.barcode }),
    },
  }
);
