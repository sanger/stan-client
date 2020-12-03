import { Actor, Machine, send } from "xstate";
import { SectioningContext } from "./sectioningContext";
import { SectioningSchema, State } from "./sectioningStates";
import { SectioningEvents } from "./sectioningEvents";
import {
  Action,
  machineKey,
  sectioningMachineOptions,
} from "./sectioningMachineOptions";
import { Labware } from "../../../types/graphql";
import { LabwareTypeName, UnregisteredLabware } from "../../../types/stan";

/**
 * Model of a sectioning layout
 */
export interface SectioningLayout {
  /**
   * The labwares available to section from
   */
  inputLabwares: Labware[];

  /**
   * The unregistered labware we are sectioning on to
   */
  destinationLabware: UnregisteredLabware;

  /**
   * How many labwares of this layout will we be sectioning on to
   */
  quantity: number;

  /**
   * The thinkness of each section (slice)
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
          entry: "spawnLabwareMachine",
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
              },
            },
          },
          on: {
            SELECT_LABWARE_TYPE: {
              actions: Action.SELECT_LABWARE_TYPE,
            },
          },
        },
      },
    },
    sectioningMachineOptions
  );
