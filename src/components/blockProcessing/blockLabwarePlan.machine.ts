import { createMachine } from "xstate";
import { Maybe, PlanMutation, PlanRequestLabware } from "../../types/sdk";
import { LabwareTypeName } from "../../types/stan";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../lib/machines/layout/layoutMachine";
import { stanCore } from "../../lib/sdk";
import { ClientError } from "graphql-request";
import { LayoutMachineActorRef } from "../../lib/machines/layout";

type UpdateLayoutPlanEvent = {
  type: "UPDATE_LAYOUT_PLAN";
  layoutPlan: LayoutPlan;
};

type LayoutMachineDone = {
  type: "done.invoke.layoutMachine";
  data: { layoutPlan: LayoutPlan };
};

type LabwarePlanEvent =
  | { type: "EDIT_LAYOUT" }
  | { type: "CANCEL_EDIT_LAYOUT" }
  | { type: "DONE_EDIT_LAYOUT" }
  | UpdateLayoutPlanEvent
  | LayoutMachineDone;
//endregion Events

/**
 * Context for a {@link LabwarePlan} machine
 */
interface LabwarePlanContext {
  /**
   * The plan for how sources will be mapped onto a piece of labware
   */
  layoutPlan: LayoutPlan;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: LayoutMachineActorRef;
}

/**
 * Machine for the planning how samples will be laid out onto labware.
 */
export const createLabwarePlanMachine = (initialLayoutPlan: LayoutPlan) =>
  createMachine<LabwarePlanContext, LabwarePlanEvent>(
    {
      key: "labwarePlan",
      context: {
        layoutPlan: initialLayoutPlan,
      },
      initial: "prep",
      states: {
        prep: {
          initial: "invalid",
          on: {
            EDIT_LAYOUT: "editingLayout",
          },
        },
        editingLayout: {
          invoke: {
            src: "layoutMachine",
            onDone: {
              target: "validatingLayout",
              actions: "assignLayoutPlan",
            },
          },
        },
        validatingLayout: {
          always: [
            { cond: "isLayoutValid", target: "done" },
            { target: "prep.invalid" },
          ],
        },
        done: {},
      },
    },
    {
      actions: {
        assignLayoutPlan: assign((ctx, e) => {
          if (e.type !== "done.invoke.layoutMachine" || !e.data) {
            return;
          }
          ctx.layoutPlan = e.data.layoutPlan;
        }),
      },

      guards: {
        isLayoutValid: (ctx) => ctx.layoutPlan.plannedActions.size > 0,
      },

      services: {
        layoutMachine: (ctx, _e) => {
          return createLayoutMachine(ctx.layoutPlan);
        },
      },
    }
  );
