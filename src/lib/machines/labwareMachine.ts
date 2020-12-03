import { assign, Interpreter, Machine, sendParent } from "xstate";
import { Labware, Maybe } from "../../types/graphql";
import labwareService from "../services/labwareService";
import * as Yup from "yup";
import { ValidationError } from "yup";

/**
 * Context for a {@link labwareMachine}.
 */
export interface LabwareMachineContext {
  /**
   * The current barcode we're working with
   */
  currentBarcode: string;

  /**
   * The list of sourceLabwares fetched so far
   */
  labwares: Labware[];

  /**
   * A {@link https://github.com/jquense/yup#string Yup string schema} to validate the barcode on submission
   */
  validator: Yup.StringSchema;

  /**
   * The current success message
   */
  successMessage: Maybe<string>;

  /**
   * The current error message
   */
  errorMessage: Maybe<string>;
}

/**
 * The states of a {@link labwareMachine}
 */
export interface LabwareMachineSchema {
  states: {
    /**
     * Waiting for user input
     */
    idle: {
      states: {
        normal: {};
        error: {};
        success: {};
      };
    };
    /**
     * No labware can be added or removed.
     */
    locked: {};
    /**
     * Running the validator from {@link LabwareMachineContext}
     */
    validating: {};

    /**
     * Using the findLabwareByBarcode service to look up the labware
     */
    searching: {};
  };
}

/**
 * Event to be called whenever the barcode changes
 */
type UpdateCurrentBarcodeEvent = {
  type: "UPDATE_CURRENT_BARCODE";
  value: string;
};

/**
 * Event to be called when current barcode is to be submitted
 */
type SubmitBarcodeEvent = { type: "SUBMIT_BARCODE" };

/**
 * Event to be called to remove a piece of labware from context
 */
type RemoveLabwareEvent = { type: "REMOVE_LABWARE"; value: string };

/**
 * Event to be called when machine is to be locked
 */
type LockEvent = { type: "LOCK" };

/**
 * Event to unlock the machine
 */
type UnlockEvent = { type: "UNLOCK" };

export type UpdateLabwaresEvent = {
  type: "UPDATE_LABWARES";
  labwares: Labware[];
};

/**
 * All the Events for {@link labwareMachine}
 */
export type LabwareMachineEvents =
  | UpdateCurrentBarcodeEvent
  | SubmitBarcodeEvent
  | RemoveLabwareEvent
  | LockEvent
  | UnlockEvent;

export type LabwareMachineType = Interpreter<
  LabwareMachineContext,
  LabwareMachineSchema,
  LabwareMachineEvents
>;

/**
 * State machine for managing a list of sourceLabwares
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
export const createLabwareMachine = (labwares: Labware[] = []) =>
  Machine<LabwareMachineContext, LabwareMachineSchema, LabwareMachineEvents>(
    {
      context: {
        currentBarcode: "",
        labwares,
        validator: Yup.string().trim().required("Barcode is required"),
        successMessage: null,
        errorMessage: null,
      },
      id: "labwareScanner",
      key: "labwareScanner",
      initial: "idle",
      states: {
        idle: {
          key: "idle",
          initial: "normal",
          states: {
            normal: {},
            error: {},
            success: {},
          },
          on: {
            UPDATE_CURRENT_BARCODE: {
              target: ".normal",
              actions: assign({
                currentBarcode: (_ctx, e: UpdateCurrentBarcodeEvent) =>
                  e.value.replace(/\s+/g, ""),
              }),
            },
            SUBMIT_BARCODE: [
              // If `barcodeNotPresent` returns true, transition to `validating`
              {
                target: "validating",
                cond: "barcodeNotPresent",
              },
              // If `barcodeNotPresent` returned false, machine transitions here
              {
                target: ".error",
                actions: assign({
                  errorMessage: (ctx, _e) =>
                    `"${ctx.currentBarcode}" is already in the table`,
                }),
              },
            ],
            REMOVE_LABWARE: {
              target: ".success",
              actions: [
                assign({
                  labwares: (ctx, e) =>
                    ctx.labwares.filter((lw) => lw.barcode !== e.value),
                  successMessage: (ctx, e) => `"${e.value}" removed`,
                }),
                "updateLabwares",
              ],
            },
            LOCK: "locked",
          },
        },
        locked: {
          on: { UNLOCK: "idle.normal" },
        },
        validating: {
          invoke: {
            id: "validateBarcode",
            src: "validateBarcode",
            onDone: {
              target: "searching",
            },
            onError: {
              target: "idle.error",
              actions: assign({
                errorMessage: (_ctx, e) =>
                  (e.data as ValidationError).errors.join("\n"),
              }),
            },
          },
        },
        searching: {
          invoke: {
            id: "findLabware",
            src: "findLabwareByBarcode",
            onDone: {
              target: "idle.normal",
              actions: [
                assign((ctx: LabwareMachineContext, e) => {
                  return {
                    labwares: [...ctx.labwares, e.data],
                    currentBarcode: "",
                  };
                }),
                "updateLabwares",
              ],
            },
            onError: {
              target: "idle.error",
              actions: assign({
                errorMessage: (_ctx, e) =>
                  e.data.message.match(/^.*\s:\s(.*)$/)[1],
              }),
            },
          },
        },
      },
    },
    {
      actions: {
        updateLabwares: sendParent((ctx: LabwareMachineContext) => ({
          type: "UPDATE_LABWARES",
          labwares: ctx.labwares,
        })),
      },
      guards: {
        barcodeNotPresent: (ctx: LabwareMachineContext, _e) => {
          return !ctx.labwares
            .map((lw) => lw.barcode)
            .includes(ctx.currentBarcode);
        },
      },
      services: {
        findLabwareByBarcode: (ctx: LabwareMachineContext) =>
          labwareService.findLabwareByBarcode(ctx.currentBarcode),
        validateBarcode: (ctx: LabwareMachineContext) =>
          ctx.validator.validate(ctx.currentBarcode),
      },
    }
  );
