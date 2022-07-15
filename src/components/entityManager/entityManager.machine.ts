import { assign, createMachine } from "xstate";
import { MachineServiceDone, MachineServiceError } from "../../types/stan";
import { Maybe } from "../../types/sdk";
import { ClientError } from "graphql-request";
import { EntityValueType } from "./EntityManager";

interface EntityManagerContext<E> {
  entities: Array<E>;
  keyField: keyof E;
  valueField: keyof E;
  successMessage: Maybe<string>;
  error: Maybe<ClientError>;
}

type EntityManagerEvent<E> =
  | {
      type: "VALUE_CHANGE";
      entity: E;
      value: EntityValueType;
    }
  | {
      type: "DRAFT_NEW_ENTITY";
    }
  | {
      type: "CREATE_NEW_ENTITY";
      value: string;
    }
  | { type: "DISCARD_DRAFT" }
  | MachineServiceDone<"valueChanged", E>
  | MachineServiceError<"valueChanged", ClientError>
  | MachineServiceDone<"createEntity", E>
  | MachineServiceError<"createEntity", ClientError>;

export function createEntityManagerMachine<E>(
  entities: Array<E>,
  keyField: keyof E,
  valueField: keyof E
) {
  return createMachine<EntityManagerContext<E>, EntityManagerEvent<E>>(
    {
      context: {
        entities,
        keyField,
        valueField,
        successMessage: null,
        error: null,
      },
      id: "entityManager",
      initial: "ready",
      states: {
        ready: {
          on: {
            VALUE_CHANGE: "loading.valueChanged",
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
            valueChanged: {
              invoke: {
                src: "valueChanged",
                id: "valueChanged",
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
                id: "createEntity",
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
            e.type !== "error.platform.valueChanged"
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
          if (e.type !== "done.invoke.valueChanged") {
            return {};
          }

          const successMessage =
            typeof e.data[ctx.valueField] === "boolean"
              ? `"${e.data[ctx.keyField]}" ${
                  e.data[ctx.valueField] ? "enabled" : "disabled"
                }`
              : `"${e.data[ctx.keyField]}" - ${
                  ctx.valueField as string
                } changed to ${e.data[ctx.valueField]}`;

          return {
            successMessage,
            entities: ctx.entities.map((entity) => {
              if (entity[ctx.keyField] === e.data[ctx.keyField]) {
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
