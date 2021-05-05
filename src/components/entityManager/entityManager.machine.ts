import { assign, createMachine } from "xstate";
import {
  HasEnabled,
  MachineServiceDone,
  MachineServiceError,
} from "../../types/stan";
import { Maybe } from "../../types/sdk";
import { ClientError } from "graphql-request";

interface EntityManagerContext<E extends HasEnabled> {
  entities: Array<E>;
  field: keyof E;
  successMessage: Maybe<string>;
  error: Maybe<ClientError>;
}

type EntityManagerEvent<E extends HasEnabled> =
  | {
      type: "TOGGLE_ENABLED";
      entity: E;
      enabled: boolean;
    }
  | {
      type: "DRAFT_NEW_ENTITY";
    }
  | {
      type: "CREATE_NEW_ENTITY";
      value: string;
    }
  | { type: "DISCARD_DRAFT" }
  | MachineServiceDone<"toggleEnabled", E>
  | MachineServiceError<"toggleEnabled", ClientError>
  | MachineServiceDone<"createEntity", E>
  | MachineServiceError<"createEntity", ClientError>;

export function createEntityManagerMachine<E extends HasEnabled>(
  entities: Array<E>,
  field: keyof E
) {
  return createMachine<EntityManagerContext<E>, EntityManagerEvent<E>>(
    {
      context: {
        entities,
        field,
        successMessage: null,
        error: null,
      },
      id: "entityManager",
      initial: "ready",
      states: {
        ready: {
          on: {
            TOGGLE_ENABLED: "loading.toggleEnabled",
            DRAFT_NEW_ENTITY: "draftCreation",
          },
        },
        draftCreation: {
          on: {
            DISCARD_DRAFT: "ready",
            CREATE_NEW_ENTITY: "loading.creatingEntity",
          },
        },
        loading: {
          entry: ["clearMessages"],
          states: {
            toggleEnabled: {
              invoke: {
                src: "toggleEnabled",
                onDone: {
                  target: "#entityManager.ready",
                  actions: "updateEntity",
                },
                onError: {
                  target: "#entityManager.ready",
                  actions: "assignErrorMessage",
                },
              },
            },
            creatingEntity: {
              invoke: {
                src: "createEntity",
                onDone: {
                  target: "#entityManager.ready",
                  actions: "addEntity",
                },
                onError: {
                  target: "#entityManager.ready",
                  actions: "assignErrorMessage",
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        addEntity: assign((ctx, e) => {
          if (e.type !== "done.invoke.createEntity") {
            return {};
          }
          return {
            successMessage: `Saved`,
            entities: [...ctx.entities, e.data],
          };
        }),

        assignErrorMessage: assign((ctx, e) => {
          if (
            e.type !== "error.platform.createEntity" &&
            e.type !== "error.platform.toggleEnabled"
          ) {
            return {};
          }
          return {
            error: e.data,
          };
        }),

        clearMessages: assign((_ctx) => {
          return {
            successMessage: null,
            error: null,
          };
        }),

        updateEntity: assign((ctx, e) => {
          if (e.type !== "done.invoke.toggleEnabled") {
            return {};
          }

          const successMessage = `"${e.data[ctx.field]}" ${
            e.data.enabled ? "enabled" : "disabled"
          }`;

          return {
            successMessage,
            entities: ctx.entities.map((entity) => {
              if (entity[ctx.field] === e.data[ctx.field]) {
                return e.data;
              } else {
                return entity;
              }
            }),
          };
        }),
      },
    }
  );
}
