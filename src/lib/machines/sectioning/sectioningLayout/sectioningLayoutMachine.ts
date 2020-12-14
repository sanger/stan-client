import { Interpreter, Machine } from "xstate";
import { LabwareType } from "../../../../types/graphql";
import * as Yup from "yup";
import {
  LabwareTypeName,
  SourcePlanRequestAction,
} from "../../../../types/stan";
import { createAddress, labwareSamples } from "../../../helpers/labwareHelper";
import { SectioningLayoutContext } from "./sectioningLayoutContext";
import {
  SectioningLayoutSchema,
  SectioningLayoutState as State,
} from "./sectioningLayoutStates";
import { SectioningLayoutEvents } from "./sectioningLayoutEvents";
import { LayoutPlan } from "../../layout";
import {
  Action,
  Guards,
  sectioningLayoutMachineOptions,
} from "./sectioningLayoutMachineOptions";
import { SectioningLayout } from "./index";

export type SectioningLayoutMachineType = Interpreter<
  SectioningLayoutContext,
  SectioningLayoutSchema,
  SectioningLayoutEvents
>;

const sectioningLayoutKey = "sectioningLayout";

/**
 * Machine for the controlling how samples will be laid out into labware.
 */
export const createSectioningLayoutMachine = (
  sectioningLayout: SectioningLayout
) =>
  Machine<
    SectioningLayoutContext,
    SectioningLayoutSchema,
    SectioningLayoutEvents
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
          entry: Action.SPAWN_LAYOUT_PLAN,
          on: {
            CANCEL_EDIT_LAYOUT: {
              target: State.VALIDATING,
            },
            DONE_EDIT_LAYOUT: {
              actions: Action.REQUEST_LAYOUT_PLAN,
            },
            UPDATE_LAYOUT_PLAN: {
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
                actions: Action.ASSIGN_PLAN_RESPONSE,
              },
              {
                target: State.PRINTING,
                actions: Action.ASSIGN_PLAN_RESPONSE,
              },
            ],
            onError: {
              target: `${State.PREP}.${State.ERROR}`,
              actions: Action.ASSIGN_SERVER_ERRORS,
            },
          },
        },
        [State.PRINTING]: {
          entry: Action.SPAWN_LABEL_PRINTER_MACHINE,
          initial: State.READY_TO_PRINT,
          states: {
            [State.READY_TO_PRINT]: {},
            [State.PRINT_SUCCESS]: {},
            [State.PRINT_ERROR]: {},
          },
          on: {
            PRINT_SUCCESS: {
              target: `.${State.PRINT_SUCCESS}`,
              actions: Action.ASSIGN_PRINT_RESPONSE,
            },
            PRINT_ERROR: {
              target: `.${State.PRINT_ERROR}`,
              actions: Action.ASSIGN_PRINT_RESPONSE,
            },
          },
        },
        [State.DONE]: {},
      },
    },
    sectioningLayoutMachineOptions
  );

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
    sourceActions: sectioningLayout.inputLabwares.reduce<
      Array<SourcePlanRequestAction>
    >((memo, labware) => {
      return [
        ...memo,
        ...labwareSamples(labware).map<SourcePlanRequestAction>(
          (labwareSample) => {
            return {
              sampleId: labwareSample.sample.id,
              source: {
                barcode: labwareSample.labware.barcode,
                address: labwareSample.slot.address,
              },
            };
          }
        ),
      ];
    }, []),
  };
}
