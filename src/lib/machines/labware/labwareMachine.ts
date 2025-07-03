import { assign, createMachine, fromPromise } from 'xstate';
import * as Yup from 'yup';
import {
  FindFlaggedLabwareQuery,
  FindLabwareQuery,
  GetLabwareInLocationQuery,
  LabwareFlaggedFieldsFragment,
  Maybe
} from '../../../types/sdk';
import { extractServerErrors } from '../../../types/stan';
import { stanCore } from '../../sdk';
import { ClientError } from 'graphql-request';
import { convertLabwareToFlaggedLabware } from '../../helpers/labwareHelper';
import { produce } from '../../../dependencies/immer';
import { findIndex } from 'lodash';

const resolveStringArrayPromise = (data: string[] | Promise<string[]>): string[] => {
  let resolvedData: string[] = [];
  if (!Array.isArray(data)) {
    data.then((resolved) => {
      resolvedData = resolved;
    });
  } else {
    resolvedData = data;
  }
  return resolvedData;
};

export interface LabwareContext {
  /**
   * The current barcode we're working with
   */
  currentBarcode: string;

  /**
   * The labware loaded from a scanned barcode
   */
  foundLabware: Maybe<LabwareFlaggedFieldsFragment>;

  /**
   * The list of sourceLabwares fetched so far
   */
  labwares: LabwareFlaggedFieldsFragment[];

  /**
   * The most recently removed labware
   */
  removedLabware: Maybe<{ labware: LabwareFlaggedFieldsFragment; index: number }>;

  /**
   * A {@link https://github.com/jquense/yup#string Yup string schema} to validate the barcode on submission
   */
  validator: Yup.StringSchema;

  /**
   * A function that checks if the given item of found labware may be added to the given existing labware
   * @param labwares the labware already entered
   * @param foundLabware the new labware to be entered
   * @return a list of any problems identified
   */
  foundLabwareCheck?: (
    labwares: LabwareFlaggedFieldsFragment[],
    foundLabware: LabwareFlaggedFieldsFragment
  ) => string[] | Promise<string[]>;

  /**
   * The current success message
   */
  successMessage: Maybe<string>;

  /**
   * The current error message
   */
  errorMessage: Maybe<string>;

  /**
   * Flag for Location barcode scan. If true, it will be  a location barcode scan, else a labware scan
   */
  locationScan?: boolean;

  /**
   * The maximum number of labware to hold in context
   */
  limit?: number;

  /**
   * When set to true runs FindFlaggedLabware instead of FindLabware
   */
  enableFlaggedLabwareCheck?: boolean;

  /**
   * When set to true checks for cleaned out addresses
   */
  checkForCleanedOutAddresses?: boolean;

  /**
   * Map to store the cleaned out addresses for the different scanned labware
   * key: the labware id
   * value: list of cleaned out addresses
   */
  cleanedOutAddresses: Map<number, string[]>;

  /**
   * Indicates whether the initial labware and cleaned out addresses have been set in the context.
   * Used to prevent re-initialization of these values.
   */
  areInitialsSet?: boolean;
}

/**
 * Event to be called whenever the barcode changes
 */
type UpdateCurrentBarcodeEvent = {
  type: 'UPDATE_CURRENT_BARCODE';
  value: string;
  locationScan?: boolean;
};

/**
 * Event to be called when current barcode is to be submitted
 */
type SubmitBarcodeEvent = { type: 'SUBMIT_BARCODE'; barcode?: string };

/**
 * Event to be called to remove a piece of labware from context
 */
type RemoveLabwareEvent = { type: 'REMOVE_LABWARE'; value: string };

/**
 * Event to be called when machine is to be locked
 */
type LockEvent = { type: 'LOCK' };

/**
 * Event to unlock the machine
 */
type UnlockEvent = { type: 'UNLOCK' };

type ValidationErrorEvent = {
  type: 'xstate.error.actor.validateBarcode';
  error: Yup.ValidationError;
};

type FindLocationDoneEvent = {
  type: 'xstate.done.actor.findLocation';
  output: GetLabwareInLocationQuery;
};

