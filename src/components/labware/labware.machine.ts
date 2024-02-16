import { assign, createMachine, enqueueActions } from 'xstate';
import { LabwareMachineContext, LabwareMachineEvent, LabwareMachineSchema } from './labware.types';
import { emptySlots, filledSlots, findSlotByAddress, isSlotEmpty, isSlotFilled } from '../../lib/helpers/slotHelper';
import { sortDownRight } from '../../lib/helpers/labwareHelper';
import { SlotFieldsFragment } from '../../types/sdk';

function createLabwareMachine() {
  return createMachine(
    {
      id: 'labwareMachine',
      types: {} as {
        context: LabwareMachineContext;
        schema: LabwareMachineSchema;
        events: LabwareMachineEvent;
      },
      initial: 'unknown',
      context: ({ input }: { input: LabwareMachineContext }) => ({
        slots: input.slots ?? [],
        selectedAddresses: input.selectedAddresses ?? new Set<string>(),
        lastSelectedAddress: input.lastSelectedAddress ?? null,
        selectionMode: input.selectionMode ?? 'single',
        selectable: input.selectable ?? 'none'
      }),
      on: {
        RESET_SELECTED: {
          actions: 'clearSelectedSlots'
        },
        CHANGE_SELECTION_MODE: {
          actions: assign(({ context, event }) => {
            return {
              ...context,
              selectable: event.selectable,
              selectionMode: event.selectionMode,
              selectedAddresses: new Set<string>()
            };
          }),
          target: '.unknown'
        },
        UPDATE_SLOTS: {
          actions: 'updateSlots'
        }
      },
      states: {
        unknown: {
          always: chooseState
        },
        non_selectable: {},
        selectable: {
          initial: 'any',
          states: {
            any: {
              initial: 'single',
              states: {
                single: {
                  on: {
                    SELECT_SLOT: singleSelectSlotHandler,
                    CTRL_SELECT_SLOT: singleCtrlSelectSlotHandler
                  }
                },
                multi: {
                  on: {
                    SELECT_SLOT: multiSelectSlotHandler,
                    SELECT_TO_SLOT: multiSelectToSlotHandler,
                    CTRL_SELECT_SLOT: multiCtrlSelectSlotHandler
                  }
                }
              }
            },
            non_empty: {
              initial: 'single',
              states: {
                /**
                 * The event handlers in this state are the same as `{any: single}` above
                 * EXCEPT, they will check the selected well is non-empty first. If it's not, no action is taken.
                 */
                single: {
                  on: {
                    SELECT_SLOT: [isSelectedEmptyHandler, ...singleSelectSlotHandler],
                    CTRL_SELECT_SLOT: [isSelectedEmptyHandler, ...singleCtrlSelectSlotHandler]
                  }
                },
                multi: {
                  /**
                   * The event handlers in this state are the same as `{any: multi}` above
                   * EXCEPT, they will check the selected well is non-empty first. If it's not, no action is taken.
                   */
                  on: {
                    SELECT_SLOT: [isSelectedEmptyHandler, ...multiSelectSlotHandler],
                    SELECT_TO_SLOT: [isSelectedEmptyHandler, ...multiSelectToSlotHandler],
                    CTRL_SELECT_SLOT: [isSelectedEmptyHandler, ...multiCtrlSelectSlotHandler]
                  }
                }
              }
            },
            empty: {
              initial: 'single',
              states: {
                single: {
                  on: {
                    /**
                     * The event handlers in this state are exactly the same as `{any: single}` above
                     * EXCEPT, they will check the selected well is empty first. If it is, no action is taken.
                     */
                    SELECT_SLOT: [isSelectedNotEmptyHandler, ...singleSelectSlotHandler],
                    CTRL_SELECT_SLOT: [isSelectedNotEmptyHandler, ...singleCtrlSelectSlotHandler]
                  }
                },
                multi: {
                  /**
                   * The event handlers in this state are exactly the same as `{any: multi}` above
                   * EXCEPT, they will check the selected well is empty first. If it is, no action is taken.
                   */
                  on: {
                    SELECT_SLOT: [isSelectedNotEmptyHandler, ...multiSelectSlotHandler],
                    SELECT_TO_SLOT: [isSelectedNotEmptyHandler, ...multiSelectToSlotHandler],
                    CTRL_SELECT_SLOT: [isSelectedNotEmptyHandler, ...multiCtrlSelectSlotHandler]
                  }
                }
              }
            }
          }
        },
        locked: {}
      }
    },
    {
      actions: {
        clearSelectedSlots: assign(({ context }) => {
          return { ...context, selectedAddresses: new Set<string>() };
        }),

        deselectSlot: assign(({ context, event }) => {
          if ('address' in event) {
            return {
              ...context,
              selectedAddresses: new Set([...context.selectedAddresses].filter((a) => a !== event.address))
            };
          }
          return context;
        }),

        forwardEvent: enqueueActions(({ context, event, enqueue }) => {
          enqueue(event);
        }),

        selectSlot: assign(({ context, event }) => {
          if ('address' in event) {
            return {
              ...context,
              selectedAddresses: new Set([...context.selectedAddresses]).add(event.address)
            };
          }
          return context;
        }),

        storeLastSelectedSlot: assign(({ context, event }) => {
          if ('address' in event) {
            return {
              ...context,
              lastSelectedAddress: event.address
            };
          }
          return context;
        }),

        /**
         * Selects all slots between the `ctx.lastSelectedAddress` (if available), and the newly clicked address.
         * Takes into account the current state (e.g. empty, non-empty) of the machine
         */
        selectSlotsBetween: assign(({ context, event, self }) => {
          if (event.type !== 'SELECT_TO_SLOT' || context.lastSelectedAddress == null) {
            return context;
          }
          // This may need to be configurable in the future...?
          const sortedSlots = sortDownRight(context.slots) as SlotFieldsFragment[];

          const selectedAddressIndex = sortedSlots.findIndex((slot) => slot.address === event.address);
          const lastSelectedAddressIndex = sortedSlots.findIndex(
            (slot) => slot.address === context.lastSelectedAddress
          );

          const [startSlotIndex, endSlotIndex] = [
            selectedAddressIndex,
            lastSelectedAddressIndex
            // The default JS sort is stupid, as it converts values to strings, and compares them lexicographically.
            // e.g. you end up with nonsense like 9 > 80.
            //  To compare numbers, we must provide our own comparator.
          ].sort((a, b) => a - b);

          let selectedSlots = sortedSlots.slice(startSlotIndex, endSlotIndex + 1);
          const snapshot = self.getSnapshot();

          // If we only want to select non-empty wells, filter out empty ones...
          if (snapshot.matches({ selectable: { non_empty: 'multi' } })) {
            selectedSlots = filledSlots(selectedSlots);

            // If we only want to select empty wells, filter out non-empty ones...
          } else if (snapshot.matches({ selectable: { empty: 'multi' } })) {
            selectedSlots = emptySlots(selectedSlots);
          }

          const selectedAddresses = new Set(context.selectedAddresses);
          selectedSlots.forEach((slot) => selectedAddresses.add(slot.address));
          return { ...context, selectedAddresses };
        }),

        updateSlots: assign(({ context, event }) => {
          if (event.type === 'UPDATE_SLOTS') {
            return {
              ...context,
              slots: event.slots
            };
          }
          return context;
        })
      },

      guards: {
        isSelectedEmpty: ({ context, event }) => {
          return 'address' in event && isSlotEmpty(findSlotByAddress(context.slots, event.address));
        },

        isSelectedNotEmpty: ({ context, event }) => {
          return 'address' in event && isSlotFilled(findSlotByAddress(context.slots, event.address));
        },

        isSlotSelected: ({ context, event }) => {
          return 'address' in event && context.selectedAddresses.has(event.address);
        },

        isLastSelectedSlot: ({ context, event }) => context.lastSelectedAddress != null
      }
    }
  );
}

