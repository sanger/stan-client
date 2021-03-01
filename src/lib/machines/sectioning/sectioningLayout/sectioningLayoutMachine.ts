import { forwardTo, Machine, MachineOptions, sendParent } from "xstate";
import { LabwareType, PlanRequestLabware } from "../../../../types/graphql";
import * as Yup from "yup";
import { extractServerErrors, LabwareTypeName } from "../../../../types/stan";
import { labwareSamples } from "../../../helpers/labwareHelper";
import { LayoutPlan, Source } from "../../layout/layoutContext";
import {
  SectioningLayout,
  SectioningLayoutContext,
  SectioningLayoutEvent,
  SectioningLayoutSchema,
  State,
} from "./sectioningLayoutTypes";
import { assign } from "@xstate/immer";
import { createLayoutMachine } from "../../layout/layoutMachine";
import * as sectioningService from "../../../services/sectioningService";
import { prepComplete } from "./sectioningLayoutEvents";

const sectioningLayoutKey = "sectioningLayout";

enum Action {
  UPDATE_SECTIONING_LAYOUT = "updateSectioningLayout",
  SPAWN_LAYOUT_PLAN = "spawnLayoutPlan",
  ASSIGN_LAYOUT_PLAN = "assignLayoutPlan",
  ASSIGN_PLAN_RESPONSE = "assignPlanResponse",
  NOTIFY_PARENT_PLAN = "notifyParentPlan",
  ASSIGN_SERVER_ERRORS = "assignServerErrors",
}

enum Guards {
  IS_VISIUM_LP = "isVisiumLP",
}

enum Services {
  LAYOUT_MACHINE = "layoutMachine",
}

/**
 * Machine for the controlling how samples will be laid out into labware.
 */
export const createSectioningLayoutMachine = (
  sectioningLayout: SectioningLayout
) =>
  Machine<
    SectioningLayoutContext,
    SectioningLayoutSchema,
    SectioningLayoutEvent
  >(
    {
      key: sectioningLayoutKey,
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
      initial: State.PREP,
      states: {
        [State.PREP]: {
          initial: State.INVALID,
          states: {
            [State.VALID]: {
              on: {
                CREATE_LABWARE: {
                  target: `#${sectioningLayoutKey}.${State.CREATING}`,
                },
              },
            },
            [State.INVALID]: {},
            [State.ERROR]: {
              on: {
                CREATE_LABWARE: {
                  target: `#${sectioningLayoutKey}.${State.CREATING}`,
                },
              },
            },
          },
          on: {
            UPDATE_SECTIONING_LAYOUT: {
              target: State.VALIDATING,
              actions: Action.UPDATE_SECTIONING_LAYOUT,
            },
            EDIT_LAYOUT: State.EDITING_LAYOUT,
          },
        },
        [State.EDITING_LAYOUT]: {
          invoke: {
            src: Services.LAYOUT_MACHINE,
            onDone: {
              target: State.VALIDATING,
              actions: Action.ASSIGN_LAYOUT_PLAN,
            },
          },
        },
        [State.VALIDATING]: {
          invoke: {
            id: "validating",
            src: "validateLayout",
            onDone: {
              target: `${State.PREP}.${State.VALID}`,
            },
            onError: {
              target: `${State.PREP}.${State.INVALID}`,
            },
          },
        },
        [State.CREATING]: {
          invoke: {
            id: "planSection",
            src: "planSection",
            onDone: [
              {
                cond: Guards.IS_VISIUM_LP,
                target: State.DONE,
                actions: [
                  Action.ASSIGN_PLAN_RESPONSE,
                  forwardTo("sectioningMachine"),
                  sendParent(prepComplete()),
                ],
              },
              {
                target: State.PRINTING,
                actions: [
                  Action.ASSIGN_PLAN_RESPONSE,
                  forwardTo("sectioningMachine"),
                  sendParent(prepComplete()),
                ],
              },
            ],
            onError: {
              target: `${State.PREP}.${State.ERROR}`,
              actions: Action.ASSIGN_SERVER_ERRORS,
            },
          },
        },
        [State.PRINTING]: {},
        [State.DONE]: {},
      },
    },
    sectioningLayoutMachineOptions
  );

const sectioningLayoutMachineOptions: Partial<MachineOptions<
  SectioningLayoutContext,
  SectioningLayoutEvent
>> = {
  actions: {
    [Action.UPDATE_SECTIONING_LAYOUT]: assign((ctx, e) => {
      if (e.type !== "UPDATE_SECTIONING_LAYOUT") {
        return;
      }
      ctx.sectioningLayout = Object.assign(
        ctx.sectioningLayout,
        e.sectioningLayout
      );
    }),

    [Action.ASSIGN_LAYOUT_PLAN]: assign((ctx, e) => {
      if (e.type !== "done.invoke.layoutMachine" || !e.data) {
        return;
      }
      ctx.layoutPlan = e.data.layoutPlan;
    }),

    [Action.ASSIGN_PLAN_RESPONSE]: assign((ctx, e) => {
      if (e.type !== "done.invoke.planSection" || !e.data.data) {
        return;
      }
      ctx.plannedOperations = e.data.data.plan.operations;
      ctx.plannedLabware = e.data.data.plan.labware;
    }),

    [Action.ASSIGN_SERVER_ERRORS]: assign((ctx, e) => {
      if (e.type !== "error.platform.planSection") {
        return;
      }
      ctx.serverErrors = extractServerErrors(e.data);
    }),
  },

  guards: {
    [Guards.IS_VISIUM_LP]: (ctx) =>
      ctx.sectioningLayout.destinationLabware.labwareType.name ===
      LabwareTypeName.VISIUM_LP,
  },

  services: {
    [Services.LAYOUT_MACHINE]: (ctx, _e) => {
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
      return sectioningService.planSection({ labware });
    },
  },
};

function buildPlanRequestLabware(
  sectioningLayout: SectioningLayout,
  layoutPlan: LayoutPlan
): PlanRequestLabware {
  return {
    labwareType: sectioningLayout.destinationLabware.labwareType.name,
    barcode: sectioningLayout.barcode,
    actions: Array.from(layoutPlan.plannedActions.keys()).map((address) => {
      const source = layoutPlan.plannedActions.get(address);

      if (!source) {
        throw new Error("Source not found from planned actions");
      }

      return {
        address,
        sampleThickness: sectioningLayout.sectionThickness,
        sampleId: source.sampleId,
        source: {
          barcode: source.labware.barcode,
          address: source.address,
        },
      };
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
