import {
  BlockRegisterRequest,
  GetRegistrationInfoDocument,
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterSectionsDocument,
  RegisterSectionsMutation,
  RegisterSectionsMutationVariables,
  RegisterTissuesDocument,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
  SectionRegisterRequest,
} from "../../types/graphql";
import client from "../client";
import {
  buildRegistrationMachine,
  buildSlideRegistrationMachine,
} from "../factories/machineFactory";
import { RegistrationMachine } from "../machines/registration/registrationMachineTypes";
import { SlideRegistrationMachine } from "../machines/slideRegistration/slideRegistrationMachineTypes";

/**
 * Gets the information for registration, then builds a {@link RegistrationMachine} from it
 */
export async function getRegistrationMachine(): Promise<RegistrationMachine> {
  const registrationInfo = await getRegistrationInfo();
  return buildRegistrationMachine(registrationInfo);
}

/**
 * Gets the information for slide registration, then buidls a {@link SlideRegistrationMachine}
 */
export async function getSlideRegistrationMachine(): Promise<
  SlideRegistrationMachine
> {
  const registrationInfo = await getRegistrationInfo();
  return buildSlideRegistrationMachine(registrationInfo);
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
 * Calls the registerSections GraphQL mutation
 * @param request variables for the registration
 */
export async function registerSections(request: SectionRegisterRequest) {
  const response = await client.mutate<
    RegisterSectionsMutation,
    RegisterSectionsMutationVariables
  >({
    mutation: RegisterSectionsDocument,
    variables: { request },
  });

  return response.data;
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

/**
 * Builds the registerTissue mutation variables from the FormValues
 * @param formValues
 * @return Promise<RegisterTissuesMutationVariables> mutation variables wrapped in a promise
 */
export function buildRegisterTissuesMutationVariables(
  formValues: FormValues
): Promise<RegisterTissuesMutationVariables> {
  return new Promise((resolve) => {
    const blocks = formValues.tissues.reduce<BlockRegisterRequest[]>(
      (memo, tissue) => {
        return [
          ...memo,
          ...tissue.blocks.map<BlockRegisterRequest>((block) => {
            return {
              species: tissue.species,
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
