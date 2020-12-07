import { MachineOptions, sendParent } from "xstate";
import { assign } from "@xstate/immer";
import { LabwareContext } from "./labwareContext";
import { LabwareEvents } from "./labwareEvents";
import labwareService from "../../services/labwareService";

export enum Actions {
  ASSIGN_CURRENT_BARCODE = "assignCurrentBarcode",
  ASSIGN_ERROR_MESSAGE = "assignErrorMessage",
  REMOVE_LABWARE = "removeLabware",
  NOTIFY_PARENT = "notifyParent",
  ASSIGN_VALIDATION_ERROR = "assignValidationError",
  ASSIGN_FOUND_LABWARE = "assignFoundLabware",
  ASSIGN_FIND_LABWARE_ERROR = "assignFindLabwareError",
}

export enum Activities {}

export enum Delays {}

export enum Guards {
  BARCODE_NOT_PRESENT = "barcodeNotPresent",
}

export enum Services {
  VALIDATE_BARCODE = "validateBarcode",
  FIND_LABWARE_BY_BARCODE = "findLabwareByBarcode",
}

export const labwareMachineOptions: Partial<MachineOptions<
  LabwareContext,
  LabwareEvents
>> = {
  actions: {
    [Actions.ASSIGN_CURRENT_BARCODE]: assign((ctx, e) => {
      if (e.type !== "UPDATE_CURRENT_BARCODE") {
        return;
      }
      ctx.currentBarcode = e.value.replace(/\s+/g, "");
    }),

    [Actions.ASSIGN_ERROR_MESSAGE]: assign((ctx, e) => {
      if (e.type !== "SUBMIT_BARCODE") {
        return;
      }
      ctx.errorMessage = `"${ctx.currentBarcode}" is already in the table`;
    }),

    [Actions.REMOVE_LABWARE]: assign((ctx, e) => {
      if (e.type !== "REMOVE_LABWARE") {
        return;
      }
      ctx.labwares = ctx.labwares.filter((lw) => lw.barcode !== e.value);
      ctx.successMessage = `"${e.value}" removed`;
    }),

    [Actions.NOTIFY_PARENT]: sendParent((ctx: LabwareContext) => ({
      type: "UPDATE_LABWARES",
      labwares: ctx.labwares,
    })),

    [Actions.ASSIGN_VALIDATION_ERROR]: assign((ctx, e) => {
      if (e.type !== "error.platform.validateBarcode") {
        return;
      }
      ctx.errorMessage = e.data.errors.join("\n");
    }),

    [Actions.ASSIGN_FOUND_LABWARE]: assign((ctx, e) => {
      if (e.type !== "done.invoke.findLabware") {
        return;
      }
      ctx.labwares.push(e.data);
      ctx.currentBarcode = "";
    }),

    [Actions.ASSIGN_FIND_LABWARE_ERROR]: assign((ctx, e) => {
      if (e.type !== "error.platform.findLabware") {
        return;
      }
      const matchResult = e.data.message.match(/^.*\s:\s(.*)$/);
      if (matchResult && matchResult.length > 1) {
        ctx.errorMessage = matchResult[1];
      }
    }),
  },
  activities: {},
  delays: {},
  guards: {
    [Guards.BARCODE_NOT_PRESENT]: (ctx: LabwareContext, _e) => {
      return !ctx.labwares.map((lw) => lw.barcode).includes(ctx.currentBarcode);
    },
  },
  services: {
    [Services.FIND_LABWARE_BY_BARCODE]: (ctx: LabwareContext) =>
      labwareService.findLabwareByBarcode(ctx.currentBarcode),
    [Services.VALIDATE_BARCODE]: (ctx: LabwareContext) =>
      ctx.validator.validate(ctx.currentBarcode),
  },
};
