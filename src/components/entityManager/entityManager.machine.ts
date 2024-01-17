import { assign, createMachine } from 'xstate';
import { ServerErrors } from '../../types/stan';
import { Maybe } from '../../types/sdk';
import { EntityValueType } from './EntityManager';

interface EntityManagerContext<E> {
  entities: Array<E>;
  keyField: keyof E;
  valueField?: keyof E;
  successMessage: Maybe<string>;
  error: Maybe<ServerErrors>;
  selectedEntity?: E;
}

type EntityManagerEvent<E> =
  | {
      type: 'VALUE_CHANGE';
      entity: E;
      value: EntityValueType;
    }
  | {
      type: 'DRAFT_NEW_ENTITY';
    }
  | {
      type: 'CREATE_NEW_ENTITY';
      value: string;
      extraValue?: string;
    }
  | {
      type: 'SELECT_ENTITY';
      entity: E | undefined;
    }
  | { type: 'DISCARD_DRAFT' }
  | { type: 'EXTRA_PROPERTY_UPDATE_VALUE'; value: string; extraValue: string }
  | { type: 'EXTRA_PROPERTY_DRAFT_VALUE'; entity: E }
  | { type: 'xstate.done.actor.valueChanged'; output: E }
  | { type: 'xstate.error.actor.valueChanged'; error: ServerErrors }
  | { type: 'xstate.done.actor.createEntity'; output: E }
  | { type: 'xstate.error.actor.createEntity'; error: ServerErrors }
  | { type: 'xstate.done.actor.updateExtraProperty'; output: E }
  | { type: 'xstate.error.actor.updateExtraProperty'; error: ServerErrors };

export function createEntityManagerMachine<E>(entities: Array<E>, keyField: keyof E, valueField?: keyof E) {
  return createMachine(
    {
      types: {} as {
        context: EntityManagerContext<E>;
        events: EntityManagerEvent<E>;
      },
      context: {
        entities,
        keyField,
        valueField,
        successMessage: null,
        error: null
      },
      id: 'entityManager',
      initial: 'ready',
      states: {
        ready: {
          on: {
            VALUE_CHANGE: 'loading.valueChanged',
            DRAFT_NEW_ENTITY: 'draftCreation',
            SELECT_ENTITY: { actions: 'assignSelectedEntity' },
            EXTRA_PROPERTY_UPDATE_VALUE: 'loading.updatingExtraProperty',
            EXTRA_PROPERTY_DRAFT_VALUE: { actions: 'draftExtraPropertyValue' }
          }
        },
        draftCreation: {
          on: {
            DISCARD_DRAFT: 'ready',
            CREATE_NEW_ENTITY: 'loading.creatingEntity',
            SELECT_ENTITY: { actions: 'assignSelectedEntity' }
          }
        },
        loading: {
          entry: ['clearMessages'],
          initial: 'valueChanged',
          states: {
            valueChanged: {
              invoke: {
                src: 'valueChanged',
                input: ({ event }) => ({ ...event }),
                id: 'valueChanged',
                onDone: {
                  target: '#entityManager.ready',
                  actions: 'updateEntity'
                },
                onError: {
                  target: '#entityManager.ready',
                  actions: 'assignErrorMessage'
                }
              }
            },
            creatingEntity: {
              invoke: {
                id: 'createEntity',
                src: 'createEntity',
                input: ({ event }) => ({ ...event }),
                onDone: {
                  target: '#entityManager.ready',
                  actions: 'addEntity'
                },
                onError: {
                  target: '#entityManager.ready',
                  actions: 'assignErrorMessage'
                }
              }
            },
            updatingExtraProperty: {
              invoke: {
                id: 'updateExtraProperty',
                src: 'updateExtraProperty',
                input: ({ event }) => ({ ...event }),
                onDone: {
                  target: '#entityManager.ready',
                  actions: 'updateExtraProperty'
                },
                onError: {
                  target: '#entityManager.ready',
                  actions: 'assignErrorMessage'
                }
              }
            }
          }
        }
      }
    },
    {
      actions: {
        addEntity: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.createEntity') {
            return {};
          }
          return {
            successMessage: `Saved`,
            entities: [...context.entities, event.output]
          };
        }),

        assignErrorMessage: assign(({ context, event }) => {
          if (
            event.type !== 'xstate.error.actor.createEntity' &&
            event.type !== 'xstate.error.actor.valueChanged' &&
            event.type !== 'xstate.error.actor.updateExtraProperty'
          ) {
            return {};
          }

          return {
            error: event.error
          };
        }),
        assignSelectedEntity: assign(({ event }) => {
          if (event.type !== 'SELECT_ENTITY') return {};
          return { selectedEntity: event.entity };
        }),
        clearMessages: assign(() => {
          return {
            successMessage: null,
            error: null
          };
        }),
        updateEntity: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.valueChanged' || !context.valueField) {
            return {};
          }

          const successMessage =
            typeof event.output[context.valueField] === 'boolean'
              ? `"${event.output[context.keyField]}" ${event.output[context.valueField] ? 'enabled' : 'disabled'}`
              : `"${event.output[context.keyField]}" - ${context.valueField as string} changed to ${
                  event.output[context.valueField]
                }`;

          return {
            successMessage,
            entities: context.entities.map((entity) => {
              if (entity[context.keyField] === event.output[context.keyField]) {
                return event.output;
              } else {
                return entity;
              }
            })
          };
        }),
        draftExtraPropertyValue: assign(({ context, event }) => {
          if (event.type !== 'EXTRA_PROPERTY_DRAFT_VALUE') return {};
          return {
            entities: context.entities.map((entity) =>
              entity[context.keyField] === event.entity[context.keyField] ? event.entity : entity
            )
          };
        }),
        updateExtraProperty: assign(({ context, event }) => {
          if (event.type !== 'xstate.done.actor.updateExtraProperty') {
            return {};
          }
          return {
            successMessage: `Changes for "${event.output[context.keyField]}" saved`,
            entities: context.entities.map((entity) =>
              entity[context.keyField] === event.output[context.keyField] ? event.output : entity
            )
          };
        })
      }
    }
  );
}
