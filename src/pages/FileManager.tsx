import React from 'react';
import AppShell from '../components/AppShell';
import { motion } from '../dependencies/motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import WorkNumberSelect, { WorkInfo } from '../components/WorkNumberSelect';
import { parseQueryString } from '../lib/helpers';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import FileUploader, { ConfirmUploadProps } from '../components/upload/FileUploader';
import { FileFieldsFragment, WorkStatus } from '../types/sdk';
import DataTable from '../components/DataTable';
import { CellProps, Column } from 'react-table';
import WhiteButton from '../components/buttons/WhiteButton';
import DownloadIcon from '../components/icons/DownloadIcon';
import { toast } from 'react-toastify';
import Success from '../components/notifications/Success';
import { findUploadedFiles } from '../lib/services/fileService';
import Label from '../components/forms/Label';
import { Input } from '../components/forms/Input';
import Warning from '../components/notifications/Warning';
import { UploadResult } from '../components/upload/useUpload';

export type FileManagerProps = {
  /**Display upload option?**/
  showUpload?: boolean;
};

/**Component to render File Manager page
 * Supports both /file_manager and /file_viewer urls
 * /file_manager is only for authenticated users and /file_viewer is for non-auth users (only view files without upload option)
 * If the work number selected in active, upload option will be active. Otherwise,upload will be disabled
 ***/
