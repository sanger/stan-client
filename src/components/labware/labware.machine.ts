import { Machine, MachineOptions, send } from "xstate";
import {
  LabwareMachineContext,
  LabwareMachineEvent,
  LabwareMachineSchema,
  Selectable,
  SelectionMode,
} from "./labware.types";
import { assign } from "@xstate/immer";
import { pure } from "xstate/lib/actions";
import { SlotFieldsFragment } from "../../types/sdk";
import {
  emptySlots,
  filledSlots,
  findSlotByAddress,
  isSlotEmpty,
  isSlotFilled,
} from "../../lib/helpers/slotHelper";
import { sortDownRight } from "../../lib/helpers/labwareHelper";

interface CreateLabwareMachineParams {
  slots: Array<SlotFieldsFragment>;
  selectionMode: SelectionMode;
  selectable: Selectable;
}

function createLabwareMachine({
  slots,
  selectionMode,
  selectable,
}: CreateLabwareMachineParams) {
  return Machine<
    LabwareMachineContext,
    LabwareMachineSchema,
    LabwareMachineEvent
  >(
    {
      id: "labwareMachine",
      initial: "unknown",
      context: {
        slots,
        selectedAddresses: new Set<string>(),
        lastSelectedAddress: null,
        selectionMode,
        selectable,
      },
      on: {
        RESET_SELECTED: {
          actions: assign((ctx) => ctx.selectedAddresses.clear()),
        },
        CHANGE_SELECTION_MODE: {
          actions: assign((ctx, e) => {
            ctx.selectable = e.selectable;
            ctx.selectionMode = e.selectionMode;
            ctx.selectedAddresses.clear();
          }),
          target: "unknown",
        },
        UPDATE_SLOTS: {
          actions: "updateSlots",
        },
      },
      states: {
        unknown: {
          always: chooseState,
        },
        non_selectable: {},
        selectable: {
          states: {
            any: {
              states: {
                single: {
                  on: {
                    SELECT_SLOT: singleSelectSlotHandler,
                    CTRL_SELECT_SLOT: singleCtrlSelectSlotHandler,
                  },
                },
                multi: {
                  on: {
                    SELECT_SLOT: multiSelectSlotHandler,
                    SELECT_TO_SLOT: multiSelectToSlotHandler,
                    CTRL_SELECT_SLOT: multiCtrlSelectSlotHandler,
                  },
                },
              },
            },
            non_empty: {
              states: {
                /**
                 * The event handlers in this state are the same as `{any: single}` above
                 * EXCEPT, they will check the selected well is non-empty first. If it's not, no action is taken.
                 */
                single: {
                  on: {
                    SELECT_SLOT: [
                      isSelectedEmptyHandler,
                      ...singleSelectSlotHandler,
                    ],
                    CTRL_SELECT_SLOT: [
                      isSelectedEmptyHandler,
                      ...singleCtrlSelectSlotHandler,
                    ],
                  },
                },
                multi: {
                  /**
                   * The event handlers in this state are the same as `{any: multi}` above
                   * EXCEPT, they will check the selected well is non-empty first. If it's not, no action is taken.
                   */
                  on: {
                    SELECT_SLOT: [
                      isSelectedEmptyHandler,
                      ...multiSelectSlotHandler,
                    ],
                    SELECT_TO_SLOT: [
                      isSelectedEmptyHandler,
                      ...multiSelectToSlotHandler,
                    ],
                    CTRL_SELECT_SLOT: [
                      isSelectedEmptyHandler,
                      ...multiCtrlSelectSlotHandler,
                    ],
                  },
                },
              },
            },
            empty: {
              states: {
                single: {
                  on: {
                    /**
                     * The event handlers in this state are exactly the same as `{any: single}` above
                     * EXCEPT, they will check the selected well is empty first. If it is, no action is taken.
                     */
                    SELECT_SLOT: [
                      isSelectedNotEmptyHandler,
                      ...singleSelectSlotHandler,
                    ],
                    CTRL_SELECT_SLOT: [
                      isSelectedNotEmptyHandler,
                      ...singleCtrlSelectSlotHandler,
                    ],
                  },
                },
                multi: {
                  /**
                   * The event handlers in this state are exactly the same as `{any: multi}` above
                   * EXCEPT, they will check the selected well is empty first. If it is, no action is taken.
                   */
                  on: {
                    SELECT_SLOT: [
                      isSelectedNotEmptyHandler,
                      ...multiSelectSlotHandler,
                    ],
                    SELECT_TO_SLOT: [
                      isSelectedNotEmptyHandler,
                      ...multiSelectToSlotHandler,
                    ],
                    CTRL_SELECT_SLOT: [
                      isSelectedNotEmptyHandler,
                      ...multiCtrlSelectSlotHandler,
                    ],
                  },
                },
              },
            },
          },
        },
        locked: {},
      },
    },
    machineOptions
  );
}

const machineOptions: Partial<MachineOptions<
  LabwareMachineContext,
  LabwareMachineEvent
