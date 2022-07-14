import React, { useMemo } from "react";
import {
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterOriginalSamplesMutationVariables,
  OriginalSampleData,
} from "../types/sdk";
import * as Yup from "yup";
import RegistrationValidation from "../lib/validation/registrationValidation";
import { LabwareTypeName } from "../types/stan";
import { PartialBy } from "../lib/helpers";
import {
  RegistrationFormBlock,
  RegistrationFormTissue,
} from "./BlockRegistration";
import Registration from "./registration/Registration";
import columns from "../components/dataTable/labwareColumns";
import { registerOriginalSamples } from "../lib/services/registrationService";

/**Following modifications required for RegistrationFormBlock Type so that it can be reused
 - "medium" and "lastknownSectionNumber" fields are omitted
 - changed "externalIdentifier" and "replicateNumber" fields to optional
 **/
type RegistrationFormBlockSample = PartialBy<
  Omit<RegistrationFormBlock, "medium" | "lastKnownSectionNumber">,
  "externalIdentifier" | "replicateNumber"
> & {
  solution: string;
};

/**Redefine 'blocks' field in RegistrationFormTissue Type
 * Keeping 'blocks' field name as such so that components like "Registration' & 'RegistrationForm'
 * can be reused for Original sample registration as well
 */
type RegistrationFormOriginalSample = Omit<RegistrationFormTissue, "blocks"> & {
  blocks: RegistrationFormBlockSample[];
};

export interface RegistrationFormOriginalSampleValues {
  tissues: Array<RegistrationFormOriginalSample>;
}

/**Define default values**/
export function getRegistrationFormSample(): RegistrationFormBlockSample {
  return {
    clientId: Date.now(),
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    labwareType: "",
    fixative: "",
    solution: "",
    externalIdentifier: "",
    replicateNumber: "",
  };
}

export function getRegistrationFormTissueSample(): RegistrationFormOriginalSample {
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
                solution: validation.solution,
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
export function buildOriginalSampleMutationVariables(
  formValues: RegistrationFormOriginalSampleValues
): Promise<RegisterOriginalSamplesMutationVariables> {
  return new Promise((resolve) => {
    const samples = formValues.tissues.reduce<OriginalSampleData[]>(
      (memo, tissue) => {
        return [
          ...memo,
          ...tissue.blocks.map<OriginalSampleData>((block) => {
            const sampleRegisterData: OriginalSampleData = {
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
              solution: block.solution.trim(),
              sampleCollectionDate: tissue.sampleCollectionDate
                ? tissue.sampleCollectionDate instanceof Date
                  ? tissue.sampleCollectionDate.toLocaleDateString()
                  : tissue.sampleCollectionDate
                : undefined,
            };

            return sampleRegisterData;
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

  /**These are changes required for labels in Registration page for Original sample registration
   * The changes are mapped here so that Registration and RegistrationForm components  can be reused **/
  const keywords = new Map()
    .set("Block", "Sample")
    .set("Embedding", "Solution")
    .set("Optional", ["Replicate Number", "External Identifier"]);
  return (
    <Registration<
      RegisterOriginalSamplesMutationVariables,
      RegistrationFormOriginalSample,
      RegistrationFormBlockSample
    >
      title={"Original Sample Registration"}
      availableLabwareTypes={availableLabwareTypes}
      registrationInfo={registrationInfo}
      defaultFormTissueValues={getRegistrationFormTissueSample()}
      buildRegistrationInput={buildOriginalSampleMutationVariables}
      registrationService={registerOriginalSamples}
      registrationValidationSchema={validationSchema}
      successDisplayTableColumns={resultColumns}
      keywordsMap={keywords}
    />
  );
}

export default OriginalSampleRegistration;