const FileManager: React.FC<FileManagerProps> = ({ showUpload = true }: FileManagerProps) => {
  /**All work number information**/
  const [currentWorkInfoOptions, setCurrentWorkInfoOptions] = React.useState<WorkInfo[]>([]);
  /**Only active work numbers required?**/
  const [isOnlyActiveWorkNumbers, setIsOnlyActiveWorkNumbers] = React.useState(false);
  /**Uploaded files for the selected work**/
  const [uploadedFilesForWorkNumber, setUploadedFilesForWorkNumber] = React.useState<FileFieldsFragment[]>([]);
  const location = useLocation();
  /**
   * Success notification when file is uploaded
   */
  const ToastSuccess = (fileName: string) => <Success message={`${fileName} uploaded successfully.`} />;

  const navigate = useNavigate();
  /**Work Info about all work numbers  **/
  const workInfo = useLoaderData() as WorkInfo[];

  /**Update work numbers when ever query string in location changes **/
  const memoAllSelectedWork = React.useMemo(() => {
    const queryString = parseQueryString(location.search);
    //There are multiple work numbers
    if (Array.isArray(queryString['workNumber'])) {
      const workNumbers: string[] = [];
      queryString['workNumber'].forEach((workNumber) => {
        if (workNumber) {
          workNumbers.push(decodeURIComponent(workNumber));
        }
      });
      return workInfo.filter((work) => workNumbers.some((workNumber) => work.workNumber === workNumber));
    }
    //Single work number
    if (typeof queryString['workNumber'] === 'string') {
      const workNumber = decodeURIComponent(queryString['workNumber']);
      return workInfo.filter((workInfo) => workInfo.workNumber === workNumber);
    }
    return [];
  }, [location.search, workInfo]);

  /**The 'active' checkbox need to be unchecked if there are any non-active sgp selected.
   *
   * **/
  React.useEffect(() => {
    if (memoAllSelectedWork) {
      const allActive = memoAllSelectedWork.every((work) => work.status === WorkStatus.Active);
      if (allActive) {
        setIsOnlyActiveWorkNumbers(allActive);
      }
    }
  }, [setIsOnlyActiveWorkNumbers, memoAllSelectedWork]);

  /**
   * Update available works info when user selects/deselects 'Active' checkbox
   */
  React.useEffect(() => {
    let availableWorksInfoArray = isOnlyActiveWorkNumbers
      ? workInfo.filter((work) => work.status === WorkStatus.Active)
      : workInfo;
    setCurrentWorkInfoOptions(availableWorksInfoArray);
  }, [workInfo, isOnlyActiveWorkNumbers, setCurrentWorkInfoOptions]);

  /**Upload URL**/
  const memoURL = React.useMemo(() => {
    if (memoAllSelectedWork.length === 0) return '';
    const params = new URLSearchParams();
    memoAllSelectedWork.forEach(
      (workInfo) => workInfo && params.append('workNumber', encodeURIComponent(workInfo.workNumber))
    );
    return `/files?${params}`;
  }, [memoAllSelectedWork]);

  /**
   * Handler hook to monitor workInfo array changes
   * Fetch all files uploaded for all workInfo numbers
   */
  React.useEffect(() => {
    if (memoAllSelectedWork.length === 0) return;
    findUploadedFiles(memoAllSelectedWork.map((workInfo) => workInfo.workNumber)).then((files) =>
      setUploadedFilesForWorkNumber(files)
    );
  }, [setUploadedFilesForWorkNumber, memoAllSelectedWork]);

  /**Callback notification send from child after finishing upload**/
  const onFileUploadFinished = React.useCallback(
    (result: UploadResult<any>[]) => {
      //Upload failed, return
      /** Notify user with success message and also update the files section with this new uploaded file**/
      toast(ToastSuccess(result.map((res) => res.file.name).join(',')), {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
      if (!memoAllSelectedWork) return;
      //Update the display of listed files with the newly uploaded file
      findUploadedFiles(memoAllSelectedWork.map((workInfo) => workInfo.workNumber)).then((files) =>
        setUploadedFilesForWorkNumber(files)
      );
    },
    [setUploadedFilesForWorkNumber, memoAllSelectedWork]
  );

  /**Callback function to confirm the upload which is called before upload action**/
  const onConfirmUpload = React.useCallback(
    (files: File[]): ConfirmUploadProps | undefined => {
      /**
       * If a file already exists in the same name, give a warning to user about file getting overwritten
       */
      if (uploadedFilesForWorkNumber.length > 0 && memoAllSelectedWork.length) {
        const filesWithSameName = files.filter((fileExist) =>
          uploadedFilesForWorkNumber.some((file) => fileExist.name === file.name)
        );
        if (filesWithSameName.length > 0) {
          return {
            title: 'File already exists',
            confirmMessage: `File(s) ${filesWithSameName
              .map((file) => file.name)
              .join(',')} already uploaded for selected work numbers and will be over-written.`
          };
        } else {
          return undefined;
        }
      }
      return undefined;
    },
    [uploadedFilesForWorkNumber, memoAllSelectedWork]
  );

  /**Columns to display in 'Files' section table**/
  const columns: Column<FileFieldsFragment>[] = [
    {
      Header: 'Name',
      accessor: (originalRow) => originalRow.name
    },
    {
      Header: 'SGP Number',
      accessor: (originalRow) => originalRow.work.workNumber
    },
    {
      Header: 'Uploaded',
      accessor: (originalRow) => new Date(originalRow.created).toLocaleDateString(),
      sortType: (rowA, rowB) => {
        return new Date(rowA.original.created).getTime() - new Date(rowB.original.created).getTime();
      }
    },
    {
      Header: 'Download',
      accessor: 'url',
      Cell: (props: CellProps<FileFieldsFragment>) => {
        return (
          <WhiteButton className="sm:w-full">
            <a
              className="w-full text-gray-800 focus:outline-hidden  text-left"
              download={props.row.original.name}
              href={props.row.original.url}
            >
              <DownloadIcon className={'inline-block h-5 w-5 -mt-1 -ml-1 mr-2'} />
            </a>
          </WhiteButton>
        );
      }
    }
  ];

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>File Manager</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto mb-8">
          <div className={'flex flex-col w-full p-4 gap-y-4 text-lg'}>
            {showUpload ? (
              <div className={'flex flex-col p-4 gap-y-4 text-lg'}>
                <motion.div variants={variants.fadeInWithLift}>
                  <Heading level={3}>SGP Number</Heading>
                  <p className="mt-2">Please select an SGP number.</p>
                  <div className={'flex flex-row items-start gap-x-6'}>
                    <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                      <WorkNumberSelect
                        workNumber={memoAllSelectedWork.map((work) => work.workNumber)}
                        worksInfoOptions={currentWorkInfoOptions}
                        onWorkNumberChangeInMulti={(workNumbers) => {
                          const params = new URLSearchParams();
                          workNumbers.forEach(
                            (value) => value && params.append('workNumber', encodeURIComponent(value))
                          );
                          navigate(`/file_manager?${params}`);
                        }}
                        workNumberType={'ALL'}
                        multiple
                      />
                    </motion.div>
                    <Label name={'Active'} className={'w-5'}>
                      <Input
                        type="checkbox"
                        data-testid="active"
                        checked={isOnlyActiveWorkNumbers}
                        onChange={() => setIsOnlyActiveWorkNumbers(!isOnlyActiveWorkNumbers)}
                      />
                    </Label>
                  </div>
                </motion.div>
                {memoAllSelectedWork.length > 0 && (
                  <motion.div variants={variants.fadeInWithLift} className={'space-y-4'}>
                    <Heading level={3}>Upload file</Heading>
                    <FileUploader
                      url={memoURL}
                      enableUpload={memoAllSelectedWork.length > 0}
                      confirmUpload={onConfirmUpload}
                      notifyUploadOutcome={onFileUploadFinished}
                      errorField={'message'}
                      allowMultipleFiles={true}
                    />
                  </motion.div>
                )}
              </div>
            ) : memoAllSelectedWork.length === 0 ? (
              <Warning message={'SGP Number(s) does not exist.'} />
            ) : (
              <></>
            )}
            {memoAllSelectedWork.length > 0 && (
              <motion.div variants={variants.fadeInWithLift} className={'flex flex-col space-y-4'}>
                <Heading level={3}>Files</Heading>
                {uploadedFilesForWorkNumber.length > 0 ? (
                  <DataTable columns={columns} data={uploadedFilesForWorkNumber} sortable />
                ) : (
                  <span className={'mt-8'}>No files uploaded for selected SGP numbers</span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default FileManager;
