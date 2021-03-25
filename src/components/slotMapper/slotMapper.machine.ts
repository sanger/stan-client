import { Machine, MachineOptions } from "xstate";
import {
  SlotMapperContext,
  SlotMapperEvent,
  SlotMapperSchema,
} from "./slotMapper.types";
import { assign } from "@xstate/immer";
import { GridDirection, SlotCopyContent } from "../../types/graphql";
import { cycleColors, genAddresses } from "../../lib/helpers";
import { sortWithDirection } from "../../lib/helpers/addressHelper";
import { find, indexOf, intersection, map } from "lodash";

const colors = cycleColors();

const machineConfig: Partial<MachineOptions<
  SlotMapperContext,
  SlotMapperEvent
>> = {
  actions: {
    assignInputLabware: assign((ctx, e) => {
      e.type === "UPDATE_INPUT_LABWARE" && (ctx.inputLabware = e.labware);
    }),

    assignLabwareColors: assign((ctx) => {
      ctx.inputLabware.forEach((lw) => {
        if (!ctx.colorByBarcode.has(lw.barcode)) {
          ctx.colorByBarcode.set(lw.barcode, colors.next().value);
        }
      });
    }),

    checkSlots: assign((ctx) => {
      const inputLabwareBarcodes = map(ctx.inputLabware, "barcode");
      ctx.slotCopyContent = ctx.slotCopyContent.filter((scc) =>
        inputLabwareBarcodes.includes(scc.sourceBarcode)
      );
    }),

    clearSlots: assign((ctx, e) => {
      if (e.type !== "CLEAR_SLOTS") {
        return;
      }
      ctx.slotCopyContent = ctx.slotCopyContent.filter(
        (scc) => !e.outputAddresses.includes(scc.destinationAddress)
      );
    }),

    copySlots: assign((ctx, e) => {
      if (e.type !== "COPY_SLOTS") {
        return;
      }

      const inputLabware = find(ctx.inputLabware, { id: e.inputLabwareId });
      const outputLabware = find(ctx.outputLabware, {
        id: e.outputLabwareId,
      });

      if (!inputLabware || !outputLabware) {
        return;
      }

      // Get all the addresses of the output labware
      const outputAddresses = Array.from(
        genAddresses(outputLabware.labwareType, GridDirection.DownRight)
      );

      // Get the index of the clicked destination address
      const destinationAddressIndex = indexOf(outputAddresses, e.outputAddress);

      if (destinationAddressIndex === -1) {
        return;
      }

      // Sort the input addresses
      const sortedInputAddresses = sortWithDirection(
        e.inputAddresses,
        GridDirection.DownRight
      );

      // Find the addresses on the output labware we wish to map the source addresses onto
      const sourceToDestination = sortedInputAddresses.reduce<{
        [key: string]: string;
      }>((memo, sourceAddress, index) => {
        memo[sourceAddress] = outputAddresses[destinationAddressIndex + index];
        return memo;
      }, {});

      // Don't map if any of the destination addresses are already filled.
      if (
        intersection(
          map(ctx.slotCopyContent, "destinationAddress"),
          Object.values(sourceToDestination)
        ).length > 0
      ) {
        return;
      }

      // Don't map if all source addresses can not fit where user has clicked
      if (
        destinationAddressIndex + e.inputAddresses.length >
        outputAddresses.length
      ) {
        return;
      }

      // Everything looks good, so we can create the list of SlotCopyContent
      const newSlotCopyContent: Array<SlotCopyContent> = Object.entries(
        sourceToDestination
      ).map(([sourceAddress, destinationAddress]) => ({
        sourceAddress,
        destinationAddress,
        sourceBarcode: inputLabware.barcode,
      }));

      ctx.slotCopyContent = ctx.slotCopyContent
        // Remove sources that have already been copied
        .filter((scc) => {
          return !(
            scc.sourceBarcode === inputLabware.barcode &&
            e.inputAddresses.includes(scc.sourceAddress)
          );
        })
        // Then add on the newly created slot copy content
        .concat(newSlotCopyContent);
    }),
  },
};

const slotMapperMachine = Machine<
  SlotMapperContext,
  SlotMapperSchema,
  SlotMapperEvent
>(
  {
    id: "slotMapperMachine",
    initial: "ready",
    states: {
      ready: {
        entry: "assignLabwareColors",
        on: {
          COPY_SLOTS: {
            actions: ["copySlots"],
          },
          CLEAR_SLOTS: {
            actions: ["clearSlots"],
          },
          UPDATE_INPUT_LABWARE: {
            actions: [
              "assignInputLabware",
              "assignLabwareColors",
              "checkSlots",
            ],
          },
          LOCK: "locked",
        },
      },
      locked: {
        on: {
          UNLOCK: "ready",
        },
      },
    },
  },
  machineConfig
);

export default slotMapperMachine;
