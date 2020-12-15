import { assign } from "@xstate/immer";
import { SectioningContext } from "./sectioningContext";
import { SectioningEvents } from "./sectioningEvents";
import { MachineOptions, spawn } from "xstate";
import { current } from "immer";
import {
  SectioningLayout,
  SectioningLayoutContext,
  SectioningLayoutEvents,
} from "./sectioningLayout";
import sectioningService from "../../services/sectioningService";
import { createSectioningLayoutMachine } from "./sectioningLayout/sectioningLayoutMachine";
import { buildSampleColors } from "../../helpers/labwareHelper";
import { unregisteredLabwareFactory } from "../../factories/labwareFactory";
import { LabwareTypeName } from "../../../types/stan";
import { createLabwareMachine } from "../labware/labwareMachine";
import { buildConfirmOperationLabware } from "../../factories/confirmOperationRequest";
import { createSectioningOutcomeMachine } from "./sectioningOutcome/sectioningOutcomeMachine";

export const machineKey = "sectioningMachine";

export enum Action {
  SELECT_LABWARE_TYPE = "selectLabwareType",
  ASSIGN_LABWARE_TYPES = "assignLabwareTypes",
  SPAWN_LABWARE_MACHINE = "spawnLabwareMachine",
  UPDATE_LABWARES = "updateLabwares",
  ADD_LABWARE_LAYOUT = "addLabwareLayout",
  DELETE_LABWARE_LAYOUT = "deleteLabwareLayout",
  ASSIGN_PLAN = "assignPlan",
}

export const sectioningMachineOptions: Partial<MachineOptions<
  SectioningContext,
  SectioningEvents
>> = {
  actions: {
    [Action.SELECT_LABWARE_TYPE]: assign<SectioningContext, SectioningEvents>(
      (ctx, e) => {
        if (e.type !== "SELECT_LABWARE_TYPE") {
          return;
        }
        ctx.selectedLabwareType = e.labwareType;
      }
    ),

    [Action.ASSIGN_LABWARE_TYPES]: assign<SectioningContext, SectioningEvents>(
      (ctx, e) => {
        if (e.type !== "done.invoke.getSectioningInfo") {
          return;
        }
        ctx.inputLabwareTypes = e.data.labwareTypes.filter((lt) =>
          ctx.inputLabwareTypeNames.includes(lt.name)
        );
        ctx.outputLabwareTypes = e.data.labwareTypes.filter((lt) =>
          ctx.outputLabwareTypeNames.includes(lt.name)
        );
        ctx.selectedLabwareType = ctx.outputLabwareTypes[0];
      }
    ),

    [Action.SPAWN_LABWARE_MACHINE]: assign<SectioningContext, SectioningEvents>(
      (ctx) => {
        ctx.labwareMachine = spawn(
          createLabwareMachine(current(ctx).sourceLabwares)
        );
      }
    ),

    [Action.UPDATE_LABWARES]: assign<SectioningContext, SectioningEvents>(
      (ctx, e) => {
        if (e.type !== "UPDATE_LABWARES") {
          return;
        }
        ctx.sourceLabwares = e.labwares;
        ctx.sampleColors = buildSampleColors(e.labwares);
      }
    ),

    [Action.ADD_LABWARE_LAYOUT]: assign<SectioningContext, SectioningEvents>(
      (ctx, e) => {
        if (e.type !== "ADD_LABWARE_LAYOUT") {
          return;
        }
        const copy = current(ctx);

        const sectioningLayout: SectioningLayout = buildSectioningLayout(copy);

        ctx.sectioningLayouts.push({
          ...sectioningLayout,
          ref: spawn<SectioningLayoutContext, SectioningLayoutEvents>(
            createSectioningLayoutMachine(sectioningLayout)
          ),
        });
      }
    ),

    [Action.DELETE_LABWARE_LAYOUT]: assign<SectioningContext, SectioningEvents>(
      (ctx, e) => {
        if (e.type !== "DELETE_LABWARE_LAYOUT") {
          return;
        }
        ctx.sectioningLayouts.splice(e.index, 1);
      }
    ),

    [Action.ASSIGN_PLAN]: assign((ctx, e) => {
      if (e.type !== "done.invoke.planSection" || !e.data.data) {
        return;
      }

      e.data.data.plan.labware.forEach((labware) => {
        const confirmOperationLabware = buildConfirmOperationLabware(labware);

        ctx.confirmOperationLabware.push({
          ...confirmOperationLabware,
          ref: spawn(createSectioningOutcomeMachine([], labware)),
        });
      });
    }),
  },

  guards: {
    noLayouts: (ctx) => ctx.sectioningLayouts.length === 0,
    noSourceLabwares: (ctx) => ctx.sourceLabwares.length === 0,
  },

  services: {
    getSectioningInfo: sectioningService.getSectioningInfo,
  },
};

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
