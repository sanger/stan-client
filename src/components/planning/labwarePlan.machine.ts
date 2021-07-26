import { createMachine } from "xstate";
import { Maybe, PlanMutation, PlanRequestLabware } from "../../types/sdk";
import { LabwareTypeName } from "../../types/stan";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../lib/machines/layout/layoutMachine";
import { stanCore } from "../../lib/sdk";
import { ClientError } from "graphql-request";
import { LayoutMachineActorRef } from "../../lib/machines/layout";

//region Events
type CreateLabwareEvent = {
  type: "CREATE_LABWARE";
  sectionThickness?: number;
  barcode?: string;
  quantity: number;
  operationType: string;
};

type UpdateLayoutPlanEvent = {
  type: "UPDATE_LAYOUT_PLAN";
  layoutPlan: LayoutPlan;
};

type PlanSectionResolveEvent = {
  type: "done.invoke.planSection";
  data: PlanMutation;
};

type PlanSectionRejectEvent = {
  type: "error.platform.planSection";
  data: ClientError;
};

type LayoutMachineDone = {
  type: "done.invoke.layoutMachine";
  data: { layoutPlan: LayoutPlan };
};

type LabwarePlanEvent =
  | { type: "EDIT_LAYOUT" }
  | { type: "CANCEL_EDIT_LAYOUT" }
  | { type: "DONE_EDIT_LAYOUT" }
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | LayoutMachineDone;
//endregion Events

/**
 * Context for a {@link LabwarePlan} machine
 */
interface LabwarePlanContext {
  /**
   * Errors returned from the server
   */
  requestError: Maybe<ClientError>;

  /**
   * The plan for how sources will be mapped onto a piece of labware
   */
  layoutPlan: LayoutPlan;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: LayoutMachineActorRef;

  /**
   * A plan returned from core
   */
  plan?: PlanMutation;

  /**
   * Message from the label printer containing details of the printer's success
   */
  printSuccessMessage?: string;

  /**
   * Message from the label printer containing details of how the printer failed
   */
  printErrorMessage?: string;
}

/**
 * Machine for the planning how samples will be laid out onto labware.
 */
export const createLabwarePlanMachine = (initialLayoutPlan: LayoutPlan) =>
  createMachine<LabwarePlanContext, LabwarePlanEvent>(
    {
      key: "labwarePlan",
      context: {
        requestError: null,
        layoutPlan: initialLayoutPlan,
      },
      initial: "prep",
      states: {
        prep: {
          initial: "invalid",
          states: {
            valid: {
              on: {
                CREATE_LABWARE: {
                  target: "#labwarePlan.creating",
                },
              },
            },
            errored: {
              on: {
                CREATE_LABWARE: {
                  target: "#labwarePlan.creating",
                },
              },
            },
            invalid: {},
          },
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
            { cond: "isLayoutValid", target: "prep.valid" },
            { target: "prep.invalid" },
          ],
        },
        creating: {
          invoke: {
            id: "planSection",
            src: "planSection",
            onDone: [
              {
                cond: "isVisiumLP",
                target: "done",
                actions: ["assignPlanResponse"],
              },
              {
                target: "printing",
                actions: ["assignPlanResponse"],
              },
            ],
            onError: {
              target: "prep.errored",
              actions: "assignRequestErrors",
            },
          },
        },
        printing: {},
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

        assignPlanResponse: assign((ctx, e) => {
          if (e.type !== "done.invoke.planSection" || !e.data) {
            return;
          }

          ctx.plan = e.data;
        }),

        assignRequestErrors: assign((ctx, e) => {
          if (e.type !== "error.platform.planSection") {
            return;
          }
          ctx.requestError = e.data;
        }),
      },

      guards: {
        isVisiumLP: (ctx) =>
          ctx.layoutPlan.destinationLabware.labwareType.name ===
          LabwareTypeName.VISIUM_LP,

        isLayoutValid: (ctx) => ctx.layoutPlan.plannedActions.size > 0,
      },

      services: {
        layoutMachine: (ctx, _e) => {
          return createLayoutMachine(ctx.layoutPlan);
        },

        planSection: (ctx, e) => {
          if (e.type !== "CREATE_LABWARE") {
            return Promise.reject();
          }

          const planRequestLabware = buildPlanRequestLabware({
            sampleThickness: e.sectionThickness,
            layoutPlan: ctx.layoutPlan,
            destinationLabwareTypeName:
              ctx.layoutPlan.destinationLabware.labwareType.name,
            barcode: e.barcode,
          });
          const labware: PlanRequestLabware[] = new Array(e.quantity).fill(
            planRequestLabware
          );
          return stanCore.Plan({
            request: { labware, operationType: e.operationType },
          });
        },
      },
    }
  );

type BuildPlanRequestLabwareParams = {
  destinationLabwareTypeName: string;
  layoutPlan: LayoutPlan;
  barcode?: string;
  sampleThickness?: number;
};

function buildPlanRequestLabware({
  barcode,
  destinationLabwareTypeName,
  layoutPlan,
  sampleThickness,
}: BuildPlanRequestLabwareParams): PlanRequestLabware {
  return {
    labwareType: destinationLabwareTypeName,
    barcode,
    actions: Array.from(layoutPlan.plannedActions.keys()).flatMap((address) => {
      const sources = layoutPlan.plannedActions.get(address)!;
      return sources.map((source) => ({
        address,
        sampleThickness,
        sampleId: source.sampleId,
        source: {
          barcode: source.labware.barcode,
          address: source.address,
        },
      }));
    }),
  };
}
