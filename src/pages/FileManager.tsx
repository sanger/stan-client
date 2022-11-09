import React from 'react';
import AppShell from '../components/AppShell';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { parseQueryString } from '../lib/helpers';
import { useLocation } from 'react-router-dom';
import FileUploader, { ConfirmUploadProps } from '../components/upload/FileUploader';
import { history } from '../lib/sdk';
import { FileFieldsFragment } from '../types/sdk';
import DataTable from '../components/DataTable';
import { Cell, Column } from 'react-table';
import WhiteButton from '../components/buttons/WhiteButton';
import DownloadIcon from '../components/icons/DownloadIcon';
import { toast } from 'react-toastify';
import Success from '../components/notifications/Success';
import { findUploadedFiles } from '../lib/services/fileService';

type FileManagerProps = {
  workNumbers: string[];
};

/**Component to render File Manager page**/
const FileManager: React.FC<FileManagerProps> = ({ workNumbers }: FileManagerProps) => {
  const [workNumber, setWorkNumber] = React.useState<string>('');
  const [uploadedFilesForWorkNumber, setUploadedFilesForWorkNumber] = React.useState<FileFieldsFragment[]>([]);
  const location = useLocation();

  /**
   * Success notification when file is uploaded
   */
  const ToastSuccess = (fileName: string) => <Success message={`${fileName} uploaded succesfully.`} />;

  /**Update work number when ever query string in location changes **/
  React.useEffect(() => {
    const queryString = parseQueryString(location.search);
    if (typeof queryString['workNumber'] === 'string' && workNumbers.includes(queryString['workNumber'])) {
      setWorkNumber(queryString['workNumber']);
    }
  }, [location.search, setWorkNumber, workNumbers]);

  /**Upload URL**/
  const memoURL = React.useMemo(() => {
    return `/files?workNumber=${encodeURIComponent(workNumber)}`;
  }, [workNumber]);

  /**
   * State to handle work number changes
   * Fetch all files uploaded for this work number
   */
  React.useEffect(() => {
    if (!workNumber) return;
    findUploadedFiles(workNumber).then((files) => setUploadedFilesForWorkNumber(files));
  }, [setUploadedFilesForWorkNumber, workNumber]);

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
      //Update the display of listed files with the newly uploaded file
      findUploadedFiles(workNumber).then((files) => setUploadedFilesForWorkNumber(files));
    },
    [setUploadedFilesForWorkNumber, workNumber]
  );

  /**Callback function to confirm the upload which is called before upload action**/
  const onConfirmUpload = React.useCallback(
    (file: File): ConfirmUploadProps | undefined => {
      /**
       * If a file already exists in the same name, give a warning to user about file getting overwritten
       */
      if (uploadedFilesForWorkNumber.length > 0) {
        const confirm = uploadedFilesForWorkNumber.some((fileExist) => fileExist.name === file.name);
        if (confirm) {
          return {
            title: confirm ? 'File already exists' : '',
            confirmMessage: `File ${file?.name} already uploaded for ${workNumber} and will be over-written.`
          };
        } else {
          return undefined;
        }
      }
      return undefined;
    },
    [uploadedFilesForWorkNumber, workNumber]
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
            <motion.div variants={variants.fadeInWithLift}>
              <Heading level={3}>SGP Number</Heading>
              <p className="mt-2">Please select an SGP number.</p>
              <motion.div variants={variants.fadeInWithLift} className="mt-4 md:w-1/2">
                <WorkNumberSelect
                  workNumber={workNumber}
                  onWorkNumberChange={(workNumber) => {
                    // Replace instead of push so user doesn't have to go through a load of old searches when going back
                    history.replace(`/file_manager?workNumber=${encodeURIComponent(workNumber)}`);
                  }}
                />
              </motion.div>
            </motion.div>
            <motion.div variants={variants.fadeInWithLift} className={'space-y-4'}>
              <Heading level={3}>Upload file</Heading>
              <FileUploader
                url={memoURL}
                enableUpload={workNumber.length > 0}
                confirmUpload={onConfirmUpload}
                notifyUploadOutcome={onFileUploadFinished}
              />
            </motion.div>
            {workNumber && (
              <motion.div variants={variants.fadeInWithLift} className={'flex flex-col space-y-4'}>
                <Heading level={3}>Files</Heading>
                {uploadedFilesForWorkNumber.length > 0 ? (
                  <DataTable columns={columns} data={uploadedFilesForWorkNumber} />
                ) : (
                  <span className={'mt-8'}>{`No files uploaded for ${workNumber}`}</span>
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
