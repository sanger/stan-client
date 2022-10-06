import { createMachine } from 'xstate';
import { assign } from '@xstate/immer';
import { castDraft } from 'immer';
import { MachineServiceDone, MachineServiceError, NewLabwareLayout, OperationTypeName } from '../../../types/stan';
import {
  FindPermDataQuery,
  LabwareFieldsFragment,
  LabwareState,
  Maybe,
  SlideCosting,
  SlotCopyContent,
  SlotCopyDestination,
  SlotCopyMutation,
  SlotCopySource
} from '../../../types/sdk';
import { stanCore } from '../../sdk';
import { ClientError } from 'graphql-request';
import { Optional } from '../../helpers';

/**
 * Context for SlotCopy Machine
 */

type DestinationData = {
  labware: NewLabwareLayout;
  slotCopyDetails: SlotCopyDestination;
};

/**
 * Making 'labwareState' field optional thereby allowing to keep a list of source labware without state
 */
type SlotCopySourceOptional = Optional<SlotCopySource, 'labwareState'>;

export interface SlotCopyContext {
  /**
   * The work number associated with this operation
   */
  workNumber: string;
  operationType: OperationTypeName;
  sourceLabwarePermData?: FindPermDataQuery[];
  destinations: Array<DestinationData>;
  sources: Array<SlotCopySourceOptional>;
  selectedSrcBarcode: string | undefined;
  selectedDestIndex: number;
  slotCopyResults: Array<LabwareFieldsFragment>;
  serverErrors?: Maybe<ClientError>;
}

type UpdateSlotCopyContentType = {
  type: 'UPDATE_SLOT_COPY_CONTENT';
  slotCopyContent: Array<SlotCopyContent>;
  anySourceMapped: boolean;
};

type UpdateSourceLabwarePermTime = {
  type: 'UPDATE_SOURCE_LABWARE_PERMTIME';
  labwares: Array<LabwareFieldsFragment>;
};

type UpdateDestinationPreBarcode = {
  type: 'UPDATE_DESTINATION_PRE_BARCODE';
  preBarcode: string;
};

type UpdateDestinationLabwareType = {
  type: 'UPDATE_DESTINATION_LABWARE_TYPE';
  labware: NewLabwareLayout;
};
type UpdateDestinationCosting = {
  type: 'UPDATE_DESTINATION_COSTING';
  labwareCosting: SlideCosting | undefined;
};
type UpdateDestinationBioState = {
  type: 'UPDATE_DESTINATION_BIO_STATE';
  bioState: string;
};

type UpdateSourceLabwareState = {
  type: 'UPDATE_SOURCE_LABWARE_STATE';
  barcode: string;
  labwareState: LabwareState;
};

type AddSourceLabware = {
  type: 'ADD_SOURCE_LABWARE';
  labware: LabwareFieldsFragment;
};

type RemoveSourceLabware = {
  type: 'REMOVE_SOURCE_LABWARE';
  barcode: string;
};
type AddDestinationLabware = {
  type: 'ADD_DESTINATION_LABWARE';
  labware: NewLabwareLayout;
};
type RemoveDestinationLabware = {
  type: 'REMOVE_DESTINATION_LABWARE';
  index: number;
};

type FindPermDataEvent = {
  type: 'done.invoke.findPermTime';
  data: {
    findPermTimes: FindPermDataQuery[];
    inputLabwares: LabwareFieldsFragment[];
  };
};

type SaveEvent = { type: 'SAVE' };

export type SlotCopyEvent =
  | { type: 'UPDATE_WORK_NUMBER'; workNumber: string }
  | AddSourceLabware
  | AddDestinationLabware
  | RemoveSourceLabware
  | RemoveDestinationLabware
  | UpdateSlotCopyContentType
  | UpdateSourceLabwarePermTime
  | UpdateSourceLabwareState
  | UpdateDestinationLabwareType
  | UpdateDestinationPreBarcode
  | UpdateDestinationCosting
  | UpdateDestinationBioState
  | SaveEvent
  | FindPermDataEvent
  | MachineServiceDone<'copySlots', SlotCopyMutation>
  | MachineServiceError<'copySlots'>;

