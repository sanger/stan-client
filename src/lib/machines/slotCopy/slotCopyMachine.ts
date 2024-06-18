import { assign, createMachine, fromPromise } from 'xstate';
import { NewFlaggedLabwareLayout, OperationTypeName } from '../../../types/stan';
import {
  FindPermDataQuery,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareState,
  Maybe,
  SlideCosting,
  SlotCopyContent,
  SlotCopyDestination,
  SlotCopyMutation,
  SlotCopySource
} from '../../../types/sdk';
import { stanCore } from '../../sdk';
import { castDraft, produce } from '../../../dependencies/immer';
import { ClientError } from 'graphql-request';
import { DestinationSelectionMode } from '../../../components/slotMapper/slotMapper.types';
import { Draft } from 'immer';

/**
 * Context for SlotCopy Machine
 */

export type Destination = {
  labware: NewFlaggedLabwareLayout;
  slotCopyDetails: SlotCopyDestination;
  cleanedOutAddresses?: string[];
};

/**
 * Making 'labwareState' field optional thereby allowing to keep a list of source labware without state
 */
export type Source = {
  labware: LabwareFlaggedFieldsFragment;
  labwareState?: LabwareState;
  cleanedOutAddresses?: string[];
};

export interface SlotCopyContext {
  /**
   * The work number associated with this operation
   */
  workNumber: string;
  /**
   * Operation type
   */
  operationType: OperationTypeName;
  /**
   * Perm data for source labware, if any
   */
  sourceLabwarePermData?: FindPermDataQuery[];
  /**
   * All source labware in slot copy operation
   * 'barcode' is the identifier field
   */
  sources: Array<Source>;
  /**
   * All destination labware in slot copy operation
   * 'id' is the identifier field as the destination is not yet created
   */
  destinations: Array<Destination>;
  /**
   * Results returned from server on slotCopy mutation
   */
  slotCopyResults: Array<LabwareFieldsFragment>;
  /**
   * Errors from server, if any
   */
  serverErrors?: Maybe<ClientError>;

  destinationSelectionMode?: DestinationSelectionMode;
}

type UpdateSlotCopyContentType = {
  type: 'UPDATE_SLOT_COPY_CONTENT';
  labware: NewFlaggedLabwareLayout;
  slotCopyContent: Array<SlotCopyContent>;
  anySourceMapped: boolean;
};

type UpdateSourceLabwarePermTime = {
  type: 'UPDATE_SOURCE_LABWARE_PERMTIME';
  labwares: Array<LabwareFlaggedFieldsFragment>;
  destination: Destination | undefined;
};

type UpdateDestinationPreBarcode = {
  type: 'UPDATE_DESTINATION_PRE_BARCODE';
  preBarcode: string;
  labware: NewFlaggedLabwareLayout;
};

type UpdateDestinationLabwareType = {
  type: 'UPDATE_DESTINATION_LABWARE_TYPE';
  /**Old labware**/
  labwareToReplace: NewFlaggedLabwareLayout;
  /**New labware**/
  labware: NewFlaggedLabwareLayout;
};
type UpdateDestinationCosting = {
  type: 'UPDATE_DESTINATION_COSTING';
  labware: NewFlaggedLabwareLayout;
  labwareCosting: SlideCosting | undefined;
};
type UpdateDestinationBioState = {
  type: 'UPDATE_DESTINATION_BIO_STATE';
  labware: NewFlaggedLabwareLayout;
  bioState: string;
};

type UpdateDestinationLOTNumber = {
  type: 'UPDATE_DESTINATION_LOT_NUMBER';
  labware: NewFlaggedLabwareLayout;
  lotNumber: string;
  isProbe: boolean;
};

type UpdateSourceLabwareState = {
  type: 'UPDATE_SOURCE_LABWARE_STATE';
  labware: LabwareFlaggedFieldsFragment;
  labwareState: LabwareState;
};

type UpdateSourceLabware = {
  type: 'UPDATE_SOURCE_LABWARE';
  labware: LabwareFlaggedFieldsFragment[];
  cleanedOutAddresses?: Map<number, string[]>;
};

type UpdateDestinationLabware = {
  type: 'UPDATE_DESTINATION_LABWARE';
  labware: NewFlaggedLabwareLayout[];
  cleanedOutAddresses?: Map<number, string[]>;
};

