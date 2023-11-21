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

/**
 * Context for SlotCopy Machine
 */

export type Destination = {
  labware: NewLabwareLayout;
  slotCopyDetails: SlotCopyDestination;
};

/**
 * Making 'labwareState' field optional thereby allowing to keep a list of source labware without state
 */
export type Source = {
  labware: LabwareFieldsFragment;
  labwareState?: LabwareState;
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
}

type UpdateSlotCopyContentType = {
  type: 'UPDATE_SLOT_COPY_CONTENT';
  labware: NewLabwareLayout;
  slotCopyContent: Array<SlotCopyContent>;
  anySourceMapped: boolean;
};

type UpdateSourceLabwarePermTime = {
  type: 'UPDATE_SOURCE_LABWARE_PERMTIME';
  labwares: Array<LabwareFieldsFragment>;
  destinaton: Destination | undefined;
};

type UpdateDestinationPreBarcode = {
  type: 'UPDATE_DESTINATION_PRE_BARCODE';
  preBarcode: string;
  labware: NewLabwareLayout;
};

type UpdateDestinationLabwareType = {
  type: 'UPDATE_DESTINATION_LABWARE_TYPE';
  /**Old labware**/
  labwareToReplace: NewLabwareLayout;
  /**New labware**/
  labware: NewLabwareLayout;
};
type UpdateDestinationCosting = {
  type: 'UPDATE_DESTINATION_COSTING';
  labware: NewLabwareLayout;
  labwareCosting: SlideCosting | undefined;
};
type UpdateDestinationBioState = {
  type: 'UPDATE_DESTINATION_BIO_STATE';
  labware: NewLabwareLayout;
  bioState: string;
};

type UpdateDestinationLOTNumber = {
  type: 'UPDATE_DESTINATION_LOT_NUMBER';
  labware: NewLabwareLayout;
  lotNumber: string;
  isProbe: boolean;
};

type UpdateSourceLabwareState = {
  type: 'UPDATE_SOURCE_LABWARE_STATE';
  labware: LabwareFieldsFragment;
  labwareState: LabwareState;
};

type UpdateSourceLabware = {
  type: 'UPDATE_SOURCE_LABWARE';
  labware: LabwareFieldsFragment[];
};

type UpdateDestinationLabware = {
  type: 'UPDATE_DESTINATION_LABWARE';
  labware: NewLabwareLayout[];
};

type FindPermDataEvent = {
  type: 'done.invoke.findPermTime';
  data: {
    findPermTimes: FindPermDataQuery[];
    inputLabwares: LabwareFieldsFragment[];
    destination: Destination | undefined;
  };
};

type SaveEvent = { type: 'SAVE' };

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
          },
          UPDATE_DESTINATION_LOT_NUMBER: {
            actions: 'assignDestinationLOTNumber'
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
          UPDATE_DESTINATION_LOT_NUMBER: {
            actions: 'assignDestinationLOTNumber'
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
                if (e.data.inputLabwares.length > 0) {
                  return e.data.destination !== undefined && e.data.destination.slotCopyDetails.contents.length > 0;
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
      assignSourceLabware: assign((ctx, e) => {
        if (e.type !== 'UPDATE_SOURCE_LABWARE') {
          return;
        }
        ctx.sources = e.labware.map((newSource) => {
          const source = ctx.sources.find((src) => src.labware.barcode === newSource.barcode);
          //There is no source exists , so add this
          if (!source) {
            return {
              labware: newSource
            };
          } else {
            return source;
          }
        });
      }),
      assignDestinationLabware: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_LABWARE') {
          return;
        }
        ctx.destinations = e.labware.map((newDest) => {
          const destination = ctx.destinations.find((dest) => dest.labware.id === newDest.id);
          //There is no destination exists , so add this
          if (!destination) {
            return {
              labware: newDest,
              slotCopyDetails: { labwareType: newDest.labwareType.name, barcode: newDest.barcode, contents: [] }
            };
          } else {
            return destination;
          }
        });
      }),

      assignSCC: assign((ctx, e) => {
        if (e.type !== 'UPDATE_SLOT_COPY_CONTENT') {
          return;
        }
        const destination = ctx.destinations.find((dest) => dest.labware.id === e.labware.id);
        if (destination) {
          destination.slotCopyDetails.contents = e.slotCopyContent;
        }
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
        const destination = ctx.destinations.find((dest) => dest.labware.id === e.labware.id);
        if (!destination) {
          return;
        }
        destination.slotCopyDetails.bioState = e.bioState;
      }),
      assignDestinationPreBarcode: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_PRE_BARCODE') return;
        const destination = ctx.destinations.find((dest) => dest.labware.id === e.labware.id);
        if (!destination) {
          return;
        }
        //update barcode in destination labware and in slotCopy details
        destination.labware.barcode = e.preBarcode;
        destination.slotCopyDetails.preBarcode = e.preBarcode;
      }),
      assignDestinationLabwareType: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_LABWARE_TYPE') return;
        const destination = ctx.destinations.find((dest) => dest.labware.id === e.labwareToReplace.id);
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
        const destination = ctx.destinations.find((dest) => dest.labware.id === e.labware.id);
        if (!destination) {
          return;
        }
        destination.slotCopyDetails.costing = e.labwareCosting;
      }),
      assignDestinationLOTNumber: assign((ctx, e) => {
        if (e.type !== 'UPDATE_DESTINATION_LOT_NUMBER') return;
        const destination = ctx.destinations.find((dest) => dest.labware.id === e.labware.id);
        if (!destination) {
          return;
        }
        if (e.isProbe) {
          destination.slotCopyDetails.probeLotNumber = e.lotNumber;
        } else {
          destination.slotCopyDetails.lotNumber = e.lotNumber;
        }
      }),
      assignSourceLabwareState: assign((ctx, e) => {
        if (e.type !== 'UPDATE_SOURCE_LABWARE_STATE') return;
        const src = ctx.sources.find((src) => src.labware.barcode === e.labware.barcode);
        if (src) {
          src.labwareState = e.labwareState;
        } else {
          ctx.sources.push({ labware: e.labware, labwareState: e.labwareState });
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
                arr.push({ barcode: curr.labware.barcode, labwareState: curr.labwareState });
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
          destination: Destination | undefined;
        }>((resolve) => {
          return resolve({
            findPermTimes: findPermDataQueries,
            inputLabwares: e.labwares,
            destination: e.destinaton
          });
        });
      }
    }
  }
);

export default slotCopyMachine;
