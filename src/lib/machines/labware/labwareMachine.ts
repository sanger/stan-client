import {Machine, MachineOptions} from "xstate";
import * as Yup from "yup";
import { LabwareLayoutFragment } from "../../../types/graphql";
import {
  LabwareContext,
  LabwareEvents,
  LabwareSchema,
  State,
} from "./labwareMachineTypes";
import { assign } from "@xstate/immer";
import * as labwareService from "../../services/labwareService";

export enum Actions {
  ASSIGN_CURRENT_BARCODE = "assignCurrentBarcode",
  ASSIGN_ERROR_MESSAGE = "assignErrorMessage",
  REMOVE_LABWARE = "removeLabware",
  ASSIGN_VALIDATION_ERROR = "assignValidationError",
  ASSIGN_FOUND_LABWARE = "assignFoundLabware",
  ASSIGN_FIND_LABWARE_ERROR = "assignFindLabwareError",
  ADD_FOUND_LABWARE = "addFoundLabware",
  FOUND_LABWARE_CHECK_ERROR = "foundLabwareCheckError",
}

export enum Activities {}

export enum Delays {}

export enum Guards {
  BARCODE_NOT_PRESENT = "barcodeNotPresent",
}

export enum Services {
  VALIDATE_BARCODE = "validateBarcode",
  FIND_LABWARE_BY_BARCODE = "findLabwareByBarcode",
  VALIDATE_FOUND_LABWARE = "validateFoundLabware",
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
      ctx.errorMessage = `"${ctx.currentBarcode}" has already been scanned`;
    }),

    [Actions.REMOVE_LABWARE]: assign((ctx, e) => {
      if (e.type !== "REMOVE_LABWARE") {
        return;
      }
      ctx.labwares = ctx.labwares.filter((lw) => lw.barcode !== e.value);
      ctx.successMessage = `"${e.value}" removed`;
    }),

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
      ctx.foundLabware = e.data
      ctx.currentBarcode = "";
    }),

    [Actions.ADD_FOUND_LABWARE]: assign((ctx, e) => {
      if (e.type !== "done.invoke.validateFoundLabware") {
        return;
      }
      ctx.labwares.push(e.data);
      ctx.foundLabware = null;
    }),

    [Actions.FOUND_LABWARE_CHECK_ERROR]: assign((ctx, e) => {
      if (e.type !== "error.platform.validateFoundLabware") {
        return;
      }
      ctx.errorMessage = e.data.join("\n");
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
    [Services.VALIDATE_FOUND_LABWARE]: (ctx: LabwareContext) => {
      return new Promise((resolve, reject) => {
        const problems = ctx.foundLabware ? ctx.foundLabwareCheck(ctx.labwares, ctx.foundLabware) : ["Labware not loaded."];
        if (problems.length === 0) {
          resolve(ctx.foundLabware);
        } else {
          reject(problems);
        }
      });
    }
  },
};

/**
 * S machine for managing a collection of {@link Labware Labwares}
 *
 * @see {@link https://xstate.js.org/docs/guides/machines.html#configuration}
 *
 * @example
 * const machine = interpret(labwareMachine);
 * machine.start();
 * machine.send({ type: "UPDATE_CURRENT_BARCODE", value: "STAN-123" });
 * machine.send({ type: "SUBMIT_BARCODE" });
 *
 * @example Overriding the default validator to require a minimum length of 3
 * const machine = interpret(labwareMachine.withContext(
 *   Object.assign({}, labwareMachine.context, { validator: Yup.string().min(3).required("Barcode is required") })
 * )
 */
export const createLabwareMachine = (labwares: LabwareLayoutFragment[] = [], foundLabwareCheck?: ((labwares: LabwareLayoutFragment[], foundLabware: LabwareLayoutFragment) => string[])) =>
  Machine<LabwareContext, LabwareSchema, LabwareEvents>(
    {
      context: {
        currentBarcode: "",
        foundLabware: null,
        labwares,
        foundLabwareCheck: (foundLabwareCheck ?? (() => [])),
        validator: Yup.string().trim().required("Barcode is required"),
        successMessage: null,
        errorMessage: null,
      },
      id: "labwareScanner",
      initial: State.IDLE,
      states: {
        [State.IDLE]: {
          initial: State.NORMAL,
          states: {
            [State.NORMAL]: {},
            [State.ERROR]: {},
            [State.SUCCESS]: {},
          },
          on: {
            UPDATE_CURRENT_BARCODE: {
              target: State.NORMAL_FQ,
              actions: Actions.ASSIGN_CURRENT_BARCODE,
            },
            SUBMIT_BARCODE: [
              // If `barcodeNotPresent` returns true, transition to `validating`
              {
                target: State.VALIDATING,
                cond: Guards.BARCODE_NOT_PRESENT,
              },
              // If `barcodeNotPresent` returned false, machine transitions here
              {
                target: State.ERROR_FQ,
                actions: Actions.ASSIGN_ERROR_MESSAGE,
              },
            ],
            REMOVE_LABWARE: {
              target: State.SUCCESS_FQ,
              actions: [Actions.REMOVE_LABWARE],
            },
            LOCK: State.LOCKED,
          },
        },
        [State.LOCKED]: {
          on: { UNLOCK: State.IDLE },
        },
        [State.VALIDATING]: {
          invoke: {
            id: "validateBarcode",
            src: Services.VALIDATE_BARCODE,
            onDone: {
              target: State.SEARCHING,
            },
            onError: {
              target: State.ERROR_FQ,
              actions: Actions.ASSIGN_VALIDATION_ERROR,
            },
          },
        },
        [State.SEARCHING]: {
          invoke: {
            id: "findLabware",
            src: Services.FIND_LABWARE_BY_BARCODE,
            onDone: {
              target: State.VALIDATING_FOUND_LABWARE,
              actions: [Actions.ASSIGN_FOUND_LABWARE],
            },
            onError: {
              target: State.ERROR_FQ,
              actions: Actions.ASSIGN_FIND_LABWARE_ERROR,
            },
          },
        },
        [State.VALIDATING_FOUND_LABWARE]: {
          invoke: {
            id: "validateFoundLabware",
            src: Services.VALIDATE_FOUND_LABWARE,
            onDone: {
              target: State.NORMAL_FQ,
              actions: [Actions.ADD_FOUND_LABWARE],
            },
            onError: {
              target: State.ERROR_FQ,
              actions: [Actions.FOUND_LABWARE_CHECK_ERROR],
            }
          }
        }
      },
    },
    labwareMachineOptions
  );
