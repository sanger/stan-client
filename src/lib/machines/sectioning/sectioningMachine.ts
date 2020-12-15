import { Actor, Machine, send } from "xstate";
import { SectioningContext } from "./sectioningContext";
import { SectioningSchema, State } from "./sectioningStates";
import { SectioningEvents } from "./sectioningEvents";
import {
  Action,
  machineKey,
  sectioningMachineOptions,
} from "./sectioningMachineOptions";
import { LabwareTypeName } from "../../../types/stan";
import { buildConfirmOperationRequest } from "../../factories/confirmOperationRequest";

/**
 * Machine for controlling the sectioning workflow.
 *
 * @see {@link labwareMachine}
 */
export const createSectioningMachine = () =>
  Machine<SectioningContext, SectioningSchema, SectioningEvents>(
    {
      key: machineKey,
      initial: State.LOADING,
      context: {
        inputLabwareTypeNames: [LabwareTypeName.PROVIASETTE],
        inputLabwareTypes: [],
        outputLabwareTypeNames: [
          LabwareTypeName.TUBE,
          LabwareTypeName.SLIDE,
          LabwareTypeName.VISIUM_TO,
          LabwareTypeName.VISIUM_LP,
        ],
        outputLabwareTypes: [],
        selectedLabwareType: null,
        labwareMachine: null,
        sourceLabwares: [],
        sectioningLayouts: [],
        sampleColors: new Map(),
        confirmOperationLabware: [],
      },
      states: {
        [State.LOADING]: {
          invoke: {
            id: "getSectioningInfo",
            src: "getSectioningInfo",
            onDone: {
              target: State.UNKNOWN,
              actions: Action.ASSIGN_LABWARE_TYPES,
            },
            onError: {
              target: State.ERROR,
            },
          },
        },
        [State.ERROR]: {},
        [State.UNKNOWN]: {
          // Transition state (immediately transitions to another state)
          always: [
            {
              cond: "noSourceLabwares",
              target: State.READY,
            },
            {
              cond: "noLayouts",
              target: `${State.STARTED}.${State.SOURCE_SCANNING}`,
            },
            { target: `${State.STARTED}.${State.PREPARING_LABWARE}` },
          ],
        },
        [State.READY]: {
          entry: Action.SPAWN_LABWARE_MACHINE,
          on: {
            UPDATE_LABWARES: {
              target: State.UNKNOWN,
              actions: Action.UPDATE_LABWARES,
            },
          },
        },
        [State.STARTED]: {
          states: {
            [State.SOURCE_SCANNING]: {
              entry: send("UNLOCK", {
                to: (ctx) => ctx.labwareMachine as Actor,
              }),
              on: {
                UPDATE_LABWARES: {
                  actions: Action.UPDATE_LABWARES,
                  target: `#${machineKey}.${State.UNKNOWN}`,
                },
                ADD_LABWARE_LAYOUT: {
                  actions: Action.ADD_LABWARE_LAYOUT,
                  target: `#${machineKey}.${State.UNKNOWN}`,
                },
              },
            },
            [State.PREPARING_LABWARE]: {
              entry: send("LOCK", { to: (ctx) => ctx.labwareMachine as Actor }),
              on: {
                DELETE_LABWARE_LAYOUT: {
                  actions: Action.DELETE_LABWARE_LAYOUT,
                  target: `#${machineKey}.${State.UNKNOWN}`,
                },
                ADD_LABWARE_LAYOUT: {
                  actions: Action.ADD_LABWARE_LAYOUT,
                  target: `#${machineKey}.${State.UNKNOWN}`,
                },
                "done.invoke.planSection": {
                  actions: Action.ASSIGN_PLAN,
                  target: `#${machineKey}.${State.UNKNOWN}`,
                },
              },
            },
          },
          on: {
            SELECT_LABWARE_TYPE: {
              actions: Action.SELECT_LABWARE_TYPE,
            },

            PREP_DONE: {
              target: `#${machineKey}.${State.OUTCOMES}`,
            },
          },
        },
        [State.OUTCOMES]: {
          on: {
            BACK_TO_PREP: {
              target: State.UNKNOWN,
            },
          },
        },
      },
    },
    sectioningMachineOptions
  );
