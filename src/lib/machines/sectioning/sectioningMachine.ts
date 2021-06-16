import { createMachine } from "xstate";
import {
  Address,
  LabwareTypeName,
  MachineServiceError,
} from "../../../types/stan";
import {
  buildConfirmSectionLabware,
  buildConfirmSectionRequest,
} from "../../factories/confirmSectionRequestFactory";
import { assign } from "@xstate/immer";
import { current } from "immer";
import { buildSampleColors } from "../../helpers/labwareHelper";
import { SectioningLayout } from "./sectioningLayout/sectioningLayoutMachine";
import { CommitConfirmationEvent } from "./sectioningConfirm/sectioningConfirmMachine";
import { unregisteredLabwareFactory } from "../../factories/labwareFactory";
import {
  Comment,
  ConfirmSectionRequest,
  GetSectioningInfoQuery,
  LabwareFieldsFragment,
  LabwareType,
  Maybe,
  OperationResult,
  PlanMutation,
} from "../../../types/sdk";
import { stanCore } from "../../sdk";
import {
  LayoutPlan,
  Source as LayoutPlanAction,
} from "../layout/layoutContext";
import { ClientError } from "graphql-request";
import { UpdateLabwaresEvent } from "../labware/labwareMachine";
import { uniqueId } from "lodash";

/**
 * SectioningContext for the sectioningMachine
 */
export interface SectioningContext {
  /**
   * Allowed input labware types
   */
  inputLabwareTypeNames: string[];

  /**
   * Actual input labware types
   */
  inputLabwareTypes: GetSectioningInfoQuery["labwareTypes"];

  /**
   * Allowed output labware types
   */
  outputLabwareTypeNames: string[];

  /**
   * Actual output labware types
   */
  outputLabwareTypes: GetSectioningInfoQuery["labwareTypes"];

  /**
   * Available comments for confirmation
   */
  comments: Comment[];

  /**
   * Labware Type selected by the user
   */
  selectedLabwareType: Maybe<LabwareType>;

  /**
   * The input labwares sent up from the labware machine
   */
  sourceLabwares: LabwareFieldsFragment[];

  /**
   * Spawned sectioningLayoutMachines. SectioningSchema is synced back to this machine.
   *
   * @see {@link https://xstate.js.org/docs/guides/actors.html#actors}
   */
  sectioningLayouts: Array<SectioningLayout>;

  /**
   * The number of sectioning layouts that have completed (either successfully printed or just created for Visium LP)
   */
  numSectioningLayoutsComplete: number;

  /**
   * A map of sample ID to a hex color
   */
  sampleColors: Map<number, string>;

  /**
   * The request that will be send to the API at the end of Sectioning
   */
  confirmSectionRequest: ConfirmSectionRequest;

  /**
   * The successful of the Confirm Operation API call
   */
  confirmedOperation: Maybe<OperationResult>;

  /**
   * The plans for how blocks will be sectioned
   */
  layoutPlans: Array<LayoutPlan>;

  /**
   * Sectioning Layout Id to its plan
   */
  sectioningLayoutPlans: Map<string, PlanMutation["plan"]>;

  /**
   * Sectioning Layout Id to its layout plan
   */
  sectioningLayoutLayoutPlan: Map<string, LayoutPlan>;

  /**
   * Track the number of layout plans completed
   */
  plansCompleted: number;

  /**
   * Possible errors that come back from the server
   */
  serverErrors?: ClientError;
}

type SelectLabwareTypeEvent = {
  type: "SELECT_LABWARE_TYPE";
  labwareType: GetSectioningInfoQuery["labwareTypes"][number];
};

type AddLabwareLayoutEvent = {
  type: "ADD_LABWARE_LAYOUT";
};

type DeleteLabwareLayoutEvent = {
  type: "DELETE_LABWARE_LAYOUT";
  index: number;
};

type PlanAddedEvent = {
  type: "PLAN_ADDED";
  sectioningLayoutId: string;
  plan: PlanMutation["plan"];
};

type PrepDoneEvent = {
  type: "PREP_DONE";
};

type BackToPrepEvent = {
  type: "BACK_TO_PREP";
};

type ConfirmSectionEvent = {
  type: "CONFIRM_SECTION";
};

type ConfirmSectionResolveEvent = {
  type: "done.invoke.confirmSection";
  data: OperationResult;
};

type ConfirmSectionErrorEvent = MachineServiceError<"confirmSection">;

