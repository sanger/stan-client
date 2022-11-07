import React from 'react';
import AppShell from '../components/AppShell';
import { motion } from 'framer-motion';
import variants from '../lib/motionVariants';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import { parseQueryString } from '../lib/helpers';
import { useLocation } from 'react-router-dom';
import FileUploader, { ConfirmUploadProps } from '../components/upload/FileUploader';
import { stanCore } from '../lib/sdk';
import { FileFieldsFragment } from '../types/sdk';
import DataTable from '../components/DataTable';
import { Cell, Column } from 'react-table';
import WhiteButton from '../components/buttons/WhiteButton';
import DownloadIcon from '../components/icons/DownloadIcon';

type FileManagerProps = {
  workNumbers: string[];
};

const FileManager: React.FC<FileManagerProps> = ({ workNumbers }: FileManagerProps) => {
  const [workNumber, setWorkNumber] = React.useState<string>('');
  const [uploadedFilesForWorkNumber, setUploadedFilesForWorkNumber] = React.useState<FileFieldsFragment[]>([]);
  const location = useLocation();

  React.useEffect(() => {
    const queryString = parseQueryString(location.search);
    if (typeof queryString['workNumber'] === 'string' && workNumbers.includes(queryString['workNumber'])) {
      setWorkNumber(queryString['workNumber']);
    }
  }, [location, setWorkNumber, workNumbers]);

  const memoURL = React.useMemo(() => {
    debugger;
    return `/files/${encodeURIComponent(workNumber)}`;
  }, [workNumber]);

  const fetchUploadedFilesForWorkNumber = React.useCallback(async () => {
    return await stanCore.FindFiles({
      workNumber: workNumber
    });
  }, [workNumber]);

  /**
   * Fetch active work and set them to state
   */
  React.useEffect(() => {
    if (!workNumber) return;
    const findFiles = fetchUploadedFilesForWorkNumber();
    findFiles.then((response) => setUploadedFilesForWorkNumber(response.listFiles));
    return () => {
      debugger;
      setUploadedFilesForWorkNumber([]);
    };
  }, [setUploadedFilesForWorkNumber, workNumber, fetchUploadedFilesForWorkNumber]);

  const onFileUploadFinished = React.useCallback(
    (file: File, isSuccess: boolean) => {
      if (!isSuccess) return;
      const findFiles = fetchUploadedFilesForWorkNumber();
      findFiles.then((response) => setUploadedFilesForWorkNumber(response.listFiles));
    },
    [setUploadedFilesForWorkNumber, fetchUploadedFilesForWorkNumber]
  );

  const onConfirmUpload = React.useCallback(
    (file: File): ConfirmUploadProps | undefined => {
      if (uploadedFilesForWorkNumber.length > 0) {
        debugger;
        const confirm = uploadedFilesForWorkNumber.some((fileExist) => fileExist.name === file.name);
        if (confirm) {
          return {
            title: confirm ? 'File already exists' : '',
            confirmMessage: `File ${file?.name} already uploaded for ${workNumber}. Upload action will overwrite the file.`
          };
        } else {
          return undefined;
        }
      }
      return undefined;
    },
    [uploadedFilesForWorkNumber, workNumber]
  );

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
              className="w-full text-gray-800 focus:outline-none"
              download={'release.tsv'}
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
                <WorkNumberSelect workNumber={workNumber} onWorkNumberChange={setWorkNumber} />
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
