import { MachineOptions } from "xstate";
import { RegistrationContext } from "./registrationContext";
import { RegistrationEvent } from "./registrationEvents";
import {
  BlockRegisterRequest,
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterTissuesMutationVariables,
} from "../../../types/graphql";
import * as Yup from "yup";
import { assign } from "@xstate/immer";
import { FormValues } from "../../../pages/registration/RegistrationForm";
import { extractServerErrors, LabwareTypeName } from "../../../types/stan";
import registrationService from "../../services/registrationService";
import { createMinimumWaitService } from "../index";

export enum Actions {
  ASSIGN_REGISTRATION_INFO = "assignRegistrationInfo",
  ASSIGN_LOADING_ERROR = "assignLoadingError",
  ASSIGN_REGISTRATION_RESULT = "assignRegistrationResult",
  ASSIGN_REGISTRATION_ERROR = "assignRegistrationError",
}

export enum Services {
  GET_REGISTRATION_INFO = "getRegistrationInfo",
  SUBMIT = "submit",
}

export const registrationMachineOptions: Partial<MachineOptions<
  RegistrationContext,
  RegistrationEvent
>> = {
  actions: {
    [Actions.ASSIGN_REGISTRATION_INFO]: assign((ctx, e) => {
      if (e.type !== "done.invoke.getRegistrationInfo" || !e.data.data) {
        return;
      }
      const registrationInfo = e.data.data;

      // Filter down the available labware types.
      ctx.registrationInfo = {
        ...registrationInfo,
        labwareTypes: registrationInfo.labwareTypes.filter(
          (lt) => lt.name === LabwareTypeName.PROVIASETTE
        ),
      };
      ctx.registrationSchema = buildRegistrationSchema(ctx.registrationInfo);
    }),

    [Actions.ASSIGN_LOADING_ERROR]: assign((ctx, e) => {
      if (e.type !== "error.platform") {
        return;
      }
      ctx.loadingError = e.data.message;
    }),

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
  },
  services: {
    [Services.GET_REGISTRATION_INFO]: () =>
      createMinimumWaitService(300, registrationService.getRegistrationInfo),

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
