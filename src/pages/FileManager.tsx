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
const FileManager: React.FC<FileManagerProps> = ({ showUpload = true, worksInfo }: FileManagerProps) => {
  /**Selected work number information**/
  const [workInfo, setWorkInfo] = React.useState<WorkInfo | undefined>(undefined);
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
  const memoWorkNumber = React.useMemo(() => {
    const queryString = parseQueryString(location.search);
    if (typeof queryString['workNumber'] === 'string') {
      return queryString['workNumber'];
    } else return '';
  }, [location.search]);

  /**State to handle worknumber changes (either using url or through worknumber selection)
   * Whenever work number is changed ,the selected workInfo will changed
   * Also,if selected work is non- active  or active, set the flag accordingly
   */
  React.useEffect(() => {
    const workInfo = worksInfo.find((workInfo) => workInfo.workNumber === memoWorkNumber);
    setWorkInfo(workInfo);
    if (workInfo) {
      setIsOnlyActiveWorkNumbers(workInfo.status === WorkStatus.Active);
    }
  }, [memoWorkNumber, setIsOnlyActiveWorkNumbers, worksInfo]);

  /**Upload URL**/
  const memoURL = React.useMemo(() => {
    if (!workInfo) return '';
    return `/files?workNumber=${encodeURIComponent(workInfo.workNumber)}`;
  }, [workInfo]);

  /**
   * State to handle workInfo number changes
   * Fetch all files uploaded for this workInfo number
   */
  React.useEffect(() => {
    if (!workInfo) return;
    findUploadedFiles(workInfo.workNumber).then((files) => setUploadedFilesForWorkNumber(files));
  }, [setUploadedFilesForWorkNumber, workInfo]);

  /**Callback notification send fron child after finishing upload**/
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
      if (!workInfo) return;
      //Update the display of listed files with the newly uploaded file
      findUploadedFiles(workInfo.workNumber).then((files) => setUploadedFilesForWorkNumber(files));
    },
    [setUploadedFilesForWorkNumber, workInfo]
  );

  /**Callback function to confirm the upload which is called before upload action**/
  const onConfirmUpload = React.useCallback(
    (file: File): ConfirmUploadProps | undefined => {
      /**
       * If a file already exists in the same name, give a warning to user about file getting overwritten
       */
      if (uploadedFilesForWorkNumber.length > 0 && workInfo) {
        const confirm = uploadedFilesForWorkNumber.some((fileExist) => fileExist.name === file.name);
        if (confirm) {
          return {
            title: confirm ? 'File already exists' : '',
            confirmMessage: `File ${file?.name} already uploaded for ${workInfo.workNumber} and will be over-written.`
          };
        } else {
          return undefined;
        }
      }
      return undefined;
    },
    [uploadedFilesForWorkNumber, workInfo]
  );

  /**Colums to display in 'Files' section table**/
  const columns: Column<FileFieldsFragment>[] = [
    {
      Header: 'Name',
      accessor: (originalRow) => originalRow.name
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

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>File Manager</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto mb-8">
          <div className={'flex flex-col w-full p-4 gap-y-4 text-lg'}>
            {showUpload && (
              <div className={'flex flex-col p-4 gap-y-4 text-lg'}>
                <motion.div variants={variants.fadeInWithLift}>
                  <Heading level={3}>SGP Number</Heading>
                  <p className="mt-2">Please select an SGP number.</p>
                  <div className={'flex flex-row items-start gap-x-6'}>
                    <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                      <WorkNumberSelect
                        workNumber={memoWorkNumber}
                        onWorkNumberChange={(workNumber) => {
                          // Replace instead of push so user doesn't have to go through a load of old searches when going back
                          history.replace(`/file_manager?workNumber=${encodeURIComponent(workNumber)}`);
                        }}
                        workNumberType={isOnlyActiveWorkNumbers ? WorkStatus.Active : 'ALL'}
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

                <motion.div variants={variants.fadeInWithLift} className={'space-y-4'}>
                  <Heading level={3}>Upload file</Heading>
                  <FileUploader
                    url={memoURL}
                    enableUpload={workInfo && workInfo.status === WorkStatus.Active && workInfo.workNumber.length > 0}
                    confirmUpload={onConfirmUpload}
                    notifyUploadOutcome={onFileUploadFinished}
                  />
                </motion.div>
              </div>
            )}
            {workInfo?.workNumber && (
              <motion.div variants={variants.fadeInWithLift} className={'flex flex-col space-y-4'}>
                <Heading level={3}>Files</Heading>
                {uploadedFilesForWorkNumber.length > 0 ? (
                  <DataTable columns={columns} data={uploadedFilesForWorkNumber} />
                ) : (
                  <span className={'mt-8'}>{`No files uploaded for ${workInfo.workNumber}`}</span>
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
