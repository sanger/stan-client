import * as Yup from "yup";
import { assign, Machine } from "xstate";
import { useMachine } from "@xstate/react";
import {
  BlockRegisterRequest,
  GetRegistrationInfoDocument,
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../types/graphql";
import { ApolloQueryResult, useApolloClient } from "@apollo/client";
import { GraphQLError } from "graphql";
import { FormValues } from "../pages/registration/RegistrationForm";

export interface RegistrationContext {
  loadingError: string;
  registrationInfo: GetRegistrationInfoQuery;
  registrationSchema: Yup.ObjectSchema;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: GraphQLError[];
}

export interface RegistrationSchema {
  states: {
    loading: {};
    loaded: {};
    error: {};
    submitting: {};
    submissionError: {};
    complete: {};
  };
}

export type RegistrationEvent =
  | { type: "RETRY" }
  | { type: "SUBMIT_FORM"; values: FormValues };

/**
 * useRegistrationMachine is a React Hook
 *
 * @link https://xstate.js.org/docs/guides/machines.html#configuration
 *
 * @example
 * const [current, send] = useRegistrationMachine();
 * // current is the current state
 *
 * // Use send to send an event to the state machine
 * send({ type: "SUBMIT_FORM", values: values});
 */
export function useRegistrationMachine() {
  const client = useApolloClient();

  // GraphQL Query to fetch Registration Info
  const getRegistrationInfo = (): Promise<
    ApolloQueryResult<GetRegistrationInfoQuery>
  > => client.query({ query: GetRegistrationInfoDocument });

  // GraphQL mutation to submit Registration Info
  const submitRegistrationForm = (
    context: RegistrationContext,
    event: RegistrationEvent
  ) => {
    let blocks: BlockRegisterRequest[] = [];
    if (event.type === "SUBMIT_FORM") {
      blocks = event.values.tissues.reduce<BlockRegisterRequest[]>(
        (memo, tissue) => {
          return [
            ...memo,
            ...tissue.blocks.map<BlockRegisterRequest>((block) => {
              return {
                donorIdentifier: tissue.donorId,
                externalIdentifier: tissue.externalIdentifier,
                highestSection: block.lastKnownSectionNumber,
                hmdmc: tissue.hmdmc,
                labwareType: block.labwareType,
                lifeStage: tissue.lifeStage,
                tissueType: tissue.tissueType,
                spatialLocation: block.spatialLocation,
                replicateNumber: block.replicateNumber,
                medium: block.medium,
                mouldSize: block.mouldSize,
              };
            }),
          ];
        },
        []
      );
    }

    return client.mutate<
      RegisterTissuesMutation,
      RegisterTissuesMutationVariables
    >({
      mutation: RegisterTissuesDocument,
      variables: { request: { blocks } },
    });
  };

  // Creation of the state machine
  const registrationMachine = Machine<
    RegistrationContext,
    RegistrationSchema,
    RegistrationEvent
  >({
    key: "registration",
    initial: "loading",
    states: {
      loading: {
        type: "parallel" as const, // https://github.com/davidkpiano/xstate/issues/965#issuecomment-579773494
        states: {
          fetchingRegistrationInfo: {
            initial: "fetching",
            states: {
              fetching: {
                // When we enter the "fetching" state, invoke the getRegistrationInfo service.
                // https://xstate.js.org/docs/guides/communication.html#quick-reference
                invoke: {
                  id: "getRegistrationInfo",
                  src: getRegistrationInfo,
                  onDone: {
                    target: "finished",
                    actions: assign({
                      registrationInfo: (
                        ctx,
                        event: {
                          data: { data: GetRegistrationInfoQuery };
                        }
                      ) => {
                        return event.data.data;
                      },
                      registrationSchema: (
                        ctx,
                        event: { data: { data: GetRegistrationInfoQuery } }
                      ) => {
                        return buildRegistrationSchema(event.data.data);
                      },
                    }),
                  },
                  onError: {
                    target: "#registration.error",
                    actions: assign({
                      loadingError: (ctx, event: { data: GraphQLError }) => {
                        return event.data.message;
                      },
                    }),
                  },
                },
              },
              finished: { type: "final" },
            },
          },
          minimumWait: {
            initial: "waiting",
            states: {
              waiting: {
                after: {
                  800: "finished",
                },
              },
              finished: { type: "final" },
            },
          },
        },
        onDone: "loaded",
      },
      loaded: {
        on: {
          SUBMIT_FORM: "submitting",
        },
      },
      error: {
        on: {
          RETRY: "loading",
        },
      },
      submitting: {
        invoke: {
          id: "submitting",
          src: submitRegistrationForm,
          onDone: {
            target: "#registration.complete",
            actions: assign({
              registrationResult: (ctx, event) => event.data.data,
            }),
          },
          onError: {
            target: "#registration.submissionError",
            actions: assign({
              registrationErrors: (ctx, event) => event.data.graphQLErrors,
            }),
          },
        },
      },
      submissionError: {
        on: {
          SUBMIT_FORM: "submitting",
        },
      },
      complete: {
        type: "final" as const,
      },
    },
  });

  return useMachine(registrationMachine);
}

/**
 * Using yup to build the Registration Schema
 * @link https://github.com/jquense/yup
 * @param registrationInfo
 */
function buildRegistrationSchema(
  registrationInfo: GetRegistrationInfoQuery
): Yup.ObjectSchema {
  return Yup.object().shape({
    tissues: Yup.array()
      .min(1)
      .of(
        Yup.object().shape({
          donorId: Yup.string().trim().required().label("Donor ID"),
          lifeStage: Yup.string()
            .oneOf(Object.values(LifeStage))
            .required()
            .label("Life Stage"),
          hmdmc: Yup.string()
            .oneOf(registrationInfo.hmdmcs.map((h) => h.hmdmc))
            .required()
            .label("HMDMC"),
          tissueType: Yup.string()
            .oneOf(registrationInfo.tissueTypes.map((tt) => tt.name))
            .required()
            .label("Tissue Type"),
          externalIdentifier: Yup.string()
            .trim()
            .required()
            .label("External Identifier"),
          blocks: Yup.array()
            .min(1)
            .of(
              Yup.object().shape({
                spatialLocation: Yup.number()
                  .integer()
                  .min(0)
                  .max(6)
                  .required()
                  .label("Spatial Location"),
                replicateNumber: Yup.number()
                  .integer()
                  .min(1)
                  .required()
                  .label("Replicate Number"),
                lastKnownSectionNumber: Yup.number()
                  .integer()
                  .min(1)
                  .required()
                  .label("Last Known Section Number"),
                labwareType: Yup.string()
                  .oneOf(registrationInfo.labwareTypes.map((lt) => lt.name))
                  .required()
                  .label("Labware Type"),
                medium: Yup.string()
                  .oneOf(registrationInfo.mediums.map((m) => m.name))
                  .optional()
                  .label("Medium"),
                mouldSize: Yup.string()
                  .oneOf(registrationInfo.mouldSizes.map((ms) => ms.name))
                  .optional()
                  .label("Mould Size"),
              })
            ),
        })
      ),
  });
}
