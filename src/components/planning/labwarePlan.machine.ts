import { createMachine } from "xstate";
import {
  LabwareFieldsFragment,
  Maybe,
  PlanMutation,
  PlanRequestLabware,
  PlanResult,
} from "../../types/sdk";
import {
  Address,
  extractServerErrors,
  LabwareTypeName,
  ServerErrors,
} from "../../types/stan";
import {
  LayoutPlan,
  Source as LayoutPlanAction,
} from "../../lib/machines/layout/layoutContext";
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

/**
 * Context for a {@link LabwarePlan} machine
 */
interface LabwarePlanContext {
  /**
   * Errors returned from the server
   */
  serverErrors: Maybe<ServerErrors>;

  layoutPlan: LayoutPlan;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: LayoutMachineActorRef;

  /**
   * A plan returned from core
   */
  plan?: PlanResult;

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
      key: "sectioningLayout",
      context: {
        serverErrors: null,
        layoutPlan: initialLayoutPlan,
      },
      initial: "prep",
      states: {
        prep: {
          on: {
            EDIT_LAYOUT: "editingLayout",
            CREATE_LABWARE: {
              target: `#sectioningLayout.creating`,
            },
          },
        },
        editingLayout: {
          invoke: {
            src: "layoutMachine",
            onDone: {
              target: "prep",
              actions: "assignLayoutPlan",
            },
          },
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
              target: "prep.error",
              actions: "assignServerErrors",
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
          // ctx.sectioningLayout.plan = e.data.plan;

          // ctx.sectioningLayout.plan.labware.forEach((labware) => {
          //   ctx.sectioningLayout.coreLayoutPlans.push(
          //     buildLayoutPlan(
          //       labware,
          //       e.data.plan.operations,
          //       ctx.sectioningLayout.inputLabwares,
          //       ctx.sectioningLayout.sampleColors
          //     )
          //   );
          // });
        }),

        assignServerErrors: assign((ctx, e) => {
          if (e.type !== "error.platform.planSection") {
            return;
          }
          ctx.serverErrors = extractServerErrors(e.data);
        }),
      },

      guards: {
        isVisiumLP: (ctx) =>
          ctx.layoutPlan.destinationLabware.labwareType.name ===
          LabwareTypeName.VISIUM_LP,
      },

      services: {
        layoutMachine: (ctx, _e) => {
          return createLayoutMachine(ctx.layoutPlan);
        },

        // validateLayout: (ctx) => ctx.validator.validate(ctx),

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

export function buildLayoutPlan(
  destinationLabware: LabwareFieldsFragment,
  operations: PlanMutation["plan"]["operations"],
  sourceLabwares: LabwareFieldsFragment[],
  sampleColors: Map<number, string>
): LayoutPlan {
  return {
    destinationLabware: destinationLabware,
    // As we're only allowing removing an existing planned source, no source actions should be available
    sources: [],
    sampleColors,

    plannedActions: operations[0].planActions
      .filter((planAction) => {
        return planAction.destination.labwareId === destinationLabware.id;
      })
      .reduce<Map<Address, Array<LayoutPlanAction>>>((memo, planAction) => {
        const action: LayoutPlanAction = {
          sampleId: planAction.sample.id,
          labware: findSourceLabware(
            sourceLabwares,
            planAction.source.labwareId
          ),
          address: planAction.source.address,

          // Section number will be assigned by the user at confirm stage
          newSection: 0,
        };
        if (memo.has(planAction.destination.address)) {
          memo.get(planAction.destination.address)?.push(action);
        } else {
          memo.set(planAction.destination.address, [action]);
        }
        return memo;
      }, new Map()),
  };
}

function findSourceLabware(
  labwares: LabwareFieldsFragment[],
  labwareId: number
): LabwareFieldsFragment {
  const labware = labwares.find((lw) => lw.id === labwareId);

  if (!labware) {
    throw new Error(
      `Plan returned an unrecognised source labware: ${labwareId}`
    );
  }

  return labware;
}
