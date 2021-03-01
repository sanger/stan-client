import { actions, Machine, MachineOptions, send, spawn } from "xstate";
import { Address, LabwareTypeName } from "../../../types/stan";
import {
  buildConfirmOperationLabware,
  buildConfirmOperationRequest,
} from "../../factories/confirmOperationRequest";
import { assign } from "@xstate/immer";
import { current } from "immer";
import { buildSampleColors } from "../../helpers/labwareHelper";
import { createSectioningLayoutMachine } from "./sectioningLayout/sectioningLayoutMachine";
import { createSectioningConfirmMachine } from "./sectioningConfirm/sectioningConfirmMachine";
import * as sectioningService from "../../services/sectioningService";
import * as confirmService from "../../services/confirmService";
import { unregisteredLabwareFactory } from "../../factories/labwareFactory";
import {
  Labware,
  LabwareLayoutFragment,
  PlanMutation,
} from "../../../types/graphql";
import {
  LayoutPlan,
  Source as LayoutPlanAction,
} from "../layout/layoutContext";
import {
  S,
  SectioningContext,
  SectioningEvent,
  SectioningSchema,
} from "./sectioningMachineTypes";
import {
  SectioningLayout,
  SectioningLayoutContext,
  SectioningLayoutEvent,
} from "./sectioningLayout/sectioningLayoutTypes";
import { sectioningConfirmationComplete } from "./sectioningConfirm/sectioningConfirmEvents";

export const machineKey = "sectioningMachine";

enum Action {
  SELECT_LABWARE_TYPE = "selectLabwareType",
  UPDATE_LABWARES = "updateLabwares",
  ADD_LABWARE_LAYOUT = "addLabwareLayout",
  DELETE_LABWARE_LAYOUT = "deleteLabwareLayout",
  ASSIGN_PLAN = "assignPlan",
  UPDATE_CONFIRMATION = "updateConfirmation",
  UPDATE_SECTIONS_COMPLETED = "updateSectionsCompleted",
  ASSIGN_CONFIRMED_OPERATION = "assignConfirmedOperation",
  NOTIFY_COMPLETE = "notifyComplete",
}

enum Guard {
  ALL_LAYOUT_COMPLETE = "allLayoutComplete",
  NO_SOURCE_LABWARES = "noSourceLabwares",
  NO_LAYOUTS = "noLayouts",
}

enum Service {
  GET_SECTIONING_INFO = "getSectioningInfo",
  CONFIRM_OPERATION = "confirmOperation",
}

const sectioningMachineOptions: Partial<MachineOptions<
  SectioningContext,
  SectioningEvent
