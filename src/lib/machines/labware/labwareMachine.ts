import { Machine } from "xstate";
import * as Yup from "yup";
import { LabwareContext, LabwareSchema } from ".";
import { Labware } from "../../../types/graphql";
import { LabwareEvents } from "./labwareEvents";
import { State } from "./labwareStates";
import {
  Actions,
  Guards,
  labwareMachineOptions,
  Services,
} from "./labwareMachineOptions";

/**
 * State machine for managing a collection of {@link Labware Labwares}
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
  Machine<LabwareContext, LabwareSchema, LabwareEvents>(
    {
      context: {
        currentBarcode: "",
        labwares,
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
              actions: [Actions.REMOVE_LABWARE, Actions.NOTIFY_PARENT],
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
              target: State.NORMAL_FQ,
              actions: [Actions.ASSIGN_FOUND_LABWARE, Actions.NOTIFY_PARENT],
            },
            onError: {
              target: State.ERROR_FQ,
              actions: Actions.ASSIGN_FIND_LABWARE_ERROR,
            },
          },
        },
      },
    },
    labwareMachineOptions
  );
