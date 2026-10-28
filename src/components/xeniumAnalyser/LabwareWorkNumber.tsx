import React from 'react';
import { useFormikContext } from 'formik';
import { Link } from 'react-router-dom';
import WorkNumberSelect from '../WorkNumberSelect';
import { FormikErrorMessage } from '../forms';
import { hasUploadedFilesInSgpFolder } from '../../lib/services/fileService';
import { reIndexAndRenameRegions } from './RegionDefiner';
import { RegionDefinerFormValues } from './analyser.types';

type LabwareWorkNumberProps = {
  labwareIndex: number;
};

const LabwareWorkNumber = ({ labwareIndex }: LabwareWorkNumberProps) => {
  const { values, setValues } = useFormikContext<RegionDefinerFormValues>();
  const analyserLabware = values.labware[labwareIndex];

  return (
    <div>
      <label>SGP Number</label>
      <WorkNumberSelect
        name={`labware.${labwareIndex}.workNumber`}
        dataTestId={`${analyserLabware.labware.barcode}-workNumber`}
        onWorkNumberChange={async (_workNumber) => {
          const workNumber = _workNumber.trim();
          const hasSgpNumberLink = workNumber.length > 0 ? await hasUploadedFilesInSgpFolder(workNumber) : false;
          await setValues((prev) => ({
            ...prev,
            labware: prev.labware.map((lw, index) =>
              index !== labwareIndex
                ? lw
                : {
                    ...lw,
                    workNumber,
                    hasSgpNumberLink,
                    regions: reIndexAndRenameRegions(lw.regions, prev.runName, lw.labware.barcode)
                  }
            )
          }));
        }}
        workNumber={analyserLabware.workNumber}
        requiredField={true}
      />
      {analyserLabware.hasSgpNumberLink && (
        <div className="mt-5 flex-row whitespace-nowrap" data-testid="sgp-folder-link">
          <Link
            className="text-indigo-800 hover:text-indigo-900 active:text-indigo-950 font-semibold hover:underline"
            to={`/file_manager?workNumber=${analyserLabware.workNumber}`}
            target="_blank"
          >
            {`${analyserLabware.workNumber} Folder Link`}
          </Link>
        </div>
      )}
      <FormikErrorMessage name={`labware.${labwareIndex}.workNumber`} />
    </div>
  );
};

export default LabwareWorkNumber;
