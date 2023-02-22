import React, { useMemo } from 'react';
import {
  GetRegistrationInfoQuery,
  LifeStage,
  RegisterOriginalSamplesMutationVariables,
  OriginalSampleData,
  LabwareFieldsFragment,
  SampleFieldsFragment,
  RegisterResultFieldsFragment
} from '../types/sdk';
import * as Yup from 'yup';
import RegistrationValidation from '../lib/validation/registrationValidation';
import { LabwareTypeName } from '../types/stan';
import { PartialBy } from '../lib/helpers';
import { RegistrationFormBlock, RegistrationFormTissue } from './BlockRegistration';
import Registration from './registration/Registration';
import { registerOriginalSamples } from '../lib/services/registrationService';
import { valueFromSamples } from '../components/dataTableColumns';
import { Column } from 'react-table';

/**Following modifications required for RegistrationFormBlock Type so that it can be reused
 - "medium" and "lastknownSectionNumber" fields are omitted
 - changed "externalIdentifier" and "replicateNumber" fields to optional
 **/
type RegistrationFormBlockSample = PartialBy<
  Omit<RegistrationFormBlock, 'medium' | 'lastKnownSectionNumber'>,
  'externalIdentifier' | 'replicateNumber'
> & {
  solution: string;
};

/**Redefine 'blocks' field in RegistrationFormTissue Type
 * Keeping 'blocks' field name as such so that components like "Registration' & 'RegistrationForm'
 * can be reused for Original sample registration as well
 */
type RegistrationFormOriginalSample = Omit<RegistrationFormTissue, 'blocks'> & {
  blocks: RegistrationFormBlockSample[];
};

export interface RegistrationFormOriginalSampleValues {
  tissues: Array<RegistrationFormOriginalSample>;
}
/**Data used to display in confirmation page**/
export type LabwareResultData = {
  labware: LabwareFieldsFragment;

  //Any information other than labware data
  extraData?: string[];
};

/**Define default values**/
export function getRegistrationFormSample(): RegistrationFormBlockSample {
  return {
    clientId: Date.now(),
    spatialLocation: -1, // Initialise it as invalid so user has to select something
    labwareType: '',
    fixative: '',
    solution: '',
    externalIdentifier: '',
    replicateNumber: ''
  };
}

export function getRegistrationFormTissueSample(): RegistrationFormOriginalSample {
  return {
    clientId: Date.now(),
    donorId: '',
    species: '',
    lifeStage: LifeStage.Fetal,
    hmdmc: '',
    tissueType: '',
    blocks: [getRegistrationFormSample()],
    sampleCollectionDate: ''
  };
}

function buildRegistrationSchema(registrationInfo: GetRegistrationInfoQuery) {
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
                solution: validation.solution
              })
            )
        })
      )
  });
}

interface RegistrationParams {
  registrationInfo: GetRegistrationInfoQuery;
}

