import { OutputSlotCopyData, SlotMapperContext, SlotMapperEvent, SlotMapperSchema } from './slotMapper.types';
import { GridDirection, LabwareFlaggedFieldsFragment, PassFail, SlotCopyContent, SlotPassFail } from '../../types/sdk';
import { buildAddresses, cycleColors } from '../../lib/helpers';
import { sortWithDirection } from '../../lib/helpers/addressHelper';
import { find, indexOf, intersection, map } from 'lodash';
import { stanCore } from '../../lib/sdk';
import { assign, createMachine, fromPromise } from 'xstate';

const colors = cycleColors();

const machineConfig = {
  actions: {
    assignInputLabware: assign(({ context, event }) => {
      event.type === 'UPDATE_INPUT_LABWARE' && (context.inputLabware = event.labware);
      //update the failedSlots array  if it  has entries for any removed labware
      let keys = context.failedSlots
        .keys()
        .filter(
          (key: string) =>
            context.inputLabware.findIndex((labware: LabwareFlaggedFieldsFragment) => labware.barcode === key) === -1
        );
      keys.forEach((key: string) => context.failedSlots.delete(key));

      //update the error array  if it  has entries for any removed labware
      keys = context.errors
        .keys()
        .filter(
          (key: string) =>
            context.inputLabware.findIndex((labware: LabwareFlaggedFieldsFragment) => labware.barcode === key) === -1
        );
      keys.forEach((key: string) => context.errors.delete(key));

      //Update destination slotCopyContent if it  has entries for any removed labware
      context.outputSlotCopies.forEach((outputScc: OutputSlotCopyData) => {
        outputScc.slotCopyContent = outputScc.slotCopyContent.filter((scc) =>
          context.inputLabware.some((lw: LabwareFlaggedFieldsFragment) => lw.barcode === scc.sourceBarcode)
        );
      });
      return context;
    }),
    assignOutputLabware: assign(({ context, event }) => {
      event.type === 'UPDATE_OUTPUT_LABWARE' && (context.outputSlotCopies = event.outputSlotCopyContent);
    }),

    assignLabwareColors: assign(({ context }) => {
      context.inputLabware.forEach((lw: LabwareFlaggedFieldsFragment) => {
        if (!context.colorByBarcode.has(lw.barcode)) {
          context.colorByBarcode.set(lw.barcode, colors.next().value);
        }
      });
    }),

    checkSlots: assign(({ context }) => {
      const inputLabwareBarcodes = map(context.inputLabware, 'barcode');
      context.outputSlotCopies.forEach((outputScc: OutputSlotCopyData) => {
        outputScc.slotCopyContent = outputScc.slotCopyContent.filter((scc) =>
          inputLabwareBarcodes.includes(scc.sourceBarcode)
        );
      });
    }),

    clearSlots: assign(({ context, event }) => {
      if (event.type !== 'CLEAR_SLOTS') {
        return;
      }
      const outputScc = context.outputSlotCopies.find(
        (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
      );
      if (outputScc) {
        outputScc.slotCopyContent = outputScc.slotCopyContent.filter(
          (scc: SlotCopyContent) => !event.outputAddresses.includes(scc.destinationAddress)
        );
      }
    }),
    clearSlotMappingsBetween: assign(({ context, event }) => {
      if (event.type !== 'CLEAR_ALL_SLOT_MAPPINGS_BETWEEN') {
        return;
      }
      const outputScc = context.outputSlotCopies.find(
        (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
      );
      if (outputScc) {
        outputScc.slotCopyContent = outputScc.slotCopyContent.filter(
          (scc: SlotCopyContent) => scc.sourceBarcode !== event.inputLabwareBarcode
        );
      }
    }),
    copyOneToOneSlots: assign(({ context, event }) => {
      if (event.type !== 'COPY_ONE_TO_ONE_SLOTS') {
        return;
      }

      const inputLabware = find(context.inputLabware, { id: event.inputLabwareId });
      const outputScc = context.outputSlotCopies.find(
        (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
      );

      if (!inputLabware || !outputScc) {
        return;
      }

      // Get all the addresses of the output labware
      const outputAddresses = buildAddresses(outputScc.labware.labwareType, GridDirection.DownRight);

      // Get the index of the clicked destination address
      const destinationAddressIndex = indexOf(outputAddresses, event.outputAddress);

      if (destinationAddressIndex === -1) {
        return;
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
        intersection(map(outputScc.slotCopyContent, 'destinationAddress'), Object.values(sourceToDestination)).length >
        0
      ) {
        return;
      }

      // Don't map if all source addresses can not fit where user has clicked
      if (destinationAddressIndex + event.inputAddresses.length > outputAddresses.length) {
        return;
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
    }),
    copyManyToOneSlots: assign(({ context, event }) => {
      if (event.type !== 'COPY_MANY_TO_ONE_SLOTS') {
        return;
      }

      const inputLabware = find(context.inputLabware, { id: event.inputLabwareId });
      const outputScc = context.outputSlotCopies.find(
        (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
      );

      if (!inputLabware || !outputScc) {
        return;
      }
      // Get all the addresses of the output labware
      const outputAddresses = buildAddresses(outputScc.labware.labwareType, GridDirection.DownRight);

      // Get the index of the clicked destination address
      const destinationAddressIndex = indexOf(outputAddresses, event.outputAddress);

      if (destinationAddressIndex === -1) {
        return;
      }
      // Don't map if the destination addresses are already filled.
      if (outputScc.slotCopyContent.find((scc: SlotCopyContent) => scc.destinationAddress === event.outputAddress)) {
        return;
      }
      //Create mapping between all selected input addresses and output address
      event.inputAddresses.forEach((inputAddress: string) =>
        outputScc.slotCopyContent.push({
          destinationAddress: event.outputAddress,
          sourceBarcode: inputLabware.barcode,
          sourceAddress: inputAddress
        })
      );
    }),
    copyOneToManySlots: assign(({ context, event }) => {
      if (event.type !== 'COPY_ONE_TO_MANY_SLOTS') {
        return;
      }
      const inputLabware = find(context.inputLabware, { id: event.inputLabwareId });
      const outputScc = context.outputSlotCopies.find(
        (outputScc: OutputSlotCopyData) => outputScc.labware.id === event.outputLabwareId
      );

      if (!inputLabware || !outputScc) {
        return;
      }

      // Get all the addresses of the output labware
      const outputAddresses = buildAddresses(outputScc.labware.labwareType, GridDirection.DownRight);

      // Get the index of the clicked destination address
      const destinationAddressIndex = indexOf(outputAddresses, event.outputAddress);

      if (destinationAddressIndex === -1) {
        return;
      }
      // Don't map if the destination addresses are already filled.
      if (outputScc.slotCopyContent.find((scc: SlotCopyContent) => scc.destinationAddress === event.outputAddress)) {
        return;
      }
      //Update Slot content with the mapping
      outputScc.slotCopyContent.push({
        destinationAddress: event.outputAddress,
        sourceBarcode: inputLabware.barcode,
        sourceAddress: event.inputAddress
      });
    }),

    assignFailedSlots: assign(({ context, event }) => {
      if (event.type !== 'xstate.done.actor.passFailsSlots') return;

      /*If there are multiple slide processing performed on same labware, check the latest matching operation recorded
       which would be the last one in the array.
       */
      if (event.output.result.passFails && event.output.result.passFails.length > 0) {
        const slotPassFails: SlotPassFail[] =
          event.output.result.passFails[event.output.result.passFails.length - 1].slotPassFails;
        if (slotPassFails) {
          const failedAddresses = slotPassFails.filter((slotPassFail) => slotPassFail.result === PassFail.Fail);
          if (failedAddresses.length > 0) {
            context.failedSlots.set(event.output.barcode, failedAddresses);
          }
        }
      }
    }),
    assignPassFailError: assign(({ context, event }) => {
      if (event.type !== 'xstate.error.actor.passFailsSlots') return context;
      context.errors.set(event.barcode, event.error);
      return context;
    })
  }
};

interface SlotMapperMachineParams {
  inputLabware: Array<LabwareFlaggedFieldsFragment>;
  outputSlotCopies: Array<OutputSlotCopyData>;
  failedSlotsCheck?: boolean;
}

function createSlotMapperMachine({ inputLabware, outputSlotCopies, failedSlotsCheck = true }: SlotMapperMachineParams) {
  return createMachine({
    id: 'slotMapperMachine',
    types: {} as {
      context: SlotMapperContext;
      schema: SlotMapperSchema;
      events: SlotMapperEvent;
    },
    initial: 'ready',
    context: {
      inputLabware,
      outputSlotCopies,
      failedSlotsCheck,
      colorByBarcode: new Map(),
      failedSlots: new Map(),
      errors: new Map()
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
            if (input.labware.length <= 0) {
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
            if (event.type !== 'UPDATE_INPUT_LABWARE') return {};
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
    },
    ...machineConfig
  });
}

export default createSlotMapperMachine;