export type SectioningEvent =
  | SelectLabwareTypeEvent
  | AddLabwareLayoutEvent
  | DeleteLabwareLayoutEvent
  | UpdateLabwaresEvent
  | PlanAddedEvent
  | PrepDoneEvent
  | BackToPrepEvent
  | CommitConfirmationEvent
  | ConfirmSectionEvent
  | ConfirmSectionResolveEvent
  | ConfirmSectionErrorEvent;

/**
 * Machine for controlling the sectioning workflow.
 *
 * @see {@link labwareMachine}
 */
export const sectioningMachine = createMachine<
  SectioningContext,
  SectioningEvent
>(
  {
    key: "sectioningMachine",
    initial: "unknown",
    context: {
      inputLabwareTypeNames: [LabwareTypeName.PROVIASETTE],
      inputLabwareTypes: [],
      outputLabwareTypeNames: [
        LabwareTypeName.TUBE,
        LabwareTypeName.SLIDE,
        LabwareTypeName.VISIUM_TO,
        LabwareTypeName.VISIUM_LP,
      ],
      comments: [],
      outputLabwareTypes: [],
      selectedLabwareType: null,
      sourceLabwares: [],
      sectioningLayouts: [],
      numSectioningLayoutsComplete: 0,
      sampleColors: new Map(),
      confirmSectionRequest: buildConfirmSectionRequest(),
      confirmedOperation: null,
      layoutPlans: [],
      sectioningLayoutPlans: new Map(),
      sectioningLayoutLayoutPlan: new Map(),
      plansCompleted: 0,
    },
    states: {
      error: {},
      unknown: {
        always: [
          {
            cond: "noSourceLabwares",
            target: "ready",
          },
          {
            cond: "noLayouts",
            target: "started.sourceScanning",
          },
          { target: "started.preparingLabware" },
        ],
      },
      ready: {
        on: {
          UPDATE_LABWARES: {
            target: "unknown",
            actions: "updateLabwares",
          },
        },
      },
      started: {
        states: {
          sourceScanning: {
            on: {
              UPDATE_LABWARES: {
                actions: "updateLabwares",
                target: "#sectioningMachine.unknown",
              },
              ADD_LABWARE_LAYOUT: {
                actions: "addLabwareLayout",
                target: "#sectioningMachine.unknown",
              },
            },
          },
          preparingLabware: {
            on: {
              DELETE_LABWARE_LAYOUT: {
                actions: "deleteLabwareLayout",
                target: "#sectioningMachine.unknown",
              },
              ADD_LABWARE_LAYOUT: {
                actions: "addLabwareLayout",
                target: "#sectioningMachine.unknown",
              },
              PLAN_ADDED: {
                actions: "assignPlan",
                target: "#sectioningMachine.unknown",
              },
            },
          },
        },
        on: {
          SELECT_LABWARE_TYPE: {
            actions: "selectLabwareType",
          },

          PREP_DONE: {
            cond: "allLayoutComplete",
            target: "confirming",
          },
        },
      },
      confirming: {
        initial: "confirmingLabware",
        on: {
          BACK_TO_PREP: {
            target: "unknown",
          },
          COMMIT_CONFIRMATION: {
            actions: "updateConfirmation",
          },
          CONFIRM_SECTION: {
            target: "confirming.confirmSection",
          },
        },
        states: {
          confirmingLabware: {},
          confirmSection: {
            invoke: {
              src: "confirmSection",
              onDone: {
                actions: "assignConfirmedSection",
                target: "#sectioningMachine.done",
              },
              onError: {
                actions: "assignConfirmError",
                target: "confirmError",
              },
            },
          },
          confirmError: {},
        },
      },
      done: {
        type: "final",
      },
    },
  },
  {
    actions: {
      selectLabwareType: assign((ctx, e) => {
        if (e.type !== "SELECT_LABWARE_TYPE") {
          return;
        }
        ctx.selectedLabwareType = e.labwareType;
      }),

      updateLabwares: assign((ctx, e) => {
        if (e.type !== "UPDATE_LABWARES") {
          return;
        }
        ctx.sourceLabwares = e.labwares;
        ctx.sampleColors = buildSampleColors(e.labwares);
      }),

      addLabwareLayout: assign((ctx, e) => {
        if (e.type !== "ADD_LABWARE_LAYOUT") {
          return;
        }
        const copy = current(ctx);
        const sectioningLayout: SectioningLayout = buildSectioningLayout(copy);

        ctx.sectioningLayouts.push({
          ...sectioningLayout,
        });
      }),

      deleteLabwareLayout: assign((ctx, e) => {
        if (e.type !== "DELETE_LABWARE_LAYOUT") {
          return;
        }
        ctx.sectioningLayouts.splice(e.index, 1);
      }),

      assignPlan: assign((ctx, e) => {
        if (e.type !== "PLAN_ADDED") {
          return;
        }

        ctx.plansCompleted += 1;

        ctx.sectioningLayoutPlans.set(e.sectioningLayoutId, e.plan);

        e.plan.labware.forEach((labware, index) => {
          // Add a new ConfirmOperationLabware to ConfirmOperationRequest
          ctx.confirmSectionRequest.labware.push(
            buildConfirmSectionLabware(labware)
          );

          let layoutPlan = buildLayoutPlan(ctx, labware, e.plan.operations);

          if (index === 0) {
            ctx.sectioningLayoutLayoutPlan.set(
              e.sectioningLayoutId,
              layoutPlan
            );
          }

          ctx.layoutPlans.push(layoutPlan);
        });
      }),

      updateConfirmation: assign((ctx, e) => {
        if (e.type !== "COMMIT_CONFIRMATION") {
          return;
        }

        const confirmationIndex = ctx.confirmSectionRequest.labware.findIndex(
          (lw) => lw.barcode === e.confirmOperationLabware.barcode
        );
        if (confirmationIndex > -1) {
          ctx.confirmSectionRequest.labware[confirmationIndex] =
            e.confirmOperationLabware;
        }
      }),

      assignConfirmedSection: assign((ctx, e) => {
        if (e.type !== "done.invoke.confirmSection") {
          return;
        }
        ctx.confirmedOperation = e.data;
      }),

      assignConfirmError: assign((ctx, e) => {
        if (e.type !== "error.platform.confirmSection") {
          return;
        }
        ctx.serverErrors = e.data;
      }),
    },

    guards: {
      /**
       * Are there any sectioning layouts and have they all completed
       */
      allLayoutComplete: (ctx) => {
        return (
          ctx.sectioningLayouts.length > 0 &&
          ctx.sectioningLayouts.length === ctx.plansCompleted
        );
      },
      noLayouts: (ctx) => ctx.sectioningLayouts.length === 0,
      noSourceLabwares: (ctx) => ctx.sourceLabwares.length === 0,
    },

    services: {
      getSectioningInfo: () => stanCore.GetSectioningInfo(),
      confirmSection: (ctx) =>
        stanCore.ConfirmSection({ request: ctx.confirmSectionRequest }),
    },
  }
);

