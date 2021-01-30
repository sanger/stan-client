import { Machine, MachineOptions, spawn, interpret } from "xstate";
import {
  RegistrationEvent,
  RegistrationContext,
  RegistrationSchema,
} from "./registrationMachineTypes";
import { assign } from "@xstate/immer";
import { extractServerErrors } from "../../../types/stan";
import { current } from "immer";
import { createLabelPrinterMachine } from "../labelPrinter/labelPrinterMachine";
import * as registrationService from "../../services/registrationService";
import { FormValues } from "../../services/registrationService";
import {
  BlockRegisterRequest,
  RegisterTissuesMutationVariables,
} from "../../../types/graphql";

export enum Actions {
  ASSIGN_LOADING_ERROR = "assignLoadingError",
  ASSIGN_REGISTRATION_RESULT = "assignRegistrationResult",
  ASSIGN_REGISTRATION_ERROR = "assignRegistrationError",
  SPAWN_LABEL_PRINTER = "spawnLabelPrinter",
}

export enum Services {
  SUBMIT = "submit",
}

export const registrationMachineOptions: Partial<MachineOptions<
  RegistrationContext,
  RegistrationEvent
>> = {
  actions: {
    [Actions.ASSIGN_REGISTRATION_RESULT]: assign((ctx, e) => {
      if (e.type !== "done.invoke.submitting" || !e.data.data) {
        return;
      }
      ctx.registrationResult = e.data.data;
    }),

    [Actions.ASSIGN_REGISTRATION_ERROR]: assign((ctx, e) => {
      if (e.type !== "error.platform.submitting") {
        return;
      }
      ctx.registrationErrors = extractServerErrors(e.data);
    }),

    [Actions.SPAWN_LABEL_PRINTER]: assign((ctx, _e) => {
      const currentCtx = current(ctx);
      ctx.labelPrinterRef = spawn(
        createLabelPrinterMachine({
          labwares: currentCtx.registrationResult.register.labware,
        })
      );
    }),
  },

  services: {
    [Services.SUBMIT]: (context, event) => {
      if (event.type !== "SUBMIT_FORM") {
        return Promise.reject();
      }
      return buildRegisterTissuesMutationVariables(event.values).then(
        registrationService.registerTissues
      );
    },
  },
};

/**
 * Builds the registerTissue mutation variables from the FormValues
 * @param formValues
 * @return Promise<RegisterTissuesMutationVariables> mutation variables wrapped in a promise
 */
function buildRegisterTissuesMutationVariables(
  formValues: FormValues
): Promise<RegisterTissuesMutationVariables> {
  return new Promise((resolve) => {
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

/**
 * XState state machine for Registration
 */
const registrationMachine = Machine<
  RegistrationContext,
  RegistrationSchema,
  RegistrationEvent
>(
  {
    id: "registration",
    initial: "ready" as const,
    states: {
      ready: {
        on: {
          SUBMIT_FORM: "submitting",
        },
      },
      submitting: {
        invoke: {
          id: "submitting",
          src: "submit",
          onDone: {
            target: "complete",
            actions: [Actions.ASSIGN_REGISTRATION_RESULT],
          },
          onError: {
            target: "submissionError",
            actions: Actions.ASSIGN_REGISTRATION_ERROR,
          },
        },
      },
      submissionError: {
        on: {
          SUBMIT_FORM: "submitting",
        },
      },
      complete: {
        entry: Actions.SPAWN_LABEL_PRINTER,
      },
    },
  },
  registrationMachineOptions
);

interpret(registrationMachine);

export default registrationMachine;
