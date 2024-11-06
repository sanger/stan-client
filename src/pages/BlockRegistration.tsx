import React, { useContext, useMemo, useState } from 'react';
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
import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import { RadioButtonInput } from '../components/forms/RadioGroup';
import FileUploader from '../components/upload/FileUploader';
import { StanCoreContext } from '../lib/sdk';
import warningToast from '../components/notifications/WarningToast';
import { toast } from 'react-toastify';
import RegistrationSuccess from './registration/RegistrationSuccess';
import { UploadResult } from '../components/upload/useUpload';
import { useLoaderData } from 'react-router-dom';

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
  workNumber: string;
  bioRiskCode: string;
}

export interface RegistrationFormValues {
  tissues: Array<RegistrationFormTissue>;
  workNumbers: Array<string>;
}

export enum RegistrationMethod {
  MANUAL,
  UPLOAD_FILE,
  NONE
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

export function getRegistrationFormTissue(): RegistrationFormTissue {
  return {
    clientId: Date.now(),
    donorId: '',
    species: '',
    lifeStage: LifeStage.Adult,
    hmdmc: '',
    tissueType: '',
    blocks: [getRegistrationFormBlock()],
    sampleCollectionDate: '',
    workNumber: '',
    bioRiskCode: ''
  };
}

function buildRegistrationSchema(registrationInfo: GetRegistrationInfoQuery) {
  const validation = new RegistrationValidation(registrationInfo);
  return Yup.object().shape({
    workNumbers: Yup.array().min(1, 'At least one work number must be selected'),
    tissues: Yup.array()
      .min(1)
      .of(
        Yup.object().shape({
          donorId: validation.donorId,
          lifeStage: validation.lifeStage,
          species: validation.species,
          hmdmc: validation.hmdmc,
          tissueType: validation.tissueType,
          bioRiskCode: validation.bioRiskCode,
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
  existingTissues: Array<string> = [],
  ignoreExistingTissues: boolean = false
): Promise<RegisterTissuesMutationVariables> {
  return new Promise((resolve, reject) => {
    let blocks = formValues.tissues.reduce<BlockRegisterRequest[]>((memo, tissue) => {
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
            lifeStage: Object.values(LifeStage).includes(tissue.lifeStage) ? tissue.lifeStage : undefined,
            tissueType: tissue.tissueType.trim(),
            spatialLocation: block.spatialLocation,
            replicateNumber: block.replicateNumber,
            fixative: block.fixative.trim(),
            medium: block.medium.trim(),
            sampleCollectionDate: tissue.sampleCollectionDate
              ? tissue.sampleCollectionDate instanceof Date
                ? tissue.sampleCollectionDate.toLocaleDateString()
                : tissue.sampleCollectionDate
              : undefined,
            bioRiskCode: tissue.bioRiskCode
          };

          if (!ignoreExistingTissues && existingTissues.includes(blockRegisterRequest.externalIdentifier)) {
            blockRegisterRequest.existingTissue = true;
          }

          return blockRegisterRequest;
        })
      ];
    }, []);

    if (ignoreExistingTissues) {
      blocks = blocks.filter((block) => !existingTissues.includes(block.externalIdentifier));
    }
    if (blocks.length === 0) {
      reject({ problems: ['No blocks to register after filtering the ones with existing tissues'] });
    }
    resolve({ request: { blocks, workNumbers: formValues.workNumbers } });
  });
}

const displayWarningMsg = (msg: string) => {
  warningToast({
    message: msg,
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 5000
  });
};

function BlockRegistration() {
  const registrationInfo = useLoaderData() as GetRegistrationInfoQuery;
  const resultColumns = [columns.barcode(), columns.labwareType(), columns.externalName(), columns.tissueType()];
  const validationSchema = useMemo(() => {
    return buildRegistrationSchema(registrationInfo);
  }, [registrationInfo]);

  const availableLabwareTypes = useMemo(() => {
    return registrationInfo.labwareTypes.filter((lt) =>
      [LabwareTypeName.PROVIASETTE, LabwareTypeName.CASSETTE].includes(lt.name as LabwareTypeName)
    );
  }, [registrationInfo]);

  const [selectedRegistrationMethod, setSelectedRegistrationMethod] = useState(RegistrationMethod.NONE);
  const stanCore = useContext(StanCoreContext);
  const [fileRegisterResult, setFileRegisterResult] = React.useState<LabwareFieldsFragment[] | undefined>(undefined);
  const onFileUploadFinished = React.useCallback(
    (results: UploadResult<{ barcode: [] }>[]) => {
      if (results.length > 0) {
        const result = results[0].response;
        if (result && 'barcodes' in result) {
          const barcodes: string[] = result['barcodes'] as string[];
          const labwarePromises = barcodes.map((barcode: string) => stanCore.FindLabware({ barcode }));
          Promise.all(labwarePromises)
            .then((labwares) => {
              if (labwares.length > 0) {
                setFileRegisterResult(labwares.map((labware) => labware.labware!) as LabwareFieldsFragment[]);
              } else {
                displayWarningMsg(`No block has been registered. Please check your file.`);
              }
            })
            .catch(() => {
              displayWarningMsg('Cannot retrieve details of newly registered block(s).');
            });
        }
      }
    },
    [setFileRegisterResult, stanCore]
  );
  if (fileRegisterResult && fileRegisterResult.length > 0) {
    return (
      <RegistrationSuccess successData={fileRegisterResult} columns={resultColumns} labware={fileRegisterResult} />
    );
  }

  const ManualRegistrationForm = (
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
      isBlock={true}
      withBioRisOption={true}
    />
  );

  const BlockRegistrationLandinPage = (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Block Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
            <Heading level={4}>Register</Heading>

            <div className="my-4 p-4 rounded-md bg-white">
              <RadioButtonInput
                name="manual-registration-btn"
                checked={selectedRegistrationMethod === RegistrationMethod.MANUAL}
                onChange={() => setSelectedRegistrationMethod(RegistrationMethod.MANUAL)}
                label="Register manually"
              />
            </div>
            <div className="my-4 p-4 rounded-md bg-white">
              <RadioButtonInput
                name="file-registration-btn"
                checked={selectedRegistrationMethod === RegistrationMethod.UPLOAD_FILE}
                onChange={() => setSelectedRegistrationMethod(RegistrationMethod.UPLOAD_FILE)}
                label="Register from file"
              />
              {selectedRegistrationMethod === RegistrationMethod.UPLOAD_FILE && (
                <FileUploader
                  url={'/register/block'}
                  enableUpload={true}
                  notifyUploadOutcome={onFileUploadFinished}
                  errorField={'problems'}
                />
              )}
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );

  return selectedRegistrationMethod === RegistrationMethod.MANUAL
    ? ManualRegistrationForm
    : BlockRegistrationLandinPage;
}

export default BlockRegistration;