export function buildLayoutPlan(
  ctx: SectioningContext,
  labware: LabwareFieldsFragment,
  operations: PlanMutation["plan"]["operations"]
): LayoutPlan {
  const currentCtx = current(ctx);

  return {
    destinationLabware: labware,
    // As we're only allowing removing an existing planned source, no source actions should be available
    sources: [],
    sampleColors: currentCtx.sampleColors,

    plannedActions: operations[0].planActions
      .filter((planAction) => {
        return planAction.destination.labwareId === labware.id;
      })
      .reduce<Map<Address, Array<LayoutPlanAction>>>((memo, planAction) => {
        const action: LayoutPlanAction = {
          sampleId: planAction.sample.id,
          labware: findSourceLabware(
            currentCtx.sourceLabwares,
            planAction.source.labwareId
          ),
          address: planAction.source.address,

          // Section number will be assigned by the user at confirm stage
          newSection: undefined,
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

/**
 * Build a {@link SectioningLayout} model from the {@link SectioningContext}
 * @param ctx
 */
function buildSectioningLayout(ctx: SectioningContext): SectioningLayout {
  if (!ctx.selectedLabwareType) {
    throw new Error("No Labware Type provided for Sectioning Layout");
  }

  const sectioningLayout: SectioningLayout = {
    cid: uniqueId("sectioning_layout_"),
    inputLabwares: ctx.sourceLabwares,
    quantity: 1,
    sectionThickness: 0,
    sampleColors: ctx.sampleColors,
    destinationLabware: unregisteredLabwareFactory.build(
      {},
      {
        associations: {
          labwareType: ctx.selectedLabwareType,
        },
      }
    ),
  };

  if (ctx.selectedLabwareType.name === LabwareTypeName.VISIUM_LP) {
    sectioningLayout.barcode = "";
  }

  return sectioningLayout;
}
