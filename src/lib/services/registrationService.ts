import {
  GetRegistrationInfoDocument,
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../types/graphql";
import client from "../client";
import * as Yup from "yup";
import { buildRegistrationMachine } from "../factories/machineFactory";
import { RegistrationMachine } from "../machines/registration/registrationMachineTypes";

/**
 * Gets the information for registration, then builds a {@link RegistrationMachine} from it
 */
export async function getRegistrationMachine(): Promise<RegistrationMachine> {
  const registrationInfo = await getRegistrationInfo();
  return buildRegistrationMachine(registrationInfo);
}

/**
 * Gets all the information necessary for Registration
 */
export async function getRegistrationInfo(): Promise<GetRegistrationInfoQuery> {
  const response = await client.query({ query: GetRegistrationInfoDocument });
  return response.data;
}

/**
 * Calls the register GraphQL mutation
 * @param mutationVariables
 */
export function registerTissues(
  mutationVariables: RegisterTissuesMutationVariables
) {
  return client.mutate<
    RegisterTissuesMutation,
    RegisterTissuesMutationVariables
  >({
    mutation: RegisterTissuesDocument,
    variables: mutationVariables,
  });
}

/**
 * Using yup to build the Registration Schema
 * @link https://github.com/jquense/yup
 * @param registrationInfo
 */
export function buildRegistrationSchema(
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
          species: Yup.string()
            .oneOf(registrationInfo.species.map((s) => s.name))
            .required()
            .label("Species"),
          hmdmc: Yup.string().when("species", {
            is: "Human",
            then: Yup.string()
              .oneOf(registrationInfo.hmdmcs.map((h) => h.hmdmc))
              .required()
              .label("HMDMC"),
            otherwise: Yup.string().length(0),
          }),
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

export interface FormBlockValues {
  clientId: number;
  externalIdentifier: string;
  spatialLocation: number;
  replicateNumber: number;
  lastKnownSectionNumber: number;
  labwareType: string;
  fixative: string;
  medium: string;
  mouldSize: string;
}

export interface FormTissueValues {
  clientId: number;
  donorId: string;
  lifeStage: LifeStage;
  species: string;
  hmdmc: string;
  tissueType: string;
  blocks: FormBlockValues[];
}

export interface FormValues {
  tissues: FormTissueValues[];
}

export function getInitialBlockValues(): FormBlockValues {
  return {
    clientId: Date.now(),
    externalIdentifier: "",
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    replicateNumber: 0,
    lastKnownSectionNumber: 0,
    labwareType: "",
    fixative: "",
    medium: "",
    mouldSize: "",
  };
}

export function getInitialTissueValues(): FormTissueValues {
  return {
    clientId: Date.now(),
    donorId: "",
    species: "",
    lifeStage: LifeStage.Fetal,
    hmdmc: "",
    tissueType: "",
    blocks: [getInitialBlockValues()],
  };
}
