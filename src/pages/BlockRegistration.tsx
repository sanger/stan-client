import React, { useContext, useState } from 'react';
import { LabwareFieldsFragment, LifeStage } from '../types/sdk';
import columns from '../components/dataTableColumns/labwareColumns';
import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import { RadioButtonInput } from '../components/forms/RadioGroup';
import FileUploader from '../components/upload/FileUploader';
import { StanCoreContext } from '../lib/sdk';
import warningToast from '../components/notifications/WarningToast';
import { toast } from 'react-toastify';
import RegistrationSuccess from './registration/RegistrationSuccess';
import { UploadResult } from '../components/upload/useUpload';

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
  cellClass: string;
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

const displayWarningMsg = (msg: string) => {
  warningToast({
    message: msg,
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 5000
  });
};

function BlockRegistration() {
  const resultColumns = [columns.barcode(), columns.labwareType(), columns.externalName(), columns.tissueType()];
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

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Block Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
            <Heading level={4}>Register</Heading>

            <div className="my-4 p-4 rounded-md bg-white">
              <RadioButtonInput name="manual-registration-btn" label="Register manually" disabled={true} />
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
}

export default BlockRegistration;