function OriginalSampleRegistration({ registrationInfo }: RegistrationParams) {
  const validationSchema = useMemo(() => {
    return buildRegistrationSchema(registrationInfo);
  }, [registrationInfo]);
  const availableLabwareTypes = useMemo(() => {
    return registrationInfo.labwareTypes.filter((lt) => [LabwareTypeName.POT].includes(lt.name as LabwareTypeName));
  }, [registrationInfo]);

  /**
   * Builds the registerTissueSample mutation variables from the RegistrationFormTissueSampleValues
   * @param formValues
   * @return Promise<RegisterTissueSamplesMutationVariables> mutation variables wrapped in a promise
   */
  const buildOriginalSampleMutationVariables = React.useCallback(
    (formValues: RegistrationFormOriginalSampleValues): Promise<RegisterOriginalSamplesMutationVariables> => {
      const samples = formValues.tissues.reduce<OriginalSampleData[]>((memo, tissue) => {
        return [
          ...memo,
          ...tissue.blocks.map<OriginalSampleData>((block) => {
            const sampleRegisterData: OriginalSampleData = {
              species: tissue.species.trim(),
              donorIdentifier: tissue.donorId.trim(),
              externalIdentifier: block.externalIdentifier ? block.externalIdentifier.trim() : undefined,
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
                : undefined
            };

            return sampleRegisterData;
          })
        ];
      }, []);
      return new Promise((resolve) => {
        resolve({ request: { samples } });
      });
    },
    []
  );

  const resultColumns: Array<Column<LabwareResultData>> = React.useMemo(() => {
    return [
      {
        Header: 'Barcode',
        id: 'barcode',
        accessor: (result: LabwareResultData) => result.labware.barcode
      },
      {
        Header: 'Labware Type',
        id: 'labwareType',
        accessor: (result: LabwareResultData) => result.labware.labwareType.name
      },
      {
        Header: 'External ID',
        id: 'externalID',
        accessor: (result: LabwareResultData) =>
          valueFromSamples(result.labware, (sample: SampleFieldsFragment) => sample.tissue.externalName ?? '')
      },
      {
        Header: 'Donor ID',
        id: 'donorId',
        accessor: (result: LabwareResultData) =>
          valueFromSamples(result.labware, (sample: SampleFieldsFragment) => sample.tissue.donor.donorName ?? '')
      },
      {
        Header: 'Tissue type',
        id: 'tissueType',
        accessor: (result: LabwareResultData) =>
          valueFromSamples(
            result.labware,
            (sample: SampleFieldsFragment) => sample.tissue.spatialLocation.tissueType.name ?? ''
          )
      },
      {
        Header: 'Spatial location',
        id: 'spatialLocation',
        accessor: (result: LabwareResultData) =>
          valueFromSamples(result.labware, (sample: SampleFieldsFragment) => String(sample.tissue.spatialLocation.code))
      },
      {
        Header: 'Replicate',
        id: 'replicate',
        accessor: (result: LabwareResultData) =>
          valueFromSamples(result.labware, (sample: SampleFieldsFragment) => String(sample.tissue.replicate ?? ''))
      },
      {
        Header: 'Fixative',
        id: 'fixative',
        accessor: (result: LabwareResultData) =>
          result.labware.slots[0].samples.length > 0 ? result.labware.slots[0].samples[0].tissue.fixative.name : ''
      },
      {
        Header: 'Solution',
        id: 'solution',
        accessor: (result: LabwareResultData) =>
          result.extraData && result.extraData.length > 0 ? result.extraData[0] : ''
      }
    ];
  }, []);

  const formatSuccessData = React.useCallback((registerResult: RegisterResultFieldsFragment) => {
    return registerResult.labware.map((lw) => {
      return {
        labware: lw,
        extraData: [
          registerResult.labwareSolutions.find((lwSolution) => lwSolution?.barcode === lw.barcode)?.solutionName ?? ''
        ]
      };
    });
  }, []);

  /**These are changes required for labels in Registration page for Original sample registration
   * The changes are mapped here so that Registration and RegistrationForm components  can be reused **/
  const keywords = new Map()
    .set('Block', 'Sample')
    .set('Embedding', 'Solution')
    .set('Optional', ['Replicate Number', 'External Identifier']);

  return (
    <Registration<
      RegisterOriginalSamplesMutationVariables,
      RegistrationFormOriginalSample,
      RegistrationFormBlockSample,
      LabwareResultData
    >
      title={'Original Sample Registration'}
      availableLabwareTypes={availableLabwareTypes}
      registrationInfo={registrationInfo}
      defaultFormTissueValues={getRegistrationFormTissueSample()}
      buildRegistrationInput={buildOriginalSampleMutationVariables}
      registrationService={registerOriginalSamples}
      registrationValidationSchema={validationSchema}
      successDisplayTableColumns={resultColumns}
      keywordsMap={keywords}
      formatSuccessData={formatSuccessData}
    />
  );
}

export default OriginalSampleRegistration;