type FindLocationErrorEvent = {
  type: 'xstate.error.actor.findLocation';
  error: ClientError;
};
type FindLabwareDoneEvent = {
  type: 'xstate.done.actor.findLabware';
  output: FindLabwareQuery;
};

type FindFlaggedLabwareDoneEvent = {
  type: 'xstate.done.actor.findLabware';
  output: FindFlaggedLabwareQuery;
};

type FindLabwareErrorEvent = {
  type: 'xstate.error.actor.findLabware';
  error: ClientError;
};

type AddFoundLabwareEvent = {
  type: 'xstate.done.actor.validateFoundLabware';
  output: LabwareFlaggedFieldsFragment;
};

type FoundLabwareCheckErrorEvent = {
  type: 'xstate.error.actor.validateFoundLabware';
  error: string[];
};

type FindCleanedOutAddressesEvent = {
  type: 'xstate.done.actor.cleanedOutAddress';
  output: { cleanedOutAddresses: string[]; id: number };
};

type FindCleanedOutAddressesErrorEvent = {
  type: 'xstate.error.actor.cleanedOutAddress';
  error: ClientError;
};

type SetInitials = {
  type: 'SET_INITIALS';
  labware: LabwareFlaggedFieldsFragment[];
  cleanedOutAddresses: Map<number, string[]>;
};