type FindPermDataEvent = {
  type: 'xstate.done.actor.findPermTime';
  output: {
    findPermTimes: FindPermDataQuery[];
    inputLabwares: LabwareFieldsFragment[];
    destination: Destination | undefined;
  };
};

type SaveEvent = { type: 'SAVE' };

type SlotCopyDoneEvent = {
  type: 'xstate.done.actor.copySlots';
  output: SlotCopyMutation;
};
type SlotCopyErrorEvent = {
  type: 'xstate.error.actor.copySlots';
  error: Maybe<ClientError>;
};

type UpdateDestinationSelectionModeEvent = {
  type: 'UPDATE_DESTINATION_SELECTION_MODE';
  mode: DestinationSelectionMode;
};

export type SlotCopyEvent =
  | { type: 'UPDATE_WORK_NUMBER'; workNumber: string }
  | UpdateSourceLabware
  | UpdateDestinationLabware
  | UpdateSlotCopyContentType
  | UpdateSourceLabwarePermTime
  | UpdateSourceLabwareState
  | UpdateDestinationLabwareType
  | UpdateDestinationPreBarcode
  | UpdateDestinationCosting
  | UpdateDestinationBioState
  | UpdateDestinationLOTNumber
  | UpdateDestinationSelectionModeEvent
  | SaveEvent
  | FindPermDataEvent
  | SlotCopyDoneEvent
  | SlotCopyErrorEvent;

/**
 * SlotCopy Machine Config
 */