>> = {
  actions: {
    clearSelectedSlots: assign((ctx) => ctx.selectedAddresses.clear()),

    deselectSlot: assign((ctx, e) => {
      "address" in e && ctx.selectedAddresses.delete(e.address);
    }),

    forwardEvent: pure((ctx, event) => send(event)),

    selectSlot: assign((ctx, e) => {
      "address" in e && ctx.selectedAddresses.add(e.address);
    }),

    storeLastSelectedSlot: assign((ctx, e) => {
      "address" in e && (ctx.lastSelectedAddress = e.address);
    }),

    /**
     * Selects all slots between the `ctx.lastSelectedAddress` (if available), and the newly clicked address.
     * Takes into account the current state (e.g. empty, non-empty) of the machine
     */
    selectSlotsBetween: assign((ctx, e, meta) => {
      if (e.type !== "SELECT_TO_SLOT" || ctx.lastSelectedAddress == null) {
        return;
      }

      // This may need to be configurable in the future...?
      const sortedSlots = sortDownRight(ctx.slots);

      const selectedAddressIndex = sortedSlots.findIndex(
        (slot) => slot.address === e.address
      );
      const lastSelectedAddressIndex = sortedSlots.findIndex(
        (slot) => slot.address === ctx.lastSelectedAddress
      );

      const [startSlotIndex, endSlotIndex] = [
        selectedAddressIndex,
        lastSelectedAddressIndex,
        // The default JS sort is stupid, as it converts values to strings, and compares them lexicographically.
        // e.g. you end up with nonsense like 9 > 80.
        //  To compare numbers, we must provide our own comparator.
      ].sort((a, b) => a - b);

      let selectedSlots = sortedSlots.slice(startSlotIndex, endSlotIndex + 1);

      // If we only want to select non-empty wells, filter out empty ones...
      if (meta.state?.matches({ selectable: { non_empty: "multi" } })) {
        selectedSlots = filledSlots(selectedSlots);

        // If we only want to select empty wells, filter out non-empty ones...
      } else if (meta.state?.matches({ selectable: { empty: "multi" } })) {
        selectedSlots = emptySlots(selectedSlots);
      }

      selectedSlots.forEach((slot) => ctx.selectedAddresses.add(slot.address));
    }),

    updateSlots: assign((ctx, e) => {
      e.type === "UPDATE_SLOTS" && (ctx.slots = e.slots);
    }),
  },

  guards: {
    isSelectedEmpty: (ctx, e) => {
      return (
        "address" in e && isSlotEmpty(findSlotByAddress(ctx.slots, e.address))
      );
    },

    isSelectedNotEmpty: (ctx, e) => {
      return (
        "address" in e && isSlotFilled(findSlotByAddress(ctx.slots, e.address))
      );
    },

    isSlotSelected: (ctx, e) => {
      return "address" in e && ctx.selectedAddresses.has(e.address);
    },

    isLastSelectedSlot: (ctx) => ctx.lastSelectedAddress != null,
  },
};

export default createLabwareMachine;

/**
 * Actions for choosing the next state based on the current context's `selectable` and `selectionMode` values
 */
const chooseState = [
  {
    cond: (ctx: LabwareMachineContext) => ctx.selectable === "none",
    target: "non_selectable",
  },
  {
    cond: (ctx: LabwareMachineContext) =>
      ctx.selectable === "any" && ctx.selectionMode === "single",
    target: "selectable.any.single",
  },
  {
    cond: (ctx: LabwareMachineContext) =>
      ctx.selectable === "any" && ctx.selectionMode === "multi",
    target: "selectable.any.multi",
  },
  {
    cond: (ctx: LabwareMachineContext) =>
      ctx.selectable === "non_empty" && ctx.selectionMode === "single",
    target: "selectable.non_empty.single",
  },
  {
    cond: (ctx: LabwareMachineContext) =>
      ctx.selectable === "non_empty" && ctx.selectionMode === "multi",
    target: "selectable.non_empty.multi",
  },
  {
    cond: (ctx: LabwareMachineContext) =>
      ctx.selectable === "empty" && ctx.selectionMode === "single",
    target: "selectable.empty.single",
  },
  {
    cond: (ctx: LabwareMachineContext) =>
      ctx.selectable === "empty" && ctx.selectionMode === "multi",
    target: "selectable.empty.multi",
  },
];

/**
 * Event handlers with conditions for checking if a selected slot is empty or not
 */
const isSelectedEmptyHandler = {
  cond: "isSelectedEmpty",
};

const isSelectedNotEmptyHandler = {
  cond: "isSelectedNotEmpty",
};

/**
 * Handlers for the various states of the machine ({any, empty, non_empty} and {single, multi})
 */
const singleSelectSlotHandler = [
  {
    cond: "isSlotSelected",
  },
  {
    actions: ["clearSelectedSlots", "selectSlot"],
  },
];
const singleCtrlSelectSlotHandler = [
  {
    cond: "isSlotSelected",
    actions: ["deselectSlot"],
  },
  {
    actions: ["clearSelectedSlots", "selectSlot"],
  },
];
const multiSelectSlotHandler = [
  {
    actions: ["clearSelectedSlots", "selectSlot", "storeLastSelectedSlot"],
  },
];
const multiSelectToSlotHandler = [
  {
    cond: "isSlotSelected",
    actions: ["deselectSlot"],
  },
  {
    cond: "isLastSelectedSlot",
    actions: ["selectSlotsBetween"],
  },
  {
    actions: ["selectSlot", "storeLastSelectedSlot"],
  },
];
const multiCtrlSelectSlotHandler = [
  {
    cond: "isSlotSelected",
    actions: ["deselectSlot"],
  },
  {
    actions: ["selectSlot"],
  },
];