export type LabwareEvents =
  | UpdateCurrentBarcodeEvent
  | SubmitBarcodeEvent
  | RemoveLabwareEvent
  | LockEvent
  | UnlockEvent
  | ValidationErrorEvent
  | FindLabwareDoneEvent
  | FindFlaggedLabwareDoneEvent
  | FindLabwareErrorEvent
  | FindLocationDoneEvent
  | FindLocationErrorEvent
  | AddFoundLabwareEvent
  | FoundLabwareCheckErrorEvent
  | FindCleanedOutAddressesEvent
  | FindCleanedOutAddressesErrorEvent
  | SetInitials;

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
export const createLabwareMachine = () => {
  return createMachine(
    {
      types: {} as {
        events: LabwareEvents;
        context: LabwareContext;
      },
      context: ({ input }: { input: LabwareContext }): LabwareContext => ({
        ...input
      }),
      id: 'labwareScanner',
      initial: 'checking_full',
      states: {
        checking_full: {
          always: [
            {
              guard: ({ context }) => context.labwares.length === context.limit,
              target: 'full'
            },
            { target: 'idle' }
          ]
        },

        full: {
          on: {
            REMOVE_LABWARE: {
              target: '#labwareScanner.idle.success',
              actions: ['removeLabware']
            }
          }
        },

        idle: {
          initial: 'normal',
          states: {
            normal: {},
            error: {},
            success: {}
          },
          on: {
            SET_INITIALS: {
              guard: ({ context }) => !context.areInitialsSet,
              actions: 'assignInitials',
              target: 'checking_full'
            },
            UPDATE_CURRENT_BARCODE: {
              target: '#labwareScanner.idle.normal',
              actions: 'assignCurrentBarcode'
            },
            SUBMIT_BARCODE: [
              // If `barcodeNotPresent` returns true, transition to `validating`
              {
                target: 'validating',
                guard: 'barcodeNotPresent'
              },
              // If `barcodeNotPresent` returned false, machine transitions here
              {
                target: '#labwareScanner.idle.error',
                actions: 'assignErrorMessage'
              }
            ],
            REMOVE_LABWARE: {
              target: '#labwareScanner.idle.success',
              actions: ['removeLabware']
            },
            LOCK: 'locked'
          }
        },
        locked: {
          on: { UNLOCK: 'checking_full' }
        },
        validating: {
          invoke: {
            id: 'validateBarcode',
            src: fromPromise(({ input }) => {
              return input.validator.validate(input.currentBarcode);
            }),
            input: ({ context }) => ({
              validator: context.validator,
              currentBarcode: context.currentBarcode
            }),
            onDone: [
              //If it is location barcode then transition to 'searchingLocation' otherwise to 'searching'
              {
                target: 'searching',
                guard: ({ context }) => context.locationScan === false
              },
              {
                target: 'searchingLocation'
              }
            ],

            onError: {
              target: '#labwareScanner.idle.error',
              actions: 'assignValidationError'
            }
          }
        },
        searching: {
          invoke: {
            id: 'findLabware',
            src: fromPromise(({ input }) => {
              if (input.enableFlaggedLabwareCheck)
                return stanCore.FindFlaggedLabware({ barcode: input.currentBarcode });
              return stanCore.FindLabware({ barcode: input.currentBarcode });
            }),
            input: ({ context: { enableFlaggedLabwareCheck, currentBarcode } }) => ({
              enableFlaggedLabwareCheck,
              currentBarcode
            }),
            onDone: {
              target: 'validatingFoundLabware',
              actions: ['assignFoundLabware']
            },
            onError: {
              target: '#labwareScanner.idle.error',
              actions: 'assignFindError'
            }
          }
        },
        searchingLocation: {
          invoke: {
            id: 'findLocation',
            src: fromPromise(({ input }) => {
              return stanCore.GetLabwareInLocation({
                locationBarcode: input.currentBarcode
              });
            }),
            input: ({ context: { currentBarcode } }) => ({
              currentBarcode
            }),
            onDone: {
              target: '#labwareScanner.idle.normal',
              actions: ['assignFoundLocationLabwareIfValid']
            },
            onError: {
              target: '#labwareScanner.idle.error',
              actions: 'assignFindError'
            }
          }
        },
        validatingFoundLabware: {
          invoke: {
            id: 'validateFoundLabware',
            src: fromPromise(({ input }) => {
              return new Promise(async (resolve, reject) => {
                const problems = resolveStringArrayPromise(
                  input.foundLabware
                    ? input.foundLabwareCheck
                      ? await input.foundLabwareCheck(input.labwares, input.foundLabware)
                      : []
                    : ['Labware not loaded.']
                );
                if (problems.length === 0) {
                  resolve(input.foundLabware);
                } else {
                  reject(problems);
                }
              });
            }),
            input: ({ context }) => ({
              labwares: context.labwares,
              foundLabware: context.foundLabware,
              foundLabwareCheck: context.foundLabwareCheck
            }),
            onDone: {
              target: 'gettingCleanedOutAddress',
              actions: ['addFoundLabware']
            },
            onError: {
              target: '#labwareScanner.idle.error',
              actions: ['foundLabwareCheckError']
            }
          }
        },
        gettingCleanedOutAddress: {
          invoke: {
            id: 'cleanedOutAddress',
            src: fromPromise(({ input }) => {
              if (!input.runCheck)
                return new Promise((resolve) =>
                  resolve({
                    cleanedOutAddresses: [],
                    id: input.labwareId
                  })
                );
              return new Promise((resolve, reject) => {
                stanCore
                  .GetCleanedOutAddresses({
                    barcode: input.barcode
                  })
                  .then((response) => {
                    resolve({ ...response, id: input.labwareId });
                  })
                  .catch(reject);
              });
            }),
            input: ({ context }) => ({
              barcode: context.labwares[context.labwares.length - 1].barcode,
              labwareId: context.labwares[context.labwares.length - 1].id,
              runCheck: context.checkForCleanedOutAddresses
            }),
            onDone: {
              target: '#labwareScanner.checking_full',
              actions: ['assignCleanedOutAddresses']
            },
            onError: {
              target: '#labwareScanner.idle.error',
              actions: ['assignCleanedOutLabwareError']
            }
          }
        }
      }
    },
    {
      actions: {
        assignCurrentBarcode: assign(({ context, event }) => {
          if (event.type !== 'UPDATE_CURRENT_BARCODE') {
            return context;
          }
          context.currentBarcode = event.value.replace(/\s+/g, '');
          context.errorMessage = '';
          context.locationScan = event.locationScan;
          return context;
        }),

        assignErrorMessage: assign(({ context, event }) => {
          if (event.type !== 'SUBMIT_BARCODE') {
            return context;
          }
          context.errorMessage = alreadyScannedBarcodeError(context.currentBarcode);
          return context;
        }),

        removeLabware: assign(({ context, event }) => {
          if (event.type !== 'REMOVE_LABWARE') return context;

          const labwareToRemove = context.labwares.find((lw) => lw.barcode === event.value);
          if (!labwareToRemove) return context;

          context.removedLabware = {
            labware: labwareToRemove,
            index: findIndex(context.labwares, (lw) => lw.barcode === event.value)
          };
          return produce(context, (draft) => {
            if (draft.checkForCleanedOutAddresses) draft.cleanedOutAddresses.delete(labwareToRemove.id);
            draft.labwares = draft.labwares.filter((lw) => lw.barcode !== event.value);
            draft.successMessage = `"${event.value}" removed`;
          });
        }),
        assignValidationError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.validateBarcode') {
            return context;
          }
          return { context, errorMessage: event.error.errors.join('\n') };
        }),
        assignFoundLabware: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.findLabware') {
            return context;
          }
          context.foundLabware = context.enableFlaggedLabwareCheck
            ? (event as FindFlaggedLabwareDoneEvent).output.labwareFlagged
            : convertLabwareToFlaggedLabware([(event as FindLabwareDoneEvent).output.labware])[0];
          context.currentBarcode = '';
          return context;
        }),
        assignCleanedOutAddresses: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.cleanedOutAddress') {
            return context;
          }
          return produce(context, (draft) => {
            draft.cleanedOutAddresses.set(event.output.id, event.output.cleanedOutAddresses);
          });
        }),
        assignCleanedOutLabwareError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.cleanedOutAddress') {
            return context;
          }
          return { ...context, errorMessage: event.error.message };
        }),

        addFoundLabware: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.validateFoundLabware') {
            return context;
          }

          context.labwares = [...context.labwares, event.output];
          context.foundLabware = null;
          return context;
        }),

        assignFoundLocationLabwareIfValid: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.findLocation') {
            return context;
          }
          const problems: string[] = [];

          event.output.labwareInLocation.filter(
            (labware) => context.labwares.findIndex((ctxLabware) => ctxLabware.barcode === labware.barcode) === -1
          );

          //Validate all labwares in the location
          event.output.labwareInLocation.forEach((labware) => {
            //check whether this labware is already scanned, if not add to labware list, otherwise update error message
            let problem: string[] = [];
            if (context.labwares.find((ctxLabware) => ctxLabware.barcode === labware.barcode)) {
              problem.push(alreadyScannedBarcodeError(labware.barcode));
            } else {
              /*Validate all the labwares in the location using the validation function passed.
                 If validation is success, add that labware to the list of labwares, otherwise add the error message
                 for failure*/
              problem = resolveStringArrayPromise(
                context.foundLabwareCheck
                  ? context.foundLabwareCheck(
                      convertLabwareToFlaggedLabware(event.output.labwareInLocation),
                      convertLabwareToFlaggedLabware([labware])[0]
                    )
                  : []
              );
            }
            if (problem.length !== 0) {
              problems.push(problem.join('\n'));
            } else {
              context.labwares = [...context.labwares, convertLabwareToFlaggedLabware([labware])[0]];
            }
          });
          if (problems.length > 0) {
            context.errorMessage = problems.join('\n');
          }
          context.currentBarcode = '';
          return context;
        }),

        foundLabwareCheckError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.validateFoundLabware') {
            return context;
          }
          context.errorMessage = (event.error as Record<string, any>)?.join('\n');
          return context;
        }),

        assignFindError: assign(({ context, event }) => {
          if (event.type !== 'xstate.error.actor.findLabware' && event.type !== 'xstate.error.actor.findLocation') {
            return context;
          }
          context.errorMessage = handleFindError(event.error);
          return context;
        }),
        assignInitials: assign(({ context, event }) => {
          if (event.type !== 'SET_INITIALS') {
            return context;
          }
          return {
            ...context,
            labwares: event.labware,
            cleanedOutAddresses: event.cleanedOutAddresses,
            areInitialsSet: true
          };
        })
      },
      guards: {
        barcodeNotPresent: ({ context }) => {
          return !context.labwares.map((lw) => lw.barcode).includes(context.currentBarcode);
        }
      }
    }
  );
};

const alreadyScannedBarcodeError = (barcode: string) => {
  return `"${barcode}" has already been scanned`;
};

const handleFindError = (error: ClientError) => {
  let errors = extractServerErrors(error);
  return errors?.message;
};
