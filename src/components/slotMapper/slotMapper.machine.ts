import { OutputSlotCopyData, SlotMapperContext, SlotMapperEvent, SlotMapperSchema } from './slotMapper.types';
import {
  GridDirection,
  LabwareFlaggedFieldsFragment,
  PassFail,
  SlotCopyContent,
  SlotPassFail,
  SlotPassFailFieldsFragment
} from '../../types/sdk';
import { buildAddresses, cycleColors } from '../../lib/helpers';
import { sortWithDirection } from '../../lib/helpers/addressHelper';
import { find, indexOf, intersection, map } from 'lodash';
import { stanCore } from '../../lib/sdk';
import { assign, createMachine, fromPromise, MachineImplementations } from 'xstate';
import { produce } from '../../dependencies/immer';

const colors = cycleColors();

const machineImplementations: MachineImplementations<SlotMapperContext, SlotMapperEvent> = {
  actions: {
    assignInputLabware: assign(({ context, event }) => {
      if (event.type === 'UPDATE_INPUT_LABWARE') {
        return produce(context, (draft) => {
          draft.inputLabware = event.labware;
          draft.cleanedOutInputAddresses = event.cleanedOutAddresses;

          // Update the failedSlots array if it has entries for any removed labware
          let keys = Array.from(draft.failedSlots.keys()).filter(
            (key) => draft.inputLabware.findIndex((labware) => labware.barcode === key) === -1
          );
          keys.forEach((key) => draft.failedSlots.delete(key));

          // Update the errors array if it has entries for any removed labware
          keys = Array.from(draft.errors.keys()).filter(
            (key) => draft.inputLabware.findIndex((labware) => labware.barcode === key) === -1
          );
          keys.forEach((key) => draft.errors.delete(key));

          // Update destination slotCopyContent if it has entries for any removed labware
          draft.outputSlotCopies.forEach((outputScc) => {
            outputScc.slotCopyContent = outputScc.slotCopyContent.filter((scc) =>
              draft.inputLabware.some((lw) => lw.barcode === scc.sourceBarcode)
            );
          });
        });
      } else {
        return context;
      }
    }),
    assignOutputLabware: assign(({ context, event }) => {
      if (event.type === 'UPDATE_OUTPUT_LABWARE') {
        return { ...context, outputSlotCopies: event.outputSlotCopyContent };
      }
      return context;
    }),

    assignLabwareColors: assign(({ context }) => {
      return produce(context, (draft) => {
        draft.inputLabware.forEach((lw: LabwareFlaggedFieldsFragment) => {
          if (!draft.colorByBarcode.has(lw.barcode)) {
            draft.colorByBarcode.set(lw.barcode, colors.next().value);
          }
        });
      });
    }),

    checkSlots: assign(({ context }) => {
      const inputLabwareBarcodes = map(context.inputLabware, 'barcode');
      return produce(context, (draft) => {
        draft.outputSlotCopies.forEach((outputScc: OutputSlotCopyData) => {
          outputScc.slotCopyContent = outputScc.slotCopyContent.filter((scc) =>
            inputLabwareBarcodes.includes(scc.sourceBarcode)
          );
        });
      });
    }),

    clearSlots: assign(({ context, event }) => {
      if (event.type !== 'CLEAR_SLOTS') {
        return context;
      }
      return produce(context, (draft) => {
        const outputScc = draft.outputSlotCopies.find(
          (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
        );
        if (outputScc) {
          outputScc.slotCopyContent = outputScc.slotCopyContent.filter(
            (scc: SlotCopyContent) => !event.outputAddresses.includes(scc.destinationAddress)
          );
        }
      });
    }),
    clearSlotMappingsBetween: assign(({ context, event }) => {
      if (event.type !== 'CLEAR_ALL_SLOT_MAPPINGS_BETWEEN') {
        return context;
      }
      return produce(context, (draft) => {
        const outputScc = draft.outputSlotCopies.find(
          (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
        );
        if (outputScc) {
          outputScc.slotCopyContent = outputScc.slotCopyContent.filter(
            (scc: SlotCopyContent) => scc.sourceBarcode !== event.inputLabwareBarcode
          );
        }
      });
    }),
    copyOneToOneSlots: assign(({ context, event }) => {
      if (event.type !== 'COPY_ONE_TO_ONE_SLOTS') {
        return context;
      }

      const inputLabware = find(context.inputLabware, { id: event.inputLabwareId });
      const updatedContext = produce(context, (draft) => {
        const outputScc = draft.outputSlotCopies.find(
          (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
        );

        if (!inputLabware || !outputScc) {
          return draft;
        }

        // Get all the addresses of the output labware
        const outputAddresses = buildAddresses(outputScc.labware.labwareType, GridDirection.DownRight);

        // Get the index of the clicked destination address
        const destinationAddressIndex = indexOf(outputAddresses, event.outputAddress);

        if (destinationAddressIndex === -1) {
          return draft;
        }

        // Sort the input addresses
        const sortedInputAddresses = sortWithDirection(event.inputAddresses, GridDirection.DownRight);

        // Find the addresses on the output labware we wish to map the source addresses onto
        const sourceToDestination = sortedInputAddresses.reduce<{
          [key: string]: string;
        }>((memo, sourceAddress, index) => {
          memo[sourceAddress] = outputAddresses[destinationAddressIndex + index];
          return memo;
        }, {});

        // Don't map if any of the destination addresses are already filled.
        if (
          intersection(map(outputScc.slotCopyContent, 'destinationAddress'), Object.values(sourceToDestination))
            .length > 0
        ) {
          return draft;
        }

        // Don't map if all source addresses can not fit where user has clicked
        if (destinationAddressIndex + event.inputAddresses.length > outputAddresses.length) {
          return draft;
        }

        // Everything looks good, so we can create the list of SlotCopyContent
        const newSlotCopyContent: Array<SlotCopyContent> = Object.entries(sourceToDestination).map(
          ([sourceAddress, destinationAddress]) => ({
            sourceAddress,
            destinationAddress,
            sourceBarcode: inputLabware.barcode
          })
        );

        outputScc.slotCopyContent = outputScc.slotCopyContent
          // Remove sources that have already been copied
          .filter((scc: SlotCopyContent) => {
            return !(scc.sourceBarcode === inputLabware.barcode && event.inputAddresses.includes(scc.sourceAddress));
          })
          // Then add on the newly created slot copy content
          .concat(newSlotCopyContent);
      });
      return updatedContext;
    }),
    copyManyToOneSlots: assign(({ context, event }) => {
      if (event.type !== 'COPY_MANY_TO_ONE_SLOTS') {
        return context;
      }

      const inputLabware = find(context.inputLabware, { id: event.inputLabwareId });
      const updatedContext = produce(context, (draft) => {
        const outputScc = draft.outputSlotCopies.find(
          (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
        );

        if (!inputLabware || !outputScc) {
          return draft;
        }
        // Get all the addresses of the output labware
        const outputAddresses = buildAddresses(outputScc.labware.labwareType, GridDirection.DownRight);

        // Get the index of the clicked destination address
        const destinationAddressIndex = indexOf(outputAddresses, event.outputAddress);

        if (destinationAddressIndex === -1) {
          return draft;
        }
        // Don't map if the destination addresses are already filled.
        if (outputScc.slotCopyContent.find((scc: SlotCopyContent) => scc.destinationAddress === event.outputAddress)) {
          return draft;
        }
        //Create mapping between all selected input addresses and output address
        event.inputAddresses.forEach((inputAddress: string) =>
          outputScc.slotCopyContent.push({
            destinationAddress: event.outputAddress,
            sourceBarcode: inputLabware.barcode,
            sourceAddress: inputAddress
          })
        );
      });
      return updatedContext;
    }),
    copyOneToManySlots: assign(({ context, event }) => {
      if (event.type !== 'COPY_ONE_TO_MANY_SLOTS') {
        return context;
      }
      const inputLabware = find(context.inputLabware, { id: event.inputLabwareId });
      const updatedContext = produce(context, (draft) => {
        const outputScc = draft.outputSlotCopies.find(
          (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
        );

        if (!inputLabware || !outputScc) {
          return draft;
        }

        // Get all the addresses of the output labware
        const outputAddresses = buildAddresses(outputScc.labware.labwareType, GridDirection.DownRight);

        // Get the index of the clicked destination address
        const destinationAddressIndex = indexOf(outputAddresses, event.outputAddress);

        if (destinationAddressIndex === -1) {
          return draft;
        }
        // Don't map if the destination addresses are already filled.
        if (outputScc.slotCopyContent.find((scc: SlotCopyContent) => scc.destinationAddress === event.outputAddress)) {
          return draft;
        }
        //Update Slot content with the mapping
        outputScc.slotCopyContent.push({
          destinationAddress: event.outputAddress,
          sourceBarcode: inputLabware.barcode,
          sourceAddress: event.inputAddress
        });
      });
      return updatedContext;
    }),

    assignFailedSlots: assign(({ context, event }) => {
      if (event.type !== 'xstate.done.actor.passFailsSlots') return context;

      /*If there are multiple slide processing performed on same labware, check the latest matching operation recorded
       which would be the last one in the array.
       */
      const failedSlots = new Map<string, SlotPassFailFieldsFragment[]>(context.failedSlots);
      if (event.output.result.passFails && event.output.result.passFails.length > 0) {
        const slotPassFails: SlotPassFail[] =
          event.output.result.passFails[event.output.result.passFails.length - 1].slotPassFails;
        if (slotPassFails) {
          const failedAddresses = slotPassFails.filter((slotPassFail) => slotPassFail.result === PassFail.Fail);
          if (failedAddresses.length > 0) {
            failedSlots.set(event.output.barcode, failedAddresses);
          }
        }
      }
      return { ...context, failedSlots };
    }),
    assignPassFailError: assign(({ context, event }) => {
      if (event.type === 'xstate.error.actor.passFailsSlots' && event.barcode) {
        return produce(context, (draft) => {
          draft.errors.set(event.barcode, event.error);
        });
      }
      return context;
    })
  }
};

interface SlotMapperMachineParams {
  inputLabware: Array<LabwareFlaggedFieldsFragment>;
  outputSlotCopies: Array<OutputSlotCopyData>;
  failedSlotsCheck?: boolean;
  cleanedOutInputAddresses?: Map<number, string[]>;
}

const createSlotMapperMachine = createMachine(
  {
    id: 'slotMapperMachine',
    types: {} as {
      context: SlotMapperContext;
      schema: SlotMapperSchema;
      events: SlotMapperEvent;
    },
    initial: 'ready',
    context: ({ input }: { input: SlotMapperMachineParams }): SlotMapperContext => {
      return {
        ...input,
        failedSlotsCheck: input.failedSlotsCheck || true,
        colorByBarcode: new Map(),
        failedSlots: new Map(),
        errors: new Map()
      };
    },
    states: {
      ready: {
        entry: 'assignLabwareColors',
        on: {
          COPY_ONE_TO_ONE_SLOTS: {
            actions: 'copyOneToOneSlots'
          },
          COPY_ONE_TO_MANY_SLOTS: {
            actions: 'copyOneToManySlots'
          },
          COPY_MANY_TO_ONE_SLOTS: {
            actions: 'copyManyToOneSlots'
          },
          CLEAR_SLOTS: {
            actions: 'clearSlots'
          },
          CLEAR_ALL_SLOT_MAPPINGS_BETWEEN: {
            actions: 'clearSlotMappingsBetween'
          },
          UPDATE_INPUT_LABWARE: [
            {
              target: 'updatingLabware',
              guard: ({ context }) => context.failedSlotsCheck,
              actions: ['assignInputLabware', 'assignLabwareColors', 'checkSlots']
            },
            { actions: ['assignInputLabware', 'assignLabwareColors', 'checkSlots'] }
          ],
          UPDATE_OUTPUT_LABWARE: {
            actions: 'assignOutputLabware'
          },
          LOCK: 'locked'
        }
      },
      updatingLabware: {
        invoke: {
          id: 'passFailsSlots',
          src: fromPromise(async ({ input }) => {
            if (!input) {
              return Promise.reject('No labwares scanned');
            }
            const response = await stanCore.FindPassFails({
              barcode: input.labware[input.labware.length - 1].barcode,
              operationType: 'Slide processing'
            });
            return {
              barcode: input.labware[input.labware.length - 1].barcode,
              result: response
            };
          }),
          input: ({ event }) => {
            if (event.type !== 'UPDATE_INPUT_LABWARE') return undefined;
            return {
              labware: event.labware
            };
          },
          onDone: {
            target: 'ready',
            actions: 'assignFailedSlots'
          },
          onError: {
            target: 'ready',
            actions: 'assignPassFailError'
          }
        }
      },
      locked: {
        on: {
          UNLOCK: 'ready'
        }
      }
    }
  },
  {
    ...machineImplementations
  }
);

export default createSlotMapperMachine;
