import { createMachine } from "xstate";
import {
  LabwareTypeName,
  MachineServiceError,
  Nullable,
} from "../../../types/stan";
import {
  buildConfirmSectionLabware,
  buildConfirmSectionRequest,
} from "../../factories/confirmSectionRequestFactory";
import { assign } from "@xstate/immer";
import { current } from "immer";
import { buildSampleColors, labwareSamples } from "../../helpers/labwareHelper";
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
} from "../../../types/sdk";
import { stanCore } from "../../sdk";
import { LayoutPlan, Source } from "../layout/layoutContext";
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
  inputLabwareTypes: GetSectioningInfoQuery["labwareTypes"];

  /**
   * Allowed output labware types
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
   * Sectioning layouts
   */
  sectioningLayouts: Array<SectioningLayout>;

  /**
   * A map of sample ID to a hex color
   */
  sampleColors: Map<number, string>;

  /**
   * The request that will be send to the API at the end of Sectioning
   */
  confirmSectionRequest: ConfirmSectionRequest;

  /**
   * The result of the Confirm Operation API call
   */
  confirmedOperation: Maybe<OperationResult>;

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
  sectioningLayout: SectioningLayout;
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
export function createSectioningMachine(
  sectioningInfo: GetSectioningInfoQuery
) {
  const inputLabwareTypeNames = [LabwareTypeName.PROVIASETTE];

  const outputLabwareTypeNames = [
    LabwareTypeName.TUBE,
    LabwareTypeName.SLIDE,
    LabwareTypeName.VISIUM_TO,
    LabwareTypeName.VISIUM_LP,
  ];

  const inputLabwareTypes = sectioningInfo.labwareTypes.filter((lt) =>
    inputLabwareTypeNames.includes(lt.name as LabwareTypeName)
  );
  const outputLabwareTypes = sectioningInfo.labwareTypes.filter((lt) =>
    outputLabwareTypeNames.includes(lt.name as LabwareTypeName)
  );
  const selectedLabwareType = outputLabwareTypes[0];
  const comments = sectioningInfo.comments;

  return createMachine<SectioningContext, SectioningEvent>(
    {
      key: "sectioningMachine",
      initial: "unknown",
      context: {
        inputLabwareTypes,
        outputLabwareTypes,
        selectedLabwareType,
        comments,
        sourceLabwares: [],
        sectioningLayouts: [],
        sampleColors: new Map(),
        confirmSectionRequest: buildConfirmSectionRequest(),
        confirmedOperation: null,
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
          const sectioningLayout: SectioningLayout = buildSectioningLayout(
            copy
          );

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

          ctx.sectioningLayouts = [
            ...ctx.sectioningLayouts.filter(
              (sl) => sl.cid !== e.sectioningLayout.cid
            ),
            e.sectioningLayout,
          ];

          const newLabware = e.sectioningLayout?.plan?.labware;

          if (!newLabware) return;

          const newBarcodes = new Set(newLabware.map((lw) => lw.barcode));

          const confirmSectionRequestLabware = ctx.confirmSectionRequest.labware.filter(
            (lw) => !newBarcodes.has(lw.barcode)
          );

          const newConfirmSectionLabwares = newLabware.map(
            buildConfirmSectionLabware
          );

          ctx.confirmSectionRequest.labware = [
            ...confirmSectionRequestLabware,
            ...newConfirmSectionLabwares,
          ];
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
            ctx.sectioningLayouts.every((sl) => sl.plan != null)
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
}

/**
 * Build a {@link SectioningLayout} model from the {@link SectioningContext}
 * @param ctx
 */
function buildSectioningLayout(ctx: SectioningContext): SectioningLayout {
  if (!ctx.selectedLabwareType) {
    throw new Error("No Labware Type provided for Sectioning Layout");
  }

  const inputLabwares = ctx.sourceLabwares;
  const sampleColors = ctx.sampleColors;
  const destinationLabware = unregisteredLabwareFactory.build(
    {},
    {
      associations: {
        labwareType: ctx.selectedLabwareType,
      },
    }
  );

  const sectioningLayout: SectioningLayout = {
    cid: uniqueId("sectioning_layout_"),
    inputLabwares,
    quantity: 1,
    sectionThickness: 0,
    sampleColors,
    destinationLabware,
    coreLayoutPlans: [],
    plan: null,
    layoutPlan: buildInitialLayoutPlan(
      destinationLabware,
      sampleColors,
      inputLabwares
    ),
  };

  if (ctx.selectedLabwareType.name === LabwareTypeName.VISIUM_LP) {
    sectioningLayout.barcode = "";
  }

  return sectioningLayout;
}

/**
 * Build a {@link LayoutPlan} from a {@link SectioningLayout} to be used in a {@link LayoutPlanner}
 */
function buildInitialLayoutPlan(
  destinationLabware: Nullable<LabwareFieldsFragment, "barcode">,
  sampleColors: Map<number, string>,
  inputLabwares: Array<LabwareFieldsFragment>
): LayoutPlan {
  return {
    destinationLabware,
    plannedActions: new Map(),
    sampleColors: sampleColors,
    sources: inputLabwares.reduce<Array<Source>>((memo, labware) => {
      return [
        ...memo,
        ...labwareSamples(labware).map<Source>((labwareSample) => {
          return {
            sampleId: labwareSample.sample.id,
            address: labwareSample.slot.address,
            labware,
          };
        }),
      ];
    }, []),
  };
}