>> = {
  actions: {
    [Action.NOTIFY_COMPLETE]: actions.pure((ctx, _e) => {
      const actors = Array.from(ctx.sectioningConfirmMachines.values()).flat();
      return actors.map((actor) =>
        send(sectioningConfirmationComplete(), { to: () => actor })
      );
    }),

    [Action.SELECT_LABWARE_TYPE]: assign((ctx, e) => {
      if (e.type !== "SELECT_LABWARE_TYPE") {
        return;
      }
      ctx.selectedLabwareType = e.labwareType;
    }),

    [Action.UPDATE_LABWARES]: assign((ctx, e) => {
      if (e.type !== "UPDATE_LABWARES") {
        return;
      }
      ctx.sourceLabwares = e.labwares;
      ctx.sampleColors = buildSampleColors(e.labwares);
    }),

    [Action.ADD_LABWARE_LAYOUT]: assign((ctx, e) => {
      if (e.type !== "ADD_LABWARE_LAYOUT") {
        return;
      }
      const copy = current(ctx);
      const sectioningLayout: SectioningLayout = buildSectioningLayout(copy);

      ctx.sectioningLayouts.push({
        ...sectioningLayout,
        ref: spawn<SectioningLayoutContext, SectioningLayoutEvent>(
          createSectioningLayoutMachine(sectioningLayout)
        ),
      });
    }),

    [Action.DELETE_LABWARE_LAYOUT]: assign((ctx, e) => {
      if (e.type !== "DELETE_LABWARE_LAYOUT") {
        return;
      }
      ctx.sectioningLayouts.splice(e.index, 1);
    }),

    [Action.ASSIGN_PLAN]: assign((ctx, e) => {
      if (e.type !== "done.invoke.planSection" || !e.data.data) {
        return;
      }

      const currentCtx = current(ctx);
      const { plan } = e.data.data;

      plan.labware.forEach((labware: any) => {
        const labwareTypeName = labware.labwareType.name;

        // Because JS maps can't have default values :(
        if (!ctx.sectioningConfirmMachines.has(labwareTypeName)) {
          ctx.sectioningConfirmMachines.set(labwareTypeName, []);
        }

        // Add a new ConfirmOperationLabware to ConfirmOperationRequest
        ctx.confirmOperationRequest.labware.push(
          buildConfirmOperationLabware(labware)
        );

        // Spawn a new Sectioning Outcome Machine
        const sectioningOutComeActorsByType = ctx.sectioningConfirmMachines.get(
          labwareTypeName
        );
        sectioningOutComeActorsByType?.push(
          spawn(
            createSectioningConfirmMachine(
              currentCtx.comments,
              labware,
              buildSectioningOutcomeLayoutPlan(ctx, labware, plan.operations)
            )
          )
        );
      });
    }),

    [Action.UPDATE_SECTIONS_COMPLETED]: assign((ctx, e) => {
      if (e.type !== "PREP_COMPLETE") {
        return;
      }
      ctx.numSectioningLayoutsComplete += 1;
    }),

    [Action.UPDATE_CONFIRMATION]: assign((ctx, e) => {
      if (e.type !== "COMMIT_CONFIRMATION") {
        return;
      }
      const confirmationIndex = ctx.confirmOperationRequest.labware.findIndex(
        (lw) => lw.barcode === e.confirmOperationLabware.barcode
      );
      if (confirmationIndex > -1) {
        ctx.confirmOperationRequest.labware[confirmationIndex] =
          e.confirmOperationLabware;
      }
    }),

    [Action.ASSIGN_CONFIRMED_OPERATION]: assign((ctx, e) => {
      if (e.type !== "done.invoke.confirmOperation") {
        return;
      }
      ctx.confirmedOperation = e.data;
    }),
  },

  guards: {
    /**
     * Are there any sectioning layouts and have they all completed
     */
    [Guard.ALL_LAYOUT_COMPLETE]: (ctx) =>
      ctx.sectioningLayouts.length > 0 &&
      ctx.sectioningLayouts.length === ctx.numSectioningLayoutsComplete,
    [Guard.NO_LAYOUTS]: (ctx) => ctx.sectioningLayouts.length === 0,
    [Guard.NO_SOURCE_LABWARES]: (ctx) => ctx.sourceLabwares.length === 0,
  },

  services: {
    [Service.GET_SECTIONING_INFO]: sectioningService.getSectioningInfo,
    [Service.CONFIRM_OPERATION]: (ctx) =>
      confirmService.confirm(ctx.confirmOperationRequest),
  },
};

/**
 * Machine for controlling the sectioning workflow.
 *
 * @see {@link labwareMachine}
 */
export const sectioningMachine = Machine<
  SectioningContext,
  SectioningSchema,
  SectioningEvent
