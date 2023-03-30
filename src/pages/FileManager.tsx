import React from 'react';
import AppShell from '../components/AppShell';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import WorkNumberSelect, { WorkInfo } from '../components/WorkNumberSelect';
import { parseQueryString } from '../lib/helpers';
import { useLocation } from 'react-router-dom';
import FileUploader, { ConfirmUploadProps } from '../components/upload/FileUploader';
import { history } from '../lib/sdk';
import { FileFieldsFragment, WorkStatus } from '../types/sdk';
import DataTable from '../components/DataTable';
import { Cell, Column } from 'react-table';
import WhiteButton from '../components/buttons/WhiteButton';
import DownloadIcon from '../components/icons/DownloadIcon';
import { toast } from 'react-toastify';
import Success from '../components/notifications/Success';
import { findUploadedFiles } from '../lib/services/fileService';
import Label from '../components/forms/Label';
import { Input } from '../components/forms/Input';
import Warning from '../components/notifications/Warning';

type FileManagerProps = {
  /**Display upload option?**/
  showUpload?: boolean;
  /**Work Info about all work numbers  **/
  worksInfo: WorkInfo[];
};

/**Component to render File Manager page
 * Supports both /file_manager and /file_viewer urls
 * /file_manager is only for authenticated users and /file_viewer is for non-auth users (only view files without upload option)
 * If the work number selected in active, upload option will be active. Otherwise,upload will be disabled
 ***/
