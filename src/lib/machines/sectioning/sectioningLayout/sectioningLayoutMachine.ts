import { createMachine } from "xstate";
import {
  LabwareFieldsFragment,
  LabwareType,
  Maybe,
  PlanMutation,
  PlanRequestLabware,
} from "../../../../types/sdk";
import * as Yup from "yup";
import {
  Address,
  extractServerErrors,
  LabwareTypeName,
  NewLabwareLayout,
  ServerErrors,
} from "../../../../types/stan";
import {
  LayoutPlan,
  Source as LayoutPlanAction,
} from "../../layout/layoutContext";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../layout/layoutMachine";
import { stanCore } from "../../../sdk";
import { ClientError } from "graphql-request";
import { LayoutMachineActorRef } from "../../layout";

//region Events
type UpdateSectioningLayoutEvent = {
  type: "UPDATE_SECTIONING_LAYOUT";
  sectioningLayout: Partial<SectioningLayout>;
};

type EditLayoutEvent = { type: "EDIT_LAYOUT" };

type CancelEditLayoutEvent = { type: "CANCEL_EDIT_LAYOUT" };

type DoneEditLayoutEvent = { type: "DONE_EDIT_LAYOUT" };

type CreateLabwareEvent = { type: "CREATE_LABWARE" };

type UpdateLayoutPlanEvent = {
  type: "UPDATE_LAYOUT_PLAN";
  layoutPlan: LayoutPlan;
};

export type PlanSectionResolveEvent = {
  type: "done.invoke.planSection";
  data: PlanMutation;
};

type PlanSectionRejectEvent = {
  type: "error.platform.planSection";
  data: ClientError;
};

export type LayoutMachineDone = {
  type: "done.invoke.layoutMachine";
  data: { layoutPlan: LayoutPlan };
};

export type SectioningLayoutEvent =
  | UpdateSectioningLayoutEvent
  | EditLayoutEvent
  | CancelEditLayoutEvent
  | DoneEditLayoutEvent
  | CreateLabwareEvent
  | UpdateLayoutPlanEvent
  | PlanSectionResolveEvent
  | PlanSectionRejectEvent
  | LayoutMachineDone;

/**
 * Model of a sectioning layout
 */
export interface SectioningLayout {
  /**
   * Client ID to help tracking
   */
  cid: string;

  /**
   * The labwares available to section from
   */
  inputLabwares: LabwareFieldsFragment[];

  /**
   * The new labware we are sectioning on to
   */
  destinationLabware: NewLabwareLayout;

  /**
   * How many labwares of this layout will we be sectioning on to
   */
  quantity: number;

  /**
   * The thickness of each section (slice)
   */
  sectionThickness: number;

  /**
   * Map of sampleId to colors
   */
  sampleColors: Map<number, string>;

  /**
   * The barcode of the labware we're sectioning on to (for Visium LP slides)
   */
  barcode?: string;

  /**
   * A plan for how input samples will be put onto the output labware
   */
  layoutPlan: LayoutPlan;

  /**
   * A plan returned from core
   */
  plan: Maybe<PlanMutation["plan"]>;

  /**
   * Layout plans built from core "plan"
   */
  coreLayoutPlans: Array<LayoutPlan>;
}

/**
 * Context for a {@link SectioningLayout} machine
 */
export interface SectioningLayoutContext {
  /**
   * Errors returned from the server
   */
  serverErrors: Maybe<ServerErrors>;

  /**
   * A sectioning layout
   */
  sectioningLayout: SectioningLayout;

  /**
   * Yup validator for validating the sectioning layout
   */
  validator: Yup.ObjectSchema;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: LayoutMachineActorRef;

  /**
   * Message from the label printer containing details of the printer's success
   */
  printSuccessMessage?: string;

  /**
   * Message from the label printer containing details of how the printer failed
   */
  printErrorMessage?: string;
}

function getInitialState(sectioningLayout: SectioningLayout) {
  if (!sectioningLayout.plan) {
    return "prep";
  }

  if (
    sectioningLayout.destinationLabware.labwareType.name ===
    LabwareTypeName.VISIUM_LP
  ) {
    return "printing";
  }

  return "done";
}

/**
 * Machine for the controlling how samples will be laid out into labware.
 */
