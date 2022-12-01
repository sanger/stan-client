import React, { useMemo } from 'react';
import {
  BlockRegisterRequest,
  GetRegistrationInfoQuery,
  LabwareFieldsFragment,
  LifeStage,
  RegisterTissuesMutationVariables
} from '../types/sdk';
import * as Yup from 'yup';
import RegistrationValidation from '../lib/validation/registrationValidation';
import columns from '../components/dataTableColumns/labwareColumns';
import { LabwareTypeName } from '../types/stan';
import * as registrationService from '../lib/services/registrationService';
import Registration from './registration/Registration';

export interface RegistrationFormBlock {
  clientId: number;
  externalIdentifier: string;
  spatialLocation: number;
  replicateNumber: string;
  lastKnownSectionNumber: number;
  labwareType: string;
  fixative: string;
  medium: string;
}

export interface RegistrationFormTissue {
  clientId: number;
  donorId: string;
  lifeStage: LifeStage;
  species: string;
  hmdmc: string;
  tissueType: string;
  sampleCollectionDate?: Date | string;
  blocks: RegistrationFormBlock[];
}

export interface RegistrationFormValues {
  tissues: Array<RegistrationFormTissue>;
}
function getRegistrationFormBlock(): RegistrationFormBlock {
  return {
    clientId: Date.now(),
    externalIdentifier: '',
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    replicateNumber: '',
    lastKnownSectionNumber: 0,
    labwareType: '',
    fixative: '',
    medium: ''
  };
}

function getRegistrationFormTissue(): RegistrationFormTissue {
  return {
    clientId: Date.now(),
    donorId: '',
    species: '',
    lifeStage: LifeStage.Fetal,
    hmdmc: '',
    tissueType: '',
    blocks: [getRegistrationFormBlock()],
    sampleCollectionDate: ''
  };
}

function buildRegistrationSchema(registrationInfo: GetRegistrationInfoQuery) {
  const validation = new RegistrationValidation(registrationInfo);
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
                lastKnownSectionNumber: validation.lastKnownSectionNumber,
                labwareType: validation.labwareType,
                fixative: validation.fixative,
                medium: validation.medium
              })
            )
        })
      )
  });
}

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
    const blocks = formValues.tissues.reduce<BlockRegisterRequest[]>((memo, tissue) => {
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
            sampleCollectionDate: tissue.sampleCollectionDate
              ? tissue.sampleCollectionDate instanceof Date
                ? tissue.sampleCollectionDate.toLocaleDateString()
                : tissue.sampleCollectionDate
              : undefined
          };

          if (existingTissues.includes(blockRegisterRequest.externalIdentifier)) {
            blockRegisterRequest.existingTissue = true;
          }

          return blockRegisterRequest;
        })
      ];
    }, []);

    resolve({ request: { blocks, workNumbers: [] } });
  });
}

interface RegistrationParams {
  registrationInfo: GetRegistrationInfoQuery;
}

function BlockRegistration({ registrationInfo }: RegistrationParams) {
  const resultColumns = [columns.barcode(), columns.labwareType(), columns.externalName()];
  const validationSchema = useMemo(() => {
    return buildRegistrationSchema(registrationInfo);
  }, [registrationInfo]);

  const availableLabwareTypes = useMemo(() => {
    return registrationInfo.labwareTypes.filter((lt) =>
      [LabwareTypeName.PROVIASETTE, LabwareTypeName.CASSETTE].includes(lt.name as LabwareTypeName)
    );
  }, [registrationInfo]);

  return (
    <Registration<
      RegisterTissuesMutationVariables,
      RegistrationFormTissue,
      RegistrationFormBlock,
      LabwareFieldsFragment
    >
      title={'Block Registration'}
      availableLabwareTypes={availableLabwareTypes}
      registrationInfo={registrationInfo}
      defaultFormTissueValues={getRegistrationFormTissue()}
      buildRegistrationInput={buildRegisterTissuesMutationVariables}
      registrationService={registrationService.registerTissues}
      registrationValidationSchema={validationSchema}
      successDisplayTableColumns={resultColumns}
      formatSuccessData={(registrationResult) => registrationResult.labware}
    />
  );
}

export default BlockRegistration;