const FileManager: React.FC<FileManagerProps> = ({ showUpload = true, worksInfo: workInfoProps }: FileManagerProps) => {
  /**All selected work number information**/
  const [workInfoArray, setWorkInfoArray] = React.useState<WorkInfo[]>([]);
  /**Only active work numbers required?**/
  const [isOnlyActiveWorkNumbers, setIsOnlyActiveWorkNumbers] = React.useState(showUpload);
  /**Uploaded files for the selected work**/
  const [uploadedFilesForWorkNumber, setUploadedFilesForWorkNumber] = React.useState<FileFieldsFragment[]>([]);
  const location = useLocation();
  /**
   * Success notification when file is uploaded
   */
  const ToastSuccess = (fileName: string) => <Success message={`${fileName} uploaded succesfully.`} />;

  /**Update work number when ever query string in location changes **/
  const memoWorkNumbers = React.useMemo(() => {
    const queryString = parseQueryString(location.search);
    if (Array.isArray(queryString['workNumber'])) {
      const workNumbers: string[] = [];
      queryString['workNumber'].forEach((workNumber) => {
        if (workNumber) {
          workNumbers.push(workNumber);
        }
      });
      return workNumbers;
    }
    if (typeof queryString['workNumber'] === 'string') {
      return [queryString['workNumber']] ?? [];
    }
    return [];
  }, [location.search]);

  /**State to handle worknumber changes (either using url or through worknumber selection)
   * Whenever work numbers changed,set the selected workInfo
   * Also,set  'isOnlyActiveWorkNumbers' state based on selected work number status ,
   */
  React.useEffect(() => {
    let worksInfoArray = workInfoProps.filter((workInfo) => memoWorkNumbers?.includes(workInfo.workNumber));
    setWorkInfoArray(worksInfoArray);
    if (workInfoProps) {
      setIsOnlyActiveWorkNumbers(worksInfoArray.every((work) => work.status === WorkStatus.Active));
    }
  }, [memoWorkNumbers, setIsOnlyActiveWorkNumbers, workInfoProps]);

  /**Upload URL**/
  const memoURL = React.useMemo(() => {
    if (workInfoArray.length === 0) return '';
    const params = new URLSearchParams();
    workInfoArray.forEach(
      (workInfo) => workInfo && params.append('workNumber', encodeURIComponent(workInfo.workNumber))
    );
    return `/files?${params}`;
  }, [workInfoArray]);

  /**
   * State to handle workInfo array changes
   * Fetch all files uploaded for all workInfo numbers
   */
  React.useEffect(() => {
    if (workInfoArray.length === 0) return;
    findUploadedFiles(workInfoArray.map((workInfo) => workInfo.workNumber)).then((files) =>
      setUploadedFilesForWorkNumber(files)
    );
  }, [setUploadedFilesForWorkNumber, workInfoArray]);

  /**Callback notification send from child after finishing upload**/
  const onFileUploadFinished = React.useCallback(
    (file: File, isSuccess: boolean) => {
      //Upload failed, return
      if (!isSuccess) return;

      /** Notify user with success message and also update the files section with this new uploaded file**/
      toast(ToastSuccess(file.name), {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
      if (!workInfoArray) return;
      //Update the display of listed files with the newly uploaded file
      findUploadedFiles(workInfoArray.map((workInfo) => workInfo.workNumber)).then((files) =>
        setUploadedFilesForWorkNumber(files)
      );
    },
    [setUploadedFilesForWorkNumber, workInfoArray]
  );

  /**Callback function to confirm the upload which is called before upload action**/
  const onConfirmUpload = React.useCallback(
    (file: File): ConfirmUploadProps | undefined => {
      /**
       * If a file already exists in the same name, give a warning to user about file getting overwritten
       */
      if (uploadedFilesForWorkNumber.length > 0 && workInfoArray.length) {
        const filesWithSameName = uploadedFilesForWorkNumber.filter((fileExist) => fileExist.name === file.name);
        if (filesWithSameName.length > 0) {
          return {
            title: 'File already exists',
            confirmMessage: `File ${file?.name} already uploaded for ${filesWithSameName
              .map((file) => file.work.workNumber)
              .join(',')} and will be over-written.`
          };
        } else {
          return undefined;
        }
      }
      return undefined;
    },
    [uploadedFilesForWorkNumber, workInfoArray]
  );

  /**Colums to display in 'Files' section table**/
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
      Cell: (props: Cell<FileFieldsFragment>) => {
        return (
          <WhiteButton className="sm:w-full">
            <a
              className="w-full text-gray-800 focus:outline-none  text-left"
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

  const nonValidWorkNumbers = memoWorkNumbers.filter(
    (work: string) => !workInfoArray.some((workInfo) => workInfo.workNumber === work)
  );
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
                        workNumber={memoWorkNumbers}
                        onWorkNumberChangeInMulti={(workNumbers) => {
                          const params = new URLSearchParams();
                          workNumbers.forEach(
                            (value) => value && params.append('workNumber', encodeURIComponent(value))
                          );
                          history.replace(`/file_manager?${params}`);
                        }}
                        workNumberType={isOnlyActiveWorkNumbers ? WorkStatus.Active : 'ALL'}
                        multiple
                      />
                    </motion.div>
                    <Label name={'Active'} className={'w-5 mt-2'}>
                      <Input
                        type="checkbox"
                        data-testid="active"
                        checked={isOnlyActiveWorkNumbers}
                        onChange={() => setIsOnlyActiveWorkNumbers(!isOnlyActiveWorkNumbers)}
                      />
                    </Label>
                  </div>
                </motion.div>
                {workInfoArray.length > 0 && (
                  <motion.div variants={variants.fadeInWithLift} className={'space-y-4'}>
                    <Heading level={3}>Upload file</Heading>
                    <FileUploader
                      url={memoURL}
                      enableUpload={workInfoArray.length > 0}
                      confirmUpload={onConfirmUpload}
                      notifyUploadOutcome={onFileUploadFinished}
                    />
                  </motion.div>
                )}
              </div>
            ) : nonValidWorkNumbers.length > 0 ? (
              <Warning message={`SGP Number '${nonValidWorkNumbers.join(',')}' does not exist.`} />
            ) : (
              <></>
            )}
            {workInfoArray.length > 0 && (
              <motion.div variants={variants.fadeInWithLift} className={'flex flex-col space-y-4'}>
                <Heading level={3}>Files</Heading>
                {uploadedFilesForWorkNumber.length > 0 ? (
                  <DataTable columns={columns} data={uploadedFilesForWorkNumber} sortable />
                ) : (
                  <span className={'mt-8'}>{`No files uploaded for ${workInfoArray
                    .map((workInfo) => workInfo.workNumber)
                    .join(',')}`}</span>
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
