import React, { useContext, useEffect, useRef } from 'react';
import AppShell from '../components/AppShell';
import RegistrationSuccess from './registration/RegistrationSuccess';
import { LabwareFieldsFragment } from '../types/sdk';
import { StanCoreContext } from '../lib/sdk';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import Heading from '../components/Heading';
import FileUploader from '../components/upload/FileUploader';
import { toast } from 'react-toastify';
import warningToast from '../components/notifications/WarningToast';
import { UploadResult } from '../components/upload/useUpload';
import * as sampleColumns from '../components/dataTableColumns/sampleColumns';
import { SampleDataTableRow } from '../components/dataTableColumns/sampleColumns';

export const SectionRegistration: React.FC = () => {
  const stanCore = useContext(StanCoreContext);

  const [fileRegisterResult, setFileRegisterResult] = React.useState<LabwareFieldsFragment[] | undefined>(undefined);

  const warningRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  /**Callback notification send from child after finishing upload**/
  const onFileUploadFinished = React.useCallback(
    (results: UploadResult<{ barcode: [] }>[]) => {
      if (results.length > 0) {
        const result = results[0].response;
        //Upload success, but no result, return
        if (result && 'barcodes' in result) {
          const barcodes: string[] = result['barcodes'] as string[];
          const labwarePromises = barcodes.map((barcode: string) => stanCore.FindLabware({ barcode }));
          //Retrieve details of newly registered labware
          Promise.all(labwarePromises)
            .then((labwares) => {
              setFileRegisterResult(labwares.map((labware) => labware.labware!) as LabwareFieldsFragment[]);
            })
            .catch(() => {
              warningToast({
                message: `Cannot retrieve details of newly registered labware ${barcodes.join(',')}.`,
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 5000
              });
            });
        }
      }
    },
    [setFileRegisterResult, stanCore]
  );

  if (fileRegisterResult) {
    const columnsToDisplay = [
      sampleColumns.barcode(),
      sampleColumns.labwareType(),
      sampleColumns.externalId(),
      sampleColumns.tissueType(),
      sampleColumns.sectionNumber()
    ];
    const samples: SampleDataTableRow[] = fileRegisterResult.flatMap((labware) => {
      return labware.slots.flatMap((slot) => {
        return slot.samples.map((sample) => {
          return {
            ...sample,
            barcode: labware.barcode,
            labwareType: labware.labwareType,
            slotAddress: slot.address
          };
        });
      });
    });
    return (
      <RegistrationSuccess
        successData={samples}
        columns={columnsToDisplay}
        labware={fileRegisterResult}
        isSectionRegistration={true}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Section Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <>
            <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
              <Heading level={4}>Register manually</Heading>
              <p className="my-3 mt-4 text-gray-800 text-sm leading-normal">Pick a type of labware to begin:</p>
              <div className="flex flex-row items-center justify-center gap-4">
                <CustomReactSelect
                  dataTestId="initialLabwareType"
                  options={[]}
                  className=" rounded-md md:w-1/2"
                  isDisabled={true}
                />
              </div>
            </div>
            <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
              <Heading level={4}>Register from file</Heading>
              <p className="my-3 text-gray-800 text-sm leading-normal">Select a file to upload: </p>
              <FileUploader
                url={'/register/section'}
                enableUpload={true}
                notifyUploadOutcome={onFileUploadFinished}
                errorField={'problems'}
              />
            </div>
          </>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default SectionRegistration;