>(
  {
    key: machineKey,
    initial: S.UNKNOWN,
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
      sectioningConfirmMachines: new Map(),
      confirmOperationRequest: buildConfirmOperationRequest(),
      confirmedOperation: null,
    },
    states: {
      [S.ERROR]: {},
      [S.UNKNOWN]: {
        always: [
          {
            cond: Guard.NO_SOURCE_LABWARES,
            target: S.READY,
          },
          {
            cond: Guard.NO_LAYOUTS,
            target: `${S.STARTED}.${S.SOURCE_SCANNING}`,
          },
          { target: `${S.STARTED}.${S.PREPARING_LABWARE}` },
        ],
      },
      [S.READY]: {
        on: {
          UPDATE_LABWARES: {
            target: S.UNKNOWN,
            actions: Action.UPDATE_LABWARES,
          },
        },
      },
      [S.STARTED]: {
        states: {
          [S.SOURCE_SCANNING]: {
            on: {
              UPDATE_LABWARES: {
                actions: Action.UPDATE_LABWARES,
                target: `#${machineKey}.${S.UNKNOWN}`,
              },
              ADD_LABWARE_LAYOUT: {
                actions: Action.ADD_LABWARE_LAYOUT,
                target: `#${machineKey}.${S.UNKNOWN}`,
              },
            },
          },
          [S.PREPARING_LABWARE]: {
            on: {
              DELETE_LABWARE_LAYOUT: {
                actions: Action.DELETE_LABWARE_LAYOUT,
                target: `#${machineKey}.${S.UNKNOWN}`,
              },
              ADD_LABWARE_LAYOUT: {
                actions: Action.ADD_LABWARE_LAYOUT,
                target: `#${machineKey}.${S.UNKNOWN}`,
              },
              "done.invoke.planSection": {
                actions: Action.ASSIGN_PLAN,
                target: `#${machineKey}.${S.UNKNOWN}`,
              },
              PREP_COMPLETE: {
                actions: Action.UPDATE_SECTIONS_COMPLETED,
              },
            },
          },
        },
        on: {
          SELECT_LABWARE_TYPE: {
            actions: Action.SELECT_LABWARE_TYPE,
          },

          PREP_DONE: {
            cond: Guard.ALL_LAYOUT_COMPLETE,
            target: S.CONFIRMING,
          },
        },
      },
      [S.CONFIRMING]: {
        initial: S.CONFIRMING_LABWARE,
        on: {
          BACK_TO_PREP: {
            target: S.UNKNOWN,
          },
          COMMIT_CONFIRMATION: {
            actions: Action.UPDATE_CONFIRMATION,
          },
          CONFIRM_OPERATION: {
            target: `${S.CONFIRMING}.${S.CONFIRM_OPERATION}`,
          },
        },
        states: {
          [S.CONFIRMING_LABWARE]: {},
          [S.CONFIRM_OPERATION]: {
            invoke: {
              src: Service.CONFIRM_OPERATION,
              onDone: {
                actions: Action.ASSIGN_CONFIRMED_OPERATION,
                target: `#${machineKey}.${S.DONE}`,
              },
              onError: {
                target: S.CONFIRM_ERROR,
              },
            },
          },
          [S.CONFIRM_ERROR]: {},
        },
      },
      [S.DONE]: {
        entry: Action.NOTIFY_COMPLETE,
        type: "final",
      },
    },
  },
  sectioningMachineOptions
);

/**
 * Build a {@link SectioningLayout} model from the {@link SectioningContext}
 * @param ctx
 */
function buildSectioningLayout(ctx: SectioningContext): SectioningLayout {
  if (!ctx.selectedLabwareType) {
    throw new Error("No Labware Type provided for Sectioning Layout");
  }

  const sectioningLayout: SectioningLayout = {
    inputLabwares: ctx.sourceLabwares,
    quantity: 1,
    sectionThickness: 5,
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

function buildSectioningOutcomeLayoutPlan(
  ctx: SectioningContext,
  labware: LabwareLayoutFragment,
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
      .reduce<Map<Address, LayoutPlanAction>>((memo, planAction) => {
        const action: LayoutPlanAction = {
          sampleId: planAction.sample.id,
          labware: findSourceLabware(
            currentCtx.sourceLabwares,
            planAction.source.labwareId
          ),
          address: planAction.source.address,
        };
        memo.set(planAction.destination.address, action);
        return memo;
      }, new Map()),
  };
}

function findSourceLabware(labwares: Labware[], labwareId: number): Labware {
  const labware = labwares.find((lw) => lw.id === labwareId);

  if (!labware) {
    throw new Error(
      `Plan returned an unrecognised source labware: ${labwareId}`
    );
  }

  return labware;
}