export default createLabwareMachine;

/**
 * Actions for choosing the next state based on the current context's `selectable` and `selectionMode` values
 */
const chooseState = [
  {
    guard: ({ context }: { context: LabwareMachineContext }) => context.selectable === 'none',
    target: 'non_selectable'
  },
  {
    guard: ({ context }: { context: LabwareMachineContext }) =>
      context.selectable === 'any' && context.selectionMode === 'single',
    target: 'selectable.any.single'
  },
  {
    guard: ({ context }: { context: LabwareMachineContext }) =>
      context.selectable === 'any' && context.selectionMode === 'multi',
    target: 'selectable.any.multi'
  },
  {
    guard: ({ context }: { context: LabwareMachineContext }) =>
      context.selectable === 'non_empty' && context.selectionMode === 'single',
    target: 'selectable.non_empty.single'
  },
  {
    guard: ({ context }: { context: LabwareMachineContext }) =>
      context.selectable === 'non_empty' && context.selectionMode === 'multi',
    target: 'selectable.non_empty.multi'
  },
  {
    guard: ({ context }: { context: LabwareMachineContext }) =>
      context.selectable === 'empty' && context.selectionMode === 'single',
    target: 'selectable.empty.single'
  },
  {
    guard: ({ context }: { context: LabwareMachineContext }) =>
      context.selectable === 'empty' && context.selectionMode === 'multi',
    target: 'selectable.empty.multi'
  }
];

/**
 * Event handlers with conditions for checking if a selected slot is empty or not
 */
const isSelectedEmptyHandler = {
  guard: 'isSelectedEmpty'
};

const isSelectedNotEmptyHandler = {
  guard: 'isSelectedNotEmpty'
};

/**
 * Handlers for the various states of the machine ({any, empty, non_empty} and {single, multi})
 */
const singleSelectSlotHandler = [
  {
    guard: 'isSlotSelected'
  },
  {
    actions: ['clearSelectedSlots', 'selectSlot']
  }
];
const singleCtrlSelectSlotHandler = [
  {
    guard: 'isSlotSelected',
    actions: ['deselectSlot']
  },
  {
    actions: ['clearSelectedSlots', 'selectSlot']
  }
];
const multiSelectSlotHandler = [
  {
    actions: ['clearSelectedSlots', 'selectSlot', 'storeLastSelectedSlot']
  }
];
const multiSelectToSlotHandler = [
  {
    guard: 'isSlotSelected',
    actions: ['deselectSlot']
  },
  {
    guard: 'isLastSelectedSlot',
    actions: ['selectSlotsBetween']
  },
  {
    actions: ['selectSlot', 'storeLastSelectedSlot']
  }
];
const multiCtrlSelectSlotHandler = [
  {
    guard: 'isSlotSelected',
    actions: ['deselectSlot']
  },
  {
    actions: ['selectSlot']
  }
];
