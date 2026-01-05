import { LayoutContext, LayoutPlan } from './layoutContext';
import { LayoutSchema, State } from './layoutStates';
import { LayoutEvents } from './layoutEvents';
import { Actions, layoutMachineKey, machineOptions } from './layoutMachineOptions';
import { createMachine } from 'xstate';

export const createLayoutMachine = (layoutPlan: LayoutPlan, possibleActions?: LayoutPlan['plannedActions']) => {
  return createMachine(
    {
      id: layoutMachineKey,
      types: {} as {
        context: LayoutContext;
        events: LayoutEvents;
        schema: LayoutSchema;
      },
      initial: State.INIT,
      context: {
        layoutPlan,
        possibleActions,
        selected: null
      },
      output: ({ context }) => ({
        data: {
          layoutPlan: context.layoutPlan
        }
      }),
      on: {
        DONE: {
          actions: Actions.SEND_LAYOUT_TO_PARENT,
          target: `.${State.DONE}`
        },
        CANCEL: {
          actions: Actions.CANCEL_EDIT_LAYOUT,
          target: `.${State.CANCELLED}`
        }
      },
      states: {
        [State.INIT]: {
          always: [
            {
              guard: ({ context }) => {
                return context.layoutPlan.sources.length > 0;
              },
              target: State.SOURCE_DEST_MODE
            },
            {
              target: State.DEST_ONLY_MODE
            }
          ]
        },
        [State.SOURCE_DEST_MODE]: {
          initial: State.SOURCE_NOT_SELECTED,
          states: {
            [State.SOURCE_NOT_SELECTED]: {
              on: {
                SELECT_DESTINATION: {
                  actions: Actions.REMOVE_PLANNED_ACTION
                }
              }
            },
            [State.SOURCE_SELECTED]: {
              on: {
                SELECT_DESTINATION: {
                  actions: Actions.ASSIGN_DESTINATION
                }
              }
            }
          },
          on: {
            SELECT_SOURCE: {
              target: `${State.SOURCE_DEST_MODE}.${State.SOURCE_SELECTED}`,
              actions: Actions.ASSIGN_SELECTED
            },

            SET_ALL_DESTINATIONS: {
              actions: Actions.ASSIGN_DESTINATION_ACTIONS
            },
            ADD_SECTION_GROUP: {
              actions: Actions.ADD_SECTION_GROUP
            },
            ASSIGN_SELECTED_SLOTS: {
              actions: Actions.ASSIGN_SELECTED_SLOTS
            },
            REMOVE_SECTION_GROUP: {
              actions: Actions.REMOVE_SECTION_GROUP
            },
            RESET_ERROR_MESSAGE: {
              actions: Actions.RESET_ERROR_MESSAGE
            }
          }
        },
        [State.DEST_ONLY_MODE]: {
          on: {
            SELECT_DESTINATION: {
              actions: Actions.ADD_SOURCE_TO_SLOT_DEST
            },
            REMOVE_SOURCE_FROM_SLOT_DEST: {
              actions: Actions.REMOVE_SOURCE_FROM_SLOT_DEST
            },
            ADD_SECTION_GROUP: {
              actions: Actions.ADD_SECTION_GROUP
            },
            REMOVE_SECTION_GROUP: {
              actions: Actions.REMOVE_SECTION_GROUP
            },
            ASSIGN_SELECTED_SLOTS: {
              actions: Actions.ASSIGN_SELECTED_SLOTS
            },
            RESET_ERROR_MESSAGE: {
              actions: Actions.RESET_ERROR_MESSAGE
            }
          }
        },
        [State.DONE]: {
          type: 'final'
        },
        [State.CANCELLED]: {
          type: 'final'
        }
      }
    },
    {
      ...machineOptions
    }
  );
};
