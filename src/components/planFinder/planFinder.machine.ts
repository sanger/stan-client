import {
  FindPlanDataQuery,
  LabwareFieldsFragment,
  Maybe,
} from "../../types/sdk";
import { ClientError } from "graphql-request";
import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { stanCore } from "../../lib/sdk";

type PlanFinderContext = {
  /**
   * The current value of the scan input
   */
  labware: LabwareFieldsFragment | undefined;

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
  | { type: "SUBMIT_LABWARE"; labware: LabwareFieldsFragment }
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
      labware: undefined,
      plans: new Map(),
      validationError: null,
      requestError: null,
    },
    states: {
      idle: {
        on: {
          REMOVE_PLAN_BY_BARCODE: { actions: "removePlanByBarcode" },
          SUBMIT_LABWARE: {
            target: "validatingBarcode",
            actions: ["assignLabware", "clearErrors"],
          },
        },
      },
      validatingBarcode: {
        always: [
          {
            // Check plan hasn't already been found for this labware
            cond: (ctx) => ctx.plans.has(ctx.labware!.barcode),
            target: "idle",
            actions: ["assignDuplicationError", "resetLabware"],
          },
          { target: "searching" },
        ],
      },
      searching: {
        invoke: {
          src: "findPlan",
          onDone: {
            target: "idle",
            actions: ["assignPlan", "resetLabware"],
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
      assignLabware: assign((ctx, e) => {
        if (e.type !== "SUBMIT_LABWARE") return;
        ctx.labware = e.labware;
      }),

      assignDuplicationError: assign((ctx, e) => {
        if (e.type !== "SUBMIT_LABWARE") return;
        ctx.validationError = `Plan has already been found for ${e.labware.barcode}`;
      }),

      assignPlan: assign((ctx, e) => {
        if (e.type !== "done.invoke.findPlan") return;
        //Remove all actions, if any that doesn't belong to the labware in context
        e.data.planData.plan.planActions = e.data.planData.plan.planActions.filter(
          (action) => action.destination.labwareId === ctx.labware!.id
        );
        ctx.plans.set(ctx.labware!.barcode, e.data);
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

      resetLabware: assign((ctx) => (ctx.labware = undefined)),
    },

    services: {
      findPlan: (ctx) =>
        stanCore.FindPlanData({
          barcode: ctx.labware!.barcode,
        }),
    },
  }
);
