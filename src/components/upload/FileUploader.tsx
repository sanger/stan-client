import React from 'react';
import { Input } from '../forms/Input';
import BlueButton from '../buttons/BlueButton';
import { useUpload } from './useUpload';
import LoadingSpinner from '../icons/LoadingSpinner';
import FileIcon from '../icons/FileIcon';
import FailIcon from '../icons/FailIcon';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import UploadIcon from '../icons/UploadIcon';

export type ConfirmUploadProps = {
  confirmMessage: string;
  title: string;
};
interface FileUploaderProps {
  url: string;
  enableUpload?: boolean;
  confirmUpload?: (file: File) => ConfirmUploadProps | undefined;
  notifyUploadOutcome?: (file: File, isSuccess: boolean) => void;
}

/**
 * File upload Component which displays a file input with an upload button
 * @param url - url to upload
 * @param enableUpload - Upload is possible only if a file is selected. This serves
 *                       as an additional external condition to enable/disable Upload
 * @param confirmUpload - Callback function to confirm upload
 * @param notifyUploadOutcome - Callback function to notify upload outcome
 * @constructor
 */
const FileUploader: React.FC<FileUploaderProps> = ({ url, enableUpload, confirmUpload, notifyUploadOutcome }) => {
  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [uploadInProgress, setUploadInProgress] = React.useState<boolean>(false);
  const [confirmUploadResult, setConfirmUploadResult] = React.useState<ConfirmUploadProps | undefined>();

  const { initializeUpload, requestUpload, uploadSuccess, error } = useUpload(url);

  /**Handle actions when we get to 'error' or 'uploadSuccess' state after upload**/
  React.useEffect(() => {
    if ((!error && !uploadSuccess) || !uploadInProgress) return;
    setUploadInProgress(false);
    if (uploadSuccess && file) {
      if (file) {
        notifyUploadOutcome?.(file, uploadSuccess);
      }
      setFile(undefined);
    }
  }, [uploadSuccess, error, file, notifyUploadOutcome, setUploadInProgress, uploadInProgress]);

  /**Callback function to perform upload**/
  const uploadFile = React.useCallback(() => {
    if (!file) return;
    setUploadInProgress(true);
    setConfirmUploadResult(undefined);
    requestUpload(file);
  }, [setUploadInProgress, setConfirmUploadResult, file, requestUpload]);

  /**Callback function to handle file change**/
  const onFileChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      initializeUpload();
      if (!evt.currentTarget.files || evt.currentTarget.files.length <= 0) return;
      setFile(evt.currentTarget.files[0]);
      evt.target.value = '';
    },
    [setFile]
  );

  /**Handler for 'Upload' button click**/
  const onUploadAction = React.useCallback(() => {
    if (!file) return;
    const confirmResult = confirmUpload?.(file);
    if (confirmResult) {
      setConfirmUploadResult(confirmResult);
    } else {
      uploadFile();
    }
  }, [setConfirmUploadResult, confirmUpload, file, uploadFile]);

  /**Handler for 'Remove' button click for file**/
  const onRemoveFile = React.useCallback(() => {
    initializeUpload();
    setFile(undefined);
    setUploadInProgress(false);
    setConfirmUploadResult(undefined);
  }, []);

  return (
    <div className={'mx-auto  max-w-screen-lg bg-gray-100 border border-gray-200 bg-gray-100 rounded-md'}>
      <div className="flex flex-row border-b-2 border-gray-200 space-x-4 py-2" data-testid={'upload'}>
        <Input type="file" id="file" onChange={onFileChange} data-testid="file-input" className="hidden" />
        <label
          htmlFor="file"
          className={
            'bg-gray-100 border-2 border-gray-200 whitespace-nowrap hover:bg-gray-200 text-black  py-2 px-4 rounded'
          }
        >
          Select file...
        </label>
      </div>
      {file && (
        <div
          data-testid={'file-description'}
          className={'flex flex-row w-full p-2 space-x-2 border-b-2 border-gray-200 bg-white'}
        >
          <div>
            <FileIcon data-testid={'fileIcon'} className={'text-gray-600'} />
          </div>
          <span className={'whitespace-nowrap'}>{file?.name}</span>
          <div className={'w-full flex justify-end p-2 space-x-4'}>
            {uploadInProgress && (
              <div className="flex flex-row ml-3 -mr-1 whitespace-nowrap space-x-6 justify-end">
                <div className={'text-blue-600 text-sm'}>{`Uploading in progress...`}</div>
                <LoadingSpinner className={'text-blue-600'} />
              </div>
            )}
            {error && (
              <div
                data-testid={'error-div'}
                className={'text-red-600 text-sm whitespace-nowrap'}
              >{`Error: ${error?.message}`}</div>
            )}
            <FailIcon className={'h-4 w-4 cursor-pointer text-black  hover:bg-gray-200 '} onClick={onRemoveFile} />
          </div>
        </div>
      )}
      <div className="flex bg-white mt-2 p-4 justify-end">
        <BlueButton
          type={'button'}
          disabled={!file || !enableUpload}
          onClick={onUploadAction}
          data-testid={'upload-btn'}
        >
          Upload
          <UploadIcon className={!file || !enableUpload ? 'ml-2 text-gray-300' : 'ml-4 text-white'} />
        </BlueButton>
      </div>
      <ConfirmationModal
        show={confirmUploadResult !== undefined}
        header={confirmUploadResult?.title ?? ''}
        message={{
          type: 'Warning',
          text: confirmUploadResult?.confirmMessage ?? ''
        }}
        confirmOptions={[
          {
            label: 'Cancel',
            action: () => {
              setConfirmUploadResult(undefined);
            }
          },
          { label: 'Continue', action: uploadFile }
        ]}
      >
        <p className={'mt-6 font-bold'}>Do you wish to continue or cancel?</p>{' '}
      </ConfirmationModal>
    </div>
  );
};

export default FileUploader;