export const createSectioningLayoutMachine = (
  sectioningLayout: SectioningLayout
) =>
  createMachine<SectioningLayoutContext, SectioningLayoutEvent>(
    {
      key: "sectioningLayout",
      context: {
        sectioningLayout,
        serverErrors: null,
        validator: buildValidator(
          sectioningLayout.destinationLabware.labwareType
        ),
      },
      initial: getInitialState(sectioningLayout),
      states: {
        prep: {
          initial: "invalid",
          states: {
            valid: {
              on: {
                CREATE_LABWARE: {
                  target: `#sectioningLayout.creating`,
                },
              },
            },
            invalid: {},
            error: {
              on: {
                CREATE_LABWARE: {
                  target: `#sectioningLayout.creating`,
                },
              },
            },
          },
          on: {
            UPDATE_SECTIONING_LAYOUT: {
              target: "validating",
              actions: "updateSectioningLayout",
            },
            EDIT_LAYOUT: "editingLayout",
          },
        },
        editingLayout: {
          invoke: {
            src: "layoutMachine",
            onDone: {
              target: "validating",
              actions: "assignLayoutPlan",
            },
          },
        },
        validating: {
          invoke: {
            id: "validating",
            src: "validateLayout",
            onDone: {
              target: "prep.valid",
            },
            onError: {
              target: "prep.invalid",
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
        updateSectioningLayout: assign((ctx, e) => {
          if (e.type !== "UPDATE_SECTIONING_LAYOUT") {
            return;
          }
          ctx.sectioningLayout = Object.assign(
            ctx.sectioningLayout,
            e.sectioningLayout
          );
        }),

        assignLayoutPlan: assign((ctx, e) => {
          if (e.type !== "done.invoke.layoutMachine" || !e.data) {
            return;
          }
          ctx.sectioningLayout.layoutPlan = e.data.layoutPlan;
        }),

        assignPlanResponse: assign((ctx, e) => {
          if (e.type !== "done.invoke.planSection" || !e.data) {
            return;
          }
          ctx.sectioningLayout.plan = e.data.plan;

          ctx.sectioningLayout.plan.labware.forEach((labware) => {
            ctx.sectioningLayout.coreLayoutPlans.push(
              buildLayoutPlan(
                labware,
                e.data.plan.operations,
                ctx.sectioningLayout.inputLabwares,
                ctx.sectioningLayout.sampleColors
              )
            );
          });
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
          ctx.sectioningLayout.destinationLabware.labwareType.name ===
          LabwareTypeName.VISIUM_LP,
      },

      services: {
        layoutMachine: (ctx, _e) => {
          return createLayoutMachine(ctx.sectioningLayout.layoutPlan);
        },

        validateLayout: (ctx) => ctx.validator.validate(ctx),

        planSection: (ctx) => {
          const planRequestLabware = buildPlanRequestLabware(
            ctx.sectioningLayout
          );
          const labware: PlanRequestLabware[] = new Array(
            ctx.sectioningLayout.quantity
          ).fill(planRequestLabware);
          return stanCore.Plan({
            request: { labware, operationType: "Section" },
          });
        },
      },
    }
  );

function buildPlanRequestLabware(
  sectioningLayout: SectioningLayout
): PlanRequestLabware {
  return {
    labwareType: sectioningLayout.destinationLabware.labwareType.name,
    barcode: sectioningLayout.barcode,
    actions: Array.from(
      sectioningLayout.layoutPlan.plannedActions.keys()
    ).flatMap((address) => {
      const sources = sectioningLayout.layoutPlan.plannedActions.get(address);

      if (!sources) {
        throw new Error("Source not found from planned actions");
      }

      return sources.map((source) => ({
        address,
        sampleThickness: sectioningLayout.sectionThickness,
        sampleId: source.sampleId,
        source: {
          barcode: source.labware.barcode,
          address: source.address,
        },
      }));
    }),
  };
}

/**
 * Builds the validator for {@link createSectioningLayoutMachine}
 * @param labwareType
 */
function buildValidator(labwareType: LabwareType): Yup.ObjectSchema {
  let formShape = {
    quantity: Yup.number().required().integer().min(1).max(99),
    sectionThickness: Yup.number().required().integer().min(1),
    layoutPlan: Yup.mixed()
      .test("layoutPlan", "LayoutPlan is invalid", (value) => {
        return value.plannedActions.size > 0;
      })
      .defined(),
  };

  let sectioningLayout: Yup.ObjectSchema;

  if (labwareType.name === LabwareTypeName.VISIUM_LP) {
    sectioningLayout = Yup.object()
      .shape({ barcode: Yup.string().required().min(14), ...formShape })
      .defined();
  } else {
    sectioningLayout = Yup.object().shape(formShape).defined();
  }

  return Yup.object()
    .shape({
      sectioningLayout,
    })
    .defined();
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
