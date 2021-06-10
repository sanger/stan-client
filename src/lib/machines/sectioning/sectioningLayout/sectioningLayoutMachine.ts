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
  extractServerErrors,
  LabwareTypeName,
  NewLabwareLayout,
  ServerErrors,
} from "../../../../types/stan";
import { labwareSamples } from "../../../helpers/labwareHelper";
import { LayoutPlan, Source } from "../../layout/layoutContext";
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
   * The planner operations returned from the plan mutation
   */
  plannedOperations: PlanMutation["plan"]["operations"];

  /**
   * The planned labware returned from the plan mutation
   */
  plannedLabware: Array<PlanMutation["plan"]["labware"][number]>;

  /**
   * Reference to a `LayoutMachine` Actor
   */
  layoutPlanRef?: LayoutMachineActorRef;

  /**
   * A layout plan
   */
  layoutPlan: LayoutPlan;

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
        plannedLabware: [],
        plannedOperations: [],
        layoutPlan: buildLayoutPlan(sectioningLayout),
      },
      initial: "prep",
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
          ctx.layoutPlan = e.data.layoutPlan;
        }),

        assignPlanResponse: assign((ctx, e) => {
          if (e.type !== "done.invoke.planSection" || !e.data) {
            return;
          }
          ctx.plannedOperations = e.data.plan.operations;
          ctx.plannedLabware = e.data.plan.labware;
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
          return createLayoutMachine(ctx.layoutPlan);
        },

        validateLayout: (ctx) => ctx.validator.validate(ctx),

        planSection: (ctx) => {
          const planRequestLabware = buildPlanRequestLabware(
            ctx.sectioningLayout,
            ctx.layoutPlan
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
  sectioningLayout: SectioningLayout,
  layoutPlan: LayoutPlan
): PlanRequestLabware {
  return {
    labwareType: sectioningLayout.destinationLabware.labwareType.name,
    barcode: sectioningLayout.barcode,
    actions: Array.from(layoutPlan.plannedActions.keys()).flatMap((address) => {
      const sources = layoutPlan.plannedActions.get(address);

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
      layoutPlan: Yup.mixed()
        .test("layoutPlan", "LayoutPlan is invalid", (value) => {
          return value.plannedActions.size > 0;
        })
        .defined(),
      sectioningLayout,
    })
    .defined();
}

/**
 * Build a {@link LayoutPlan} from a {@link SectioningLayout} to be used in a {@link LayoutPlanner}
 * @param sectioningLayout the {@link SectioningLayout}
 */
function buildLayoutPlan(sectioningLayout: SectioningLayout): LayoutPlan {
  return {
    destinationLabware: sectioningLayout.destinationLabware,
    plannedActions: new Map(),
    sampleColors: sectioningLayout.sampleColors,
    sources: sectioningLayout.inputLabwares.reduce<Array<Source>>(
      (memo, labware) => {
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
      },
      []
    ),
  };
}
