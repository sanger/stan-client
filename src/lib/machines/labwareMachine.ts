import { assign, Interpreter, Machine } from "xstate";
import { Labware, Maybe } from "../../types/graphql";
import labwareService from "../services/labwareService";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { getGraphQLProblems } from "../client";

/**
 * Context for a {@link labwareMachine}.
 */
export interface LabwareMachineContext {
  /**
   * The current barcode we're working with
   */
  currentBarcode: string;

  /**
   * The list of labwares fetched so far
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
 * All the Events for {@link labwareMachine}
 */
export type LabwareMachineEvents =
  | UpdateCurrentBarcodeEvent
  | SubmitBarcodeEvent
  | RemoveLabwareEvent;

export type LabwareMachineType = Interpreter<
  LabwareMachineContext,
  LabwareMachineSchema,
  LabwareMachineEvents
>;

/**
 * State machine for managing a list of labwares
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
const labwareMachine = Machine<
  LabwareMachineContext,
  LabwareMachineSchema,
  LabwareMachineEvents
>(
  {
    context: {
      currentBarcode: "",
      labwares: [],
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
            actions: assign({
              labwares: (ctx, e) =>
                ctx.labwares.filter((lw) => lw.barcode !== e.value),
              successMessage: (ctx, e) => `"${e.value}" removed`,
            }),
          },
        },
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
            actions: assign((ctx: LabwareMachineContext, e) => {
              return {
                labwares: [...ctx.labwares, e.data],
                currentBarcode: "",
              };
            }),
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

export default labwareMachine;
