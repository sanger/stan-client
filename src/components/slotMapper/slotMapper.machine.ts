import { Machine, MachineOptions } from "xstate";
import {
  SlotMapperContext,
  SlotMapperEvent,
  SlotMapperSchema,
} from "./slotMapper.types";
import { assign } from "@xstate/immer";
import { GridDirection, PassFail, SlotCopyContent } from "../../types/sdk";
import { buildAddresses, cycleColors } from "../../lib/helpers";
import { sortWithDirection } from "../../lib/helpers/addressHelper";
import { find, indexOf, intersection, map } from "lodash";
import { stanCore } from "../../lib/sdk";

const colors = cycleColors();

const machineConfig: Partial<MachineOptions<
  SlotMapperContext,
  SlotMapperEvent
>> = {
  actions: {
    assignInputLabware: assign((ctx, e) => {
      e.type === "UPDATE_INPUT_LABWARE" && (ctx.inputLabware = e.labware);
      //update the failedSlots array  if it  has entries for any removed labware
      let keys = Array.from(ctx.failedSlots.keys()).filter(
        (key: string) =>
          ctx.inputLabware.findIndex((labware) => labware.barcode === key) ===
          -1
      );
      keys.forEach((key) => ctx.failedSlots.delete(key));

      //update the error array  if it  has entries for any removed labware
      keys = Array.from(ctx.errors.keys()).filter(
        (key: string) =>
          ctx.inputLabware.findIndex((labware) => labware.barcode === key) ===
          -1
      );
      keys.forEach((key) => ctx.errors.delete(key));
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
      const outputAddresses = buildAddresses(
        outputLabware.labwareType,
        GridDirection.DownRight
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
    assignFailedSlots: assign((ctx, e) => {
      if (e.type !== "done.invoke.passFailsSlots") return;

      /*If there are multiple slide processing performed on same labware, check the latest matching operation recorded
       which would be the last one in the array.
       */
      if (e.data.result.passFails && e.data.result.passFails.length > 0) {
        const slotPassFails =
          e.data.result.passFails[e.data.result.passFails.length - 1]
            .slotPassFails;
        if (slotPassFails) {
          const failedAddresses = slotPassFails.filter(
            (slotPassFail) => slotPassFail.result === PassFail.Fail
          );
          if (failedAddresses.length > 0) {
            ctx.failedSlots.set(e.data.barcode, failedAddresses);
          }
        }
      }
    }),
    assignPassFailError: assign((ctx, e) => {
      if (e.type !== "error.platform.passFailsSlots") return;
      ctx.errors.set(e.barcode, e.error);
    }),
  },
  services: {
    passFailsSlots: async (ctx, e) => {
      if (e.type !== "UPDATE_INPUT_LABWARE") {
        return Promise.reject();
      }
      if (e.labware.length <= 0) {
        return Promise.reject("No labwares scanned");
      }
      const response = await stanCore.FindPassFails({
        barcode: e.labware[e.labware.length - 1].barcode,
        operationType: "Slide processing",
      });
      return {
        barcode: e.labware[e.labware.length - 1].barcode,
        result: response,
      };
    },
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
            actions: "copySlots",
          },
          CLEAR_SLOTS: {
            actions: ["clearSlots"],
          },
          UPDATE_INPUT_LABWARE: {
            target: ["updatingLabware"],
            actions: [
              "assignInputLabware",
              "assignLabwareColors",
              "checkSlots",
            ],
          },
          LOCK: "locked",
        },
      },
      updatingLabware: {
        invoke: {
          src: "passFailsSlots",
          onDone: {
            target: "ready",
            actions: "assignFailedSlots",
          },
          onError: {
            target: "ready",
            actions: "assignPassFailError",
          },
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