/**
 * SlotCopy Machine Config
 */
export const slotCopyMachine = createMachine<SlotCopyContext, SlotCopyEvent>(
  {
    id: 'slotCopy',
    initial: 'mapping',
    states: {
      mapping: {
        on: {
          ADD_SOURCE_LABWARE: {
            actions: 'addSourceLabware'
          },
          ADD_DESTINATION_LABWARE: {
            actions: 'addDestinationLabware'
          },
          REMOVE_SOURCE_LABWARE: {
            actions: 'removeSourceLabware'
          },
          REMOVE_DESTINATION_LABWARE: {
            actions: 'removeDestinationLabware'
          },
          UPDATE_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: 'readyToCopy',
              cond: (ctx, e) => e.anySourceMapped,
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
          }
        }
      },
      readyToCopy: {
        on: {
          ADD_SOURCE_LABWARE: {
            actions: 'addSourceLabware'
          },
          ADD_DESTINATION_LABWARE: {
            actions: 'addDestinationLabware'
          },
          REMOVE_SOURCE_LABWARE: {
            actions: 'removeSourceLabware'
          },
          REMOVE_DESTINATION_LABWARE: {
            actions: 'removeDestinationLabware'
          },
          UPDATE_WORK_NUMBER: {
            actions: 'assignWorkNumber'
          },
          UPDATE_SLOT_COPY_CONTENT: [
            {
              target: 'mapping',
              cond: (ctx, e) => !e.anySourceMapped,
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
          SAVE: 'copying'
        }
      },
      copying: {
        entry: ['emptyServerError'],
        invoke: {
          src: 'copySlots',
          id: 'copySlots',
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
          src: 'findPermTime',
          id: 'findPermTime',
          onDone: [
            {
              target: 'readyToCopy',
              cond: (context, e) => {
                if (!selectedDestination(context)) {
                  return false;
                }
                return (
                  e.data.inputLabwares.length > 0 &&
                  context.destinations[context.selectedDestIndex].slotCopyDetails.contents.length > 0
                );
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
      addSourceLabware: assign((ctx, e) => {
        if (e.type !== 'ADD_SOURCE_LABWARE') {
          return;
        }
        ctx.sources.push({
          barcode: e.labware.barcode
        });
      }),
      removeSourceLabware: assign((ctx, e) => {
        if (e.type !== 'REMOVE_SOURCE_LABWARE') {
          return;
        }
        const indx = ctx.sources.findIndex((src) => src.barcode === e.barcode);
        ctx.sources.splice(indx, 1);
      }),
      addDestinationLabware: assign((ctx, e) => {
        if (e.type !== 'ADD_DESTINATION_LABWARE') {
          return;
        }
        ctx.destinations.push({
          labware: e.labware,
          slotCopyDetails: { labwareType: e.labware.labwareType.name, contents: [] }
        });
      }),
      removeDestinationLabware: assign((ctx, e) => {
        if (e.type !== 'REMOVE_DESTINATION_LABWARE') {
          return;
        }
        ctx.destinations.splice(e.index, 1);
      }),

      assignSCC: assign((ctx, e) => {
        if (e.type !== 'UPDATE_SLOT_COPY_CONTENT') {
          return;
        }
        const destination = selectedDestination(ctx);
        if (!destination) {
          return;
        }
        destination.slotCopyDetails.contents = e.slotCopyContent;
      }),

      assignResult: assign((ctx, e) => {
        if (e.type !== 'done.invoke.copySlots') {
          return;
        }
        ctx.slotCopyResults = e.data.slotCopy.labware;
      }),

      assignServerError: assign((ctx, e) => {
        if (e.type !== 'error.platform.copySlots') {
          return;
        }
        ctx.serverErrors = castDraft(e.data);
      }),

      assignWorkNumber: assign((ctx, e) => {
        if (e.type !== 'UPDATE_WORK_NUMBER') return;
        ctx.workNumber = e.workNumber;
      }),
      assignSourceLabwarePermTimes: assign((ctx, e) => {
        if (e.type !== 'done.invoke.findPermTime') return;
        //Sync the permData array with current input labware list
        ctx.sourceLabwarePermData = ctx.sourceLabwarePermData?.filter((permData) =>
          e.data.inputLabwares.some((lw) => lw.barcode === permData.visiumPermData.labware.barcode)
        );
        //Add newly fetched perm times if any
        e.data.findPermTimes.forEach((permData) => {
          ctx.sourceLabwarePermData?.push(permData);
        });

        //update slot copy content with updated labware
        ctx.destinations.forEach((dest) => {
          dest.slotCopyDetails.contents = dest.slotCopyDetails.contents.filter((scc) =>
            e.data.inputLabwares.some((lw) => lw.barcode === scc.sourceBarcode)
          );
        });
      }),
      assignDestinationBioState: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_BIO_STATE') return;
        const destination = selectedDestination(ctx);
        if (!destination) {
          return;
        }
        destination.slotCopyDetails.bioState = e.bioState;
      }),
      assignDestinationPreBarcode: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_PRE_BARCODE') return;
        const destination = selectedDestination(ctx);
        if (!destination) {
          return;
        }
        destination.slotCopyDetails.preBarcode = e.preBarcode;
      }),
      assignDestinationLabwareType: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_LABWARE_TYPE') return;
        const destination = selectedDestination(ctx);
        if (!destination || destination.labware.labwareType.name === e.labware.labwareType.name) {
          return;
        }
        destination.labware = e.labware;
        destination.slotCopyDetails = {
          ...destination.slotCopyDetails,
          labwareType: e.labware.labwareType.name,
          contents: []
        };
      }),
      assignDestinationCosting: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_COSTING') return;
        const destination = selectedDestination(ctx);
        if (!destination) {
          return;
        }
        destination.slotCopyDetails.costing = e.labwareCosting;
      }),
      assignSourceLabwareState: assign((ctx, e) => {
        if (e.type !== 'UPDATE_SOURCE_LABWARE_STATE') return;
        const src = ctx.sources.find((src) => src.barcode === e.barcode);
        if (src) {
          src.labwareState = e.labwareState;
        } else {
          ctx.sources.push({ barcode: e.barcode, labwareState: e.labwareState });
        }
      }),
      emptyServerError: assign((ctx) => {
        ctx.serverErrors = null;
      })
    },
    services: {
      copySlots: (ctx) => {
        return stanCore.SlotCopy({
          request: {
            workNumber: ctx.workNumber,
            operationType: ctx.operationType,
            destinations: ctx.destinations.map((dest) => dest.slotCopyDetails),
            sources: ctx.sources.reduce((arr: SlotCopySource[], curr) => {
              if (curr.labwareState) {
                arr.push({ ...curr, labwareState: curr.labwareState! });
              }
              return arr;
            }, [])
          }
        });
      },
      findPermTime: async (ctx, e) => {
        const findPermDataQueries: FindPermDataQuery[] = [];
        if (e.type !== 'UPDATE_SOURCE_LABWARE_PERMTIME') return Promise.reject();
        for (const inputlw of e.labwares) {
          if (
            !ctx.sourceLabwarePermData?.some((permData) => permData.visiumPermData.labware.barcode === inputlw.barcode)
          ) {
            const val = await stanCore.FindPermData({
              barcode: inputlw.barcode
            });
            findPermDataQueries.push(val);
          }
        }
        return new Promise<{
          findPermTimes: FindPermDataQuery[];
          inputLabwares: LabwareFieldsFragment[];
        }>((resolve) => {
          return resolve({
            findPermTimes: findPermDataQueries,
            inputLabwares: e.labwares
          });
        });
      }
    }
  }
);

const selectedDestination = (ctx: SlotCopyContext): DestinationData | undefined => {
  if (ctx.selectedDestIndex >= ctx.destinations.length || ctx.destinations.length === 0) return undefined;
  return ctx.destinations[ctx.selectedDestIndex];
};

export default slotCopyMachine;
