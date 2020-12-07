import * as Yup from "yup";
import { assign, Machine } from "xstate";
import {
  BlockRegisterRequest,
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../types/graphql";
import { GraphQLError } from "graphql";
import { FormValues } from "../../pages/registration/RegistrationForm";
import registrationService from "../services/registrationService";
import { getGraphQLProblems, GraphQLProblems } from "../client";

export interface RegistrationContext {
  loadingError: string;
  registrationInfo: GetRegistrationInfoQuery;
  registrationSchema: Yup.ObjectSchema;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: GraphQLProblems;
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

type RetryEvent = { type: "RETRY" };
type SubmitFormEvent = { type: "SUBMIT_FORM"; values: FormValues };

export type RegistrationEvent = RetryEvent | SubmitFormEvent;

/**
 * XState state machine for Registration
 */
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
                src: registrationService.getRegistrationInfo,
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
                500: "finished",
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
        src: (ctx: RegistrationContext, event: RegistrationEvent) => {
          if (event.type !== "SUBMIT_FORM") {
            return Promise.reject();
          }
          return buildRegisterTissuesMutationVariables(event.values).then(
            registrationService.registerTissues
          );
        },
        onDone: {
          target: "#registration.complete",
          actions: assign({
            registrationResult: (ctx, event) => event.data.data,
          }),
        },
        onError: {
          target: "#registration.submissionError",
          actions: assign({
            registrationErrors: (ctx, event) =>
              getGraphQLProblems(event.data.graphQLErrors),
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

export default registrationMachine;

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
          donorId: Yup.string()
            .matches(
              /^[a-z0-9-_]+$/i,
              "Donor ID contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted"
            )
            .trim()
            .required()
            .label("Donor ID"),
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
          blocks: Yup.array()
            .min(1)
            .of(
              Yup.object().shape({
                externalIdentifier: Yup.string()
                  .trim()
                  .matches(
                    /^[a-z0-9-_]+$/i,
                    "External Identifier contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted"
                  )
                  .required()
                  .label("External Identifier"),
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
                  .min(0)
                  .required()
                  .label("Last Known Section Number"),
                labwareType: Yup.string()
                  .oneOf(registrationInfo.labwareTypes.map((lt) => lt.name))
                  .required()
                  .label("Labware Type"),
                fixative: Yup.string()
                  .oneOf(
                    registrationInfo.fixatives.map((fixative) => fixative.name)
                  )
                  .required()
                  .label("Fixative"),
                medium: Yup.string()
                  .oneOf(registrationInfo.mediums.map((m) => m.name))
                  .required()
                  .label("Medium"),
                mouldSize: Yup.string()
                  .oneOf(registrationInfo.mouldSizes.map((ms) => ms.name))
                  .required()
                  .label("Mould Size"),
              })
            ),
        })
      ),
  });
}

/**
 * Builds the registerTissue mutation variables from the FormValues
 * @param formValues
 * @return Promise<RegisterTissuesMutationVariables> mutation variables wrapped in a promise
 */
function buildRegisterTissuesMutationVariables(
  formValues: FormValues
): Promise<RegisterTissuesMutationVariables> {
  return new Promise((resolve, reject) => {
    const blocks = formValues.tissues.reduce<BlockRegisterRequest[]>(
      (memo, tissue) => {
        return [
          ...memo,
          ...tissue.blocks.map<BlockRegisterRequest>((block) => {
            return {
              donorIdentifier: tissue.donorId,
              externalIdentifier: block.externalIdentifier,
              highestSection: block.lastKnownSectionNumber,
              hmdmc: tissue.hmdmc,
              labwareType: block.labwareType,
              lifeStage: tissue.lifeStage,
              tissueType: tissue.tissueType,
              spatialLocation: block.spatialLocation,
              replicateNumber: block.replicateNumber,
              fixative: block.fixative,
              medium: block.medium,
              mouldSize: block.mouldSize,
            };
          }),
        ];
      },
      []
    );

    resolve({ request: { blocks } });
  });
}