export const slotCopyMachine = createMachine(
  {
    id: 'slotCopy',
    types: {} as {
      context: SlotCopyContext;
      events: SlotCopyEvent;
    },
    context: ({ input }: { input: SlotCopyContext }): SlotCopyContext => ({
      ...input
    }),
    initial: 'mapping',
    states: {
      mapping: {
        entry: ['emptyServerError'],
        on: {
          UPDATE_SOURCE_LABWARE: {
            actions: 'assignSourceLabware'
          },
          UPDATE_DESTINATION_LABWARE: {
            actions: 'assignDestinationLabware'
          },
          UPDATE_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: 'readyToCopy',
              guard: ({ event }) => event.anySourceMapped,
              actions: ['assignSCC']
            },
            {
              actions: ['assignSCC']
            }
          ],
          UPDATE_SOURCE_LABWARE_PERMTIME: {
            target: 'updateSourceLabwarePermTime'
          },
          UPDATE_SOURCE_LABWARE_STATE: {
            actions: 'assignSourceLabwareState'
          },
          UPDATE_DESTINATION_PRE_BARCODE: {
            actions: 'assignDestinationPreBarcode'
          },
          UPDATE_DESTINATION_LABWARE_TYPE: {
            actions: 'assignDestinationLabwareType'
          },
          UPDATE_DESTINATION_COSTING: {
            actions: 'assignDestinationCosting'
          },
          UPDATE_DESTINATION_BIO_STATE: {
            actions: 'assignDestinationBioState'
          },
          UPDATE_DESTINATION_LOT_NUMBER: {
            actions: 'assignDestinationLOTNumber'
          },
          UPDATE_DESTINATION_SELECTION_MODE: {
            actions: 'assignDestinationSelectionMode'
          }
        }
      },
      readyToCopy: {
        on: {
          UPDATE_SOURCE_LABWARE: {
            actions: 'assignSourceLabware'
          },
          UPDATE_DESTINATION_LABWARE: {
            actions: 'assignDestinationLabware'
          },
          UPDATE_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: 'mapping',
              guard: ({ event }) => !event.anySourceMapped,
              actions: ['assignSCC']
            },
            {
              actions: ['assignSCC']
            }
          ],
          UPDATE_SOURCE_LABWARE_PERMTIME: {
            target: 'updateSourceLabwarePermTime'
          },
          UPDATE_SOURCE_LABWARE_STATE: {
            actions: 'assignSourceLabwareState'
          },
          UPDATE_DESTINATION_PRE_BARCODE: {
            actions: 'assignDestinationPreBarcode'
          },
          UPDATE_DESTINATION_LABWARE_TYPE: {
            actions: 'assignDestinationLabwareType'
          },
          UPDATE_DESTINATION_COSTING: {
            actions: 'assignDestinationCosting'
          },
          UPDATE_DESTINATION_BIO_STATE: {
            actions: 'assignDestinationBioState'
          },
          UPDATE_DESTINATION_LOT_NUMBER: {
            actions: 'assignDestinationLOTNumber'
          },
          UPDATE_DESTINATION_SELECTION_MODE: {
            actions: 'assignDestinationSelectionMode'
          },
          SAVE: 'copying'
        }
      },
      copying: {
        entry: ['emptyServerError'],
        invoke: {
          id: 'copySlots',
          src: fromPromise(({ input }) =>
            stanCore.SlotCopy({
              request: {
                workNumber: input.workNumber,
                operationType: input.operationType,
                destinations: input.destinations.map((dest: Destination) => dest.slotCopyDetails),
                sources: input.sources.reduce((arr: SlotCopySource[], curr: Source) => {
                  if (curr.labwareState) {
                    arr.push({ barcode: curr.labware.barcode, labwareState: curr.labwareState });
                  }
                  return arr;
                }, [])
              }
            })
          ),
          input: ({ context }) => ({
            workNumber: context.workNumber,
            operationType: context.operationType,
            destinations: context.destinations,
            sources: context.sources
          }),
          onDone: {
            target: 'copied',
            actions: ['assignResult']
          },
          onError: {
            target: 'readyToCopy',
            actions: ['assignServerError']
          }
        }
      },
      updateSourceLabwarePermTime: {
        invoke: {
          id: 'findPermTime',
          src: fromPromise(async ({ input }) => {
            const findPermDataQueries: FindPermDataQuery[] = [];
            for (const inputlw of input.labwares) {
              if (
                !input.sourceLabwarePermData?.some(
                  (permData: FindPermDataQuery) => permData.visiumPermData.labware.barcode === inputlw.barcode
                )
              ) {
                const val = await stanCore.FindPermData({ barcode: inputlw.barcode });
                findPermDataQueries.push(val);
              }
            }
            return {
              findPermTimes: findPermDataQueries,
              inputLabwares: input.labwares,
              destination: input.destination
            };
          }),
          input: ({ context, event }) => ({
            labwares: (event as UpdateSourceLabwarePermTime).labwares,
            destination: (event as UpdateSourceLabwarePermTime).destination,
            sourceLabwarePermData: context.sourceLabwarePermData
          }),
          onDone: [
            {
              target: 'readyToCopy',
              guard: ({ event }) => {
                if (event.output.inputLabwares.length > 0) {
                  return (
                    event.output.destination !== undefined &&
                    event.output.destination.slotCopyDetails.contents.length > 0
                  );
                } else {
                  return false;
                }
              },
              actions: 'assignSourceLabwarePermTimes'
            },
            {
              target: 'mapping',
              actions: 'assignSourceLabwarePermTimes'
            }
          ]
        }
      },
      copied: {
        type: 'final'
      }
    }
  },
  {
    actions: {
      assignSourceLabware: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_SOURCE_LABWARE') {
          return context;
        }
        return produce(context, (draft) => {
          draft.sources = event.labware.map((newSource) => {
            const source = draft.sources.find((src) => src.labware.barcode === newSource.barcode);
            //There is no source exists , so add this
            if (!source) {
              return {
                labware: newSource,
                cleanedOutAddresses: event.cleanedOutAddresses?.get(newSource.id) ?? []
              };
            } else {
              return source;
            }
          });
        });
      }),
      assignDestinationLabware: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_LABWARE') {
          return context;
        }
        return produce(context, (draft) => {
          draft.destinations = event.labware.map((newDest) => {
            const destination = draft.destinations.find((dest) => dest.labware.id === newDest.id);
            //There is no destination exists , so add this
            if (!destination) {
              return {
                labware: newDest,
                slotCopyDetails: { labwareType: newDest.labwareType.name, barcode: newDest.barcode, contents: [] },
                cleanedOutAddresses: event.cleanedOutAddresses?.get(newDest.id) ?? []
              };
            } else {
              return destination;
            }
          });
        });
      }),

      assignSCC: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_SLOT_COPY_CONTENT') {
          return context;
        }
        return produce(context, (draft) => {
          const destination = draft.destinations.find((dest) => dest.labware.id === event.labware.id);
          if (destination) {
            destination.slotCopyDetails.contents = event.slotCopyContent;
          }
        });
      }),

      assignResult: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.copySlots') {
          return context;
        }
        return { ...context, slotCopyResults: event.output.slotCopy.labware };
      }),

      assignServerError: assign(({ context, event }) => {
        if (event.type !== 'xstate.error.actor.copySlots') {
          return context;
        }
        return { ...context, serverErrors: castDraft(event.error) };
      }),

      assignWorkNumber: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_WORK_NUMBER') return context;
        return { ...context, workNumber: event.workNumber };
      }),
      assignSourceLabwarePermTimes: assign(({ context, event }) => {
        if (event.type !== 'xstate.done.actor.findPermTime') return context;
        //Sync the permData array with current input labware list
        return produce(context, (draft) => {
          if (!draft.sourceLabwarePermData) {
            draft.sourceLabwarePermData = [];
          }
          draft.sourceLabwarePermData = draft.sourceLabwarePermData?.filter((permData) =>
            event.output.inputLabwares.some((lw) => lw.barcode === permData.visiumPermData.labware.barcode)
          );
          //Add newly fetched perm times if any
          event.output.findPermTimes.forEach((permData) => {
            draft.sourceLabwarePermData?.push(permData);
          });

          //update slot copy content with updated labware
          draft.destinations.forEach((dest) => {
            dest.slotCopyDetails.contents = dest.slotCopyDetails.contents.filter((scc) =>
              event.output.inputLabwares.some((lw) => lw.barcode === scc.sourceBarcode)
            );
          });
        });
      }),
      assignDestinationBioState: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_BIO_STATE') return context;
        return produce(context, (draft) => {
          const destination = draft.destinations.find((dest) => dest.labware.id === event.labware.id);
          if (!destination) {
            return draft;
          }
          destination.slotCopyDetails.bioState = event.bioState;
        });
      }),
      assignDestinationPreBarcode: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_PRE_BARCODE') return context;
        return produce(context, (draft) => {
          const destination = draft.destinations.find((dest) => dest.labware.id === event.labware.id);
          if (!destination) {
            return draft;
          }
          //update barcode in destination labware and in slotCopy details
          destination.labware.barcode = event.preBarcode;
          destination.slotCopyDetails.preBarcode = event.preBarcode;
        });
      }),
      assignDestinationLabwareType: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_LABWARE_TYPE') return context;
        return produce(context, (draft) => {
          const destination = draft.destinations.find((dest) => dest.labware.id === event.labwareToReplace.id);
          if (!destination || destination.labware.labwareType.name === event.labware.labwareType.name) {
            return draft;
          }
          destination.labware = event.labware;
          destination.slotCopyDetails = {
            ...destination.slotCopyDetails,
            labwareType: event.labware.labwareType.name,
            contents: []
          };
        });
      }),
      assignDestinationCosting: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_COSTING') return context;
        return produce(context, (draft) => {
          const destination = draft.destinations.find((dest) => dest.labware.id === event.labware.id);
          if (!destination) {
            return draft;
          }
          destination.slotCopyDetails.costing = event.labwareCosting;
        });
      }),
      assignDestinationLOTNumber: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_LOT_NUMBER') return context;
        return produce(context, (draft): Draft<SlotCopyContext> => {
          const destination = draft.destinations.find((dest) => dest.labware.id === event.labware.id);
          if (!destination) {
            return draft;
          }
          if (event.isProbe) {
            destination.slotCopyDetails.probeLotNumber = event.lotNumber;
          } else {
            destination.slotCopyDetails.lotNumber = event.lotNumber;
          }
          return draft;
        });
      }),
      assignSourceLabwareState: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_SOURCE_LABWARE_STATE') return context;
        return produce(context, (draft) => {
          const src = draft.sources.find((src) => src.labware.barcode === event.labware.barcode);
          if (src) {
            src.labwareState = event.labwareState;
          } else {
            draft.sources.push({ labware: event.labware, labwareState: event.labwareState });
          }
        });
      }),
      emptyServerError: assign(({ context }) => {
        return { ...context, serverErrors: null };
      }),
      assignDestinationSelectionMode: assign(({ context, event }) => {
        if (event.type !== 'UPDATE_DESTINATION_SELECTION_MODE') return context;
        return { ...context, destinationSelectionMode: event.mode };
      })
    }
  }
);

export default slotCopyMachine;
