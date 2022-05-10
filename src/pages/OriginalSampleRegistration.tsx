import React, { useMemo } from "react";
import {
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterTissueSamplesMutationVariables,
  SampleRegisterRequest,
} from "../types/sdk";
import * as Yup from "yup";
import RegistrationValidation from "../lib/validation/registrationValidation";
import { LabwareTypeName } from "../types/stan";
import { registerTissueSamples } from "../lib/services/registrationService";
import { PartialBy } from "../lib/helpers";
import {
  RegistrationFormBlock,
  RegistrationFormTissue,
} from "./BlockRegistration";
import Registration from "./registration/Registration";
import columns from "../components/dataTable/labwareColumns";

type RegistrationFormSample = PartialBy<
  Omit<RegistrationFormBlock, "medium" | "lastKnownSectionNumber">,
  "externalIdentifier" | "replicateNumber"
> & {
  solutionSample: string;
};
type RegistrationFormTissueSample = Omit<RegistrationFormTissue, "blocks"> & {
  blocks: RegistrationFormSample[];
};

export interface RegistrationFormTissueSampleValues {
  tissues: Array<RegistrationFormTissueSample>;
}

export function getRegistrationFormSample(): RegistrationFormSample {
  return {
    clientId: Date.now(),
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    labwareType: "",
    fixative: "",
    solutionSample: "",
  };
}

export function getRegistrationFormTissueSample(): RegistrationFormTissueSample {
  return {
    clientId: Date.now(),
    donorId: "",
    species: "",
    lifeStage: LifeStage.Fetal,
    hmdmc: "",
    tissueType: "",
    blocks: [getRegistrationFormSample()],
    sampleCollectionDate: "",
  };
}

function buildRegistrationSchema(
  registrationInfo: GetRegistrationInfoQuery
): Yup.ObjectSchema {
  const validation = new RegistrationValidation(registrationInfo, true);
  return Yup.object().shape({
    tissues: Yup.array()
      .min(1)
      .of(
        Yup.object().shape({
          donorId: validation.donorId,
          lifeStage: validation.lifeStage,
          species: validation.species,
          hmdmc: validation.hmdmc,
          tissueType: validation.tissueType,
          sampleCollectionDate: validation.sampleCollectionDate,
          blocks: Yup.array()
            .min(1)
            .of(
              Yup.object().shape({
                externalIdentifier: validation.externalIdentifier,
                spatialLocation: validation.spatialLocation,
                replicateNumber: validation.replicateNumber,
                labwareType: validation.labwareType,
                fixative: validation.fixative,
                solutionSample: validation.solutionSample,
              })
            ),
        })
      ),
  });
}

interface RegistrationParams {
  registrationInfo: GetRegistrationInfoQuery;
}

/**
 * Builds the registerTissueSample mutation variables from the RegistrationFormTissueSampleValues
 * @param formValues
 * @return Promise<RegisterTissueSamplesMutationVariables> mutation variables wrapped in a promise
 */
export function buildRegisterTissueSampleMutationVariables(
  formValues: RegistrationFormTissueSampleValues
): Promise<RegisterTissueSamplesMutationVariables> {
  return new Promise((resolve) => {
    const samples = formValues.tissues.reduce<SampleRegisterRequest[]>(
      (memo, tissue) => {
        return [
          ...memo,
          ...tissue.blocks.map<SampleRegisterRequest>((block) => {
            const sampleRegisterRequest: SampleRegisterRequest = {
              species: tissue.species.trim(),
              donorIdentifier: tissue.donorId.trim(),
              externalIdentifier: block.externalIdentifier
                ? block.externalIdentifier.trim()
                : undefined,
              hmdmc: tissue.hmdmc.trim(),
              labwareType: block.labwareType.trim(),
              lifeStage: tissue.lifeStage,
              tissueType: tissue.tissueType.trim(),
              spatialLocation: block.spatialLocation,
              replicateNumber: block.replicateNumber ?? undefined,
              fixative: block.fixative.trim(),
              solutionSample: block.solutionSample.trim(),
              sampleCollectionDate: tissue.sampleCollectionDate
                ? tissue.sampleCollectionDate instanceof Date
                  ? tissue.sampleCollectionDate.toLocaleDateString()
                  : tissue.sampleCollectionDate
                : undefined,
            };

            return sampleRegisterRequest;
          }),
        ];
      },
      []
    );

    resolve({ request: { samples } });
  });
}

function OriginalSampleRegistration({ registrationInfo }: RegistrationParams) {
  const validationSchema = useMemo(() => {
    return buildRegistrationSchema(registrationInfo);
  }, [registrationInfo]);
  const availableLabwareTypes = useMemo(() => {
    return registrationInfo.labwareTypes.filter((lt) =>
      [LabwareTypeName.POT].includes(lt.name as LabwareTypeName)
    );
  }, [registrationInfo]);

  const resultColumns = [
    columns.barcode(),
    columns.labwareType(),
    columns.externalName(),
  ];

  const keywords = new Map()
    .set("Block", "Sample")
    .set("Embedding", "Solution");
  return (
    <Registration<
      RegisterTissueSamplesMutationVariables,
      RegistrationFormTissueSample,
      RegistrationFormSample
    >
      title={"Original Sample Registration"}
      availableLabwareTypes={availableLabwareTypes}
      registrationInfo={registrationInfo}
      defaultFormTissueValues={getRegistrationFormTissueSample()}
      buildRegistrationInput={buildRegisterTissueSampleMutationVariables}
      registrationService={registerTissueSamples}
      registrationValidationSchema={validationSchema}
      successDisplayTableColumns={resultColumns}
      keywordsMap={keywords}
    />
  );
}

export default OriginalSampleRegistration;
