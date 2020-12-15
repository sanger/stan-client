import { assign } from "@xstate/immer";
import { SectioningLayoutContext } from "./sectioningLayoutContext";
import { SectioningLayoutEvents } from "./sectioningLayoutEvents";
import { current } from "immer";
import { Actor, MachineOptions, send, sendParent, spawn } from "xstate";
import { LayoutContext, LayoutEvents } from "../../layout";
import { RequestLayoutPlanEvent } from "../../layout/layoutEvents";
import { extractServerErrors, LabwareTypeName } from "../../../../types/stan";
import {
  PlanAction,
  PlanRequestAction,
  PlanRequestLabware,
} from "../../../../types/graphql";
import sectioningService from "../../../services/sectioningService";
import { createLayoutMachine } from "../../layout/layoutMachine";
import { SectioningLayout } from "./index";
import { createLabelPrinterMachine } from "../../labelPrinter/labelPrinterMachine";
import { LayoutPlan } from "../../layout/layoutContext";

export enum Action {
  UPDATE_SECTIONING_LAYOUT = "updateSectioningLayout",
  SPAWN_LAYOUT_PLAN = "spawnLayoutPlan",
  REQUEST_LAYOUT_PLAN = "sendRequestLayoutPlan",
  ASSIGN_LAYOUT_PLAN = "assignLayoutPlan",
  ASSIGN_PLAN_RESPONSE = "assignPlanResponse",
  NOTIFY_PARENT_PLAN = "notifyParentPlan",
  ASSIGN_SERVER_ERRORS = "assignServerErrors",
  SPAWN_LABEL_PRINTER_MACHINE = "spawnLabelPrinterMachines",
  ASSIGN_PRINT_RESPONSE = "assignPrintResponse",
}

export enum Guards {
  IS_VISIUM_LP = "isVisiumLP",
}

export const sectioningLayoutMachineOptions: Partial<MachineOptions<
  SectioningLayoutContext,
  SectioningLayoutEvents
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

    [Action.SPAWN_LAYOUT_PLAN]: assign((ctx, _e) => {
      const copy = current(ctx);
      ctx.layoutPlanRef = spawn<LayoutContext, LayoutEvents>(
        createLayoutMachine(copy.layoutPlan)
      );
    }),

    [Action.REQUEST_LAYOUT_PLAN]: send<
      SectioningLayoutContext,
      SectioningLayoutEvents,
      RequestLayoutPlanEvent
    >("REQUEST_LAYOUT_PLAN", {
      to: (context) => context.layoutPlanRef as Actor,
    }),

    [Action.ASSIGN_LAYOUT_PLAN]: assign((ctx, e) => {
      if (e.type !== "UPDATE_LAYOUT_PLAN") {
        return;
      }
      ctx.layoutPlan = e.layoutPlan;
    }),

    [Action.ASSIGN_PLAN_RESPONSE]: assign((ctx, e) => {
      if (e.type !== "done.invoke.planSection" || !e.data.data) {
        return;
      }
      ctx.plannedOperations = e.data.data.plan.operations;
      ctx.plannedLabware = e.data.data.plan.labware.map((labware) => {
        return {
          ...labware,
          actorRef: spawn(
            createLabelPrinterMachine(
              { labwareBarcodes: [labware.barcode] },
              { fetchPrinters: true }
            )
          ),
        };
      });
    }),

    [Action.ASSIGN_SERVER_ERRORS]: assign((ctx, e) => {
      if (e.type !== "error.platform.planSection") {
        return;
      }
      ctx.serverErrors = extractServerErrors(e.data);
    }),

    [Action.SPAWN_LABEL_PRINTER_MACHINE]: assign((ctx, e) => {
      const currentCtx = current(ctx);
      const labwareBarcodes = currentCtx.plannedLabware.map((lw) => lw.barcode);
      const subscribers = new Set(
        currentCtx.plannedLabware.map((lw) => lw.actorRef as Actor)
      );
      ctx.labelPrinterRef = spawn(
        createLabelPrinterMachine({ labwareBarcodes }, { subscribers })
      );
    }),

    [Action.ASSIGN_PRINT_RESPONSE]: assign((ctx, e) => {
      if (e.type === "PRINT_SUCCESS") {
        ctx.printSuccessMessage = e.message;
        ctx.printErrorMessage = undefined;
      } else if (e.type === "PRINT_ERROR") {
        ctx.printSuccessMessage = undefined;
        ctx.printErrorMessage = e.message;
      }
    }),
  },

  guards: {
    [Guards.IS_VISIUM_LP]: (ctx) =>
      ctx.sectioningLayout.destinationLabware.labwareType.name ===
      LabwareTypeName.VISIUM_LP,
  },

  services: {
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
        throw new Error("Mess up here");
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
