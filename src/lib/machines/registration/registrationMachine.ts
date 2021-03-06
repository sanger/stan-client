import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { extractServerErrors, ServerErrors } from "../../../types/stan";
import * as registrationService from "../../services/registrationService";
import {
  BlockRegisterRequest,
  GetRegistrationInfoQuery,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../../types/sdk";
import { RegistrationFormValues } from "../../../pages/Registration";
import { ClientError } from "graphql-request";

/**
 * Builds the registerTissue mutation variables from the RegistrationFormValues
 * @param formValues
 * @param existingTissues list of tissue external names that the user has confirmed as pre-existing
 * @return Promise<RegisterTissuesMutationVariables> mutation variables wrapped in a promise
 */
export function buildRegisterTissuesMutationVariables(
  formValues: RegistrationFormValues,
  existingTissues: Array<string> = []
): Promise<RegisterTissuesMutationVariables> {
  return new Promise((resolve) => {
    const blocks = formValues.tissues.reduce<BlockRegisterRequest[]>(
      (memo, tissue) => {
        return [
          ...memo,
          ...tissue.blocks.map<BlockRegisterRequest>((block) => {
            const blockRegisterRequest: BlockRegisterRequest = {
              species: tissue.species.trim(),
              donorIdentifier: tissue.donorId.trim(),
              externalIdentifier: block.externalIdentifier.trim(),
              highestSection: block.lastKnownSectionNumber,
              hmdmc: tissue.hmdmc.trim(),
              labwareType: block.labwareType.trim(),
              lifeStage: tissue.lifeStage,
              tissueType: tissue.tissueType.trim(),
              spatialLocation: block.spatialLocation,
              replicateNumber: block.replicateNumber,
              fixative: block.fixative.trim(),
              medium: block.medium.trim(),
              mouldSize: block.mouldSize.trim(),
            };

            if (
              existingTissues.includes(blockRegisterRequest.externalIdentifier)
            ) {
              blockRegisterRequest.existingTissue = true;
            }

            return blockRegisterRequest;
          }),
        ];
      },
      []
    );

    resolve({ request: { blocks } });
  });
}

export interface RegistrationContext {
  registrationInfo: GetRegistrationInfoQuery;
  registrationResult: RegisterTissuesMutation;
  registrationErrors: ServerErrors;
  confirmedTissues: Array<string>;
}

type SubmitFormEvent = {
  type: "SUBMIT_FORM";
  values: RegistrationFormValues;
};

type EditSubmissionEvent = {
  type: "EDIT_SUBMISSION";
};

type SubmittingDoneEvent = {
  type: "done.invoke.submitting";
  data: RegisterTissuesMutation;
};

type SubmittingErrorEvent = {
  type: "error.platform.submitting";
  data: ClientError;
};

export type RegistrationEvent =
  | SubmitFormEvent
  | EditSubmissionEvent
  | SubmittingDoneEvent
  | SubmittingErrorEvent;

/**
 * XState state machine for Registration
 */
const registrationMachine = createMachine<
  RegistrationContext,
  RegistrationEvent
>(
  {
    id: "registration",
    initial: "ready",
    states: {
      ready: {
        entry: ["emptyConfirmedTissues"],
        on: {
          SUBMIT_FORM: "submitting",
        },
      },
      submitting: {
        invoke: {
          id: "submitting",
          src: "submit",
          onDone: {
            target: "checkSubmissionClashes",
            actions: ["assignRegistrationResult"],
          },
          onError: {
            target: "submissionError",
            actions: "assignRegistrationError",
          },
        },
      },
      checkSubmissionClashes: {
        always: [
          {
            cond: "isClash",
            target: "clashed",
          },
          {
            target: "complete",
          },
        ],
      },
      clashed: {
        on: {
          EDIT_SUBMISSION: "ready",
          SUBMIT_FORM: "submitting",
        },
      },
      submissionError: {
        on: {
          SUBMIT_FORM: "submitting",
        },
      },
      complete: {
        type: "final",
      },
    },
  },
  {
    actions: {
      emptyConfirmedTissues: assign((ctx) => (ctx.confirmedTissues = [])),

      assignRegistrationResult: assign((ctx, e) => {
        if (e.type !== "done.invoke.submitting" || !e.data) {
          return;
        }
        ctx.registrationResult = e.data;

        // Store the clashed tissues to be used for possible user confirmation
        ctx.confirmedTissues = ctx.registrationResult.register.clashes.map(
          (clash) => clash.tissue.externalName
        );
      }),

      assignRegistrationError: assign((ctx, e) => {
        if (e.type !== "error.platform.submitting") {
          return;
        }
        ctx.registrationErrors = extractServerErrors(e.data);
      }),
    },

    guards: {
      isClash: (ctx) => ctx.registrationResult.register.clashes.length > 0,
    },

    services: {
      submit: (context, event) => {
        if (event.type !== "SUBMIT_FORM") {
          return Promise.reject();
        }
        return buildRegisterTissuesMutationVariables(
          event.values,
          context.confirmedTissues
        ).then(registrationService.registerTissues);
      },
    },
  }
);

export default registrationMachine;
