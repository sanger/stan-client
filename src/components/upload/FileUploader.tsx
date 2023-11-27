import React from 'react';
import { Input } from '../forms/Input';
import BlueButton from '../buttons/BlueButton';
import { UploadResult, useUpload } from './useUpload';
import LoadingSpinner from '../icons/LoadingSpinner';
import FileIcon from '../icons/FileIcon';
import FailIcon from '../icons/FailIcon';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import UploadIcon from '../icons/UploadIcon';
import MutedText from '../MutedText';
import PassIcon from '../icons/PassIcon';

export type ConfirmUploadProps = {
  confirmMessage: string;
  title: string;
};

interface FileUploaderProps<T extends object> {
  url: string;
  enableUpload?: boolean;
  allowMultipleFiles?: boolean;
  confirmUpload?: (files: File[]) => ConfirmUploadProps | undefined;
  notifyUploadOutcome?: (results: UploadResult<T>[]) => void;
  errorField?: string;
}

export type UploadProgress = {
  file: File;
  progress: boolean;
};

/**
 * File upload Component which displays a file input with an upload button
 * @param url - url to upload
 * @param enableUpload - Upload is possible only if a file is selected. This serves
 *                       as an additional external condition to enable/disable Upload
 * @param confirmUpload - Callback function to confirm upload
 * @param notifyUploadOutcome - Callback function to notify upload outcome
 * @param errorField - Field name in server response to display error message
 * @param allowMultipleFiles - Allow multiple files to be selected and uploaded
 * @constructor
 */
const FileUploader = <T extends object>({
  url,
  enableUpload,
  confirmUpload,
  notifyUploadOutcome,
  errorField,
  allowMultipleFiles = false
}: FileUploaderProps<T>) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadInProgress, setUploadInProgress] = React.useState<UploadProgress | undefined>(undefined);
  const [confirmUploadOutcome, setConfirmUploadOutcome] = React.useState<ConfirmUploadProps | undefined>();
  const [fileAlreadySelectedError, setFileAlreadySelectedError] = React.useState<string>('');
  const [filesUploadResult, setFilesUploadResult] = React.useState<UploadResult<any>[]>([]);

  const { requestUpload, uploadResult } = useUpload(url, errorField);

  React.useEffect(() => {
    if (!uploadResult) return;
    if (filesUploadResult.find((resFile) => uploadResult?.file.name === resFile.file.name)) {
      return;
    }
    const results = [...filesUploadResult, uploadResult];
    setFilesUploadResult(results);
    if (files.length !== results.length) return;
    if (files.every((file) => results.find((res) => res.file.name === file.name))) {
      notifyUploadOutcome?.(results);
      setFiles([]);
      setFilesUploadResult([]);
      setUploadInProgress(undefined);
      setConfirmUploadOutcome(undefined);
    }
  }, [
    uploadResult,
    files,
    filesUploadResult,
    notifyUploadOutcome,
    setFilesUploadResult,
    setFiles,
    setUploadInProgress,
    setConfirmUploadOutcome
  ]);

  /**Callback function to perform upload**/
  const uploadFiles = React.useCallback(() => {
    if (files.length === 0) return;
    setUploadInProgress(undefined);
    setConfirmUploadOutcome(undefined);
    files.forEach((file) => {
      requestUpload(file, setUploadInProgress);
    });
  }, [setUploadInProgress, setConfirmUploadOutcome, files, requestUpload]);

  /**Callback function to handle file change**/
  const onFileChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      //This file is already selected
      if (files.length > 0 && files.some((f) => f.name === evt.currentTarget.files![0].name)) {
        setFileAlreadySelectedError('File already selected');
        return;
      }
      setFileAlreadySelectedError('');
      if (!evt.currentTarget.files || evt.currentTarget.files.length <= 0) return;
      let selectedFiles: File[] = [evt.currentTarget.files[0]];
      if (allowMultipleFiles) {
        selectedFiles = [...files, ...evt.currentTarget.files];
      }
      setFiles(selectedFiles);
      evt.target.value = '';
    },
    [setFiles, files, allowMultipleFiles]
  );

  /**Handler for 'Upload' button click**/
  const onUploadAction = React.useCallback(() => {
    if (files.length === 0) return;
    const confirmResult = confirmUpload?.(files);
    if (confirmResult) {
      setConfirmUploadOutcome(confirmResult);
    } else {
      uploadFiles();
    }
  }, [setConfirmUploadOutcome, confirmUpload, files, uploadFiles]);

  /**Handler for 'Remove' button click for file**/
  const onRemoveFile = React.useCallback(
    (file: File) => {
      setFiles((prev) => prev.filter((f) => f.name !== file.name));
      setUploadInProgress(undefined);
      setConfirmUploadOutcome(undefined);
    },
    [setFiles, setUploadInProgress, setConfirmUploadOutcome]
  );

  const isFileUploadInProgress = (file: File) =>
    uploadInProgress && uploadInProgress.file.name === file.name && uploadInProgress.progress;

  const uploadResultFile = (file: File) => filesUploadResult.find((res) => res.file.name === file.name);

  return (
    <div className={'mx-auto  max-w-screen-lg bg-gray-100 border border-gray-200 bg-gray-100 rounded-md'}>
      <div className="flex flex-col border-b-2 border-gray-200 space-x-6 py-2" data-testid={'upload'}>
        <div className="flex flex-row space-x-4">
          <Input
            type="file"
            id="file"
            disabled={!url || !enableUpload}
            onChange={onFileChange}
            data-testid="file-input"
            className="hidden disabled:bg-gray-100"
          />
          <label
            htmlFor="file"
            className={`${
              url && enableUpload
                ? 'bg-gray-200 text-black hover:bg-gray-300 border-2 border-gray-200'
                : 'bg-white text-gray-400 disabled:cursor-not-allowed'
            }  whitespace-nowrap  py-2 px-4 rounded`}
          >
            Select file...
          </label>
        </div>
        {!url && (
          <MutedText className={'text-gray-600'}>Please select an SGP Number to enable file selection</MutedText>
        )}
        {fileAlreadySelectedError && <MutedText className={'text-red-400'}>{fileAlreadySelectedError}</MutedText>}
      </div>
      <div data-testid={'file-description'} className={'flex flex-col w-full p-2 border-b-2 border-gray-200 bg-white'}>
        {files.map((file) => (
          <div key={file.name}>
            <div className={'flex flex-row '}>
              <div>
                <FileIcon data-testid={'fileIcon'} className={'text-gray-600'} />
              </div>
              <span className={'whitespace-nowrap'}>{file?.name}</span>
              <div className={'w-full flex justify-end p-2 space-x-4'}>
                {isFileUploadInProgress(file) && (
                  <div className="flex flex-row ml-3 -mr-1 whitespace-nowrap space-x-6 justify-end">
                    <div className={'text-blue-600 text-sm'}>{`Uploading in progress...`}</div>
                    <LoadingSpinner className={'text-blue-600'} />
                  </div>
                )}
                {uploadResultFile(file)?.success ? (
                  <PassIcon className={'h-4 w-4 text-green-600'} />
                ) : (
                  <FailIcon
                    className={'h-4 w-4 cursor-pointer text-black  hover:bg-gray-200 '}
                    onClick={() => onRemoveFile(file)}
                  />
                )}
              </div>
            </div>
            {uploadResultFile(file)?.error && (
              <div data-testid={'error-div'} className={'text-red-600 text-sm whitespace-nowrap'}>
                Error:
                {uploadResultFile(file)
                  ?.error?.message.split(',')
                  .map((err, index) => (
                    <div key={index}>{`${err}`}</div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex bg-white mt-2 p-4 justify-end">
        <BlueButton
          type={'button'}
          disabled={files.length === 0 || !enableUpload}
          onClick={onUploadAction}
          data-testid={'upload-btn'}
        >
          Upload
          <UploadIcon
            className={
              files.length === 0 || !enableUpload ? 'ml-2 text-gray-300 disabled:cursor-not-allowed' : 'ml-4 text-white'
            }
          />
        </BlueButton>
      </div>
      <ConfirmationModal
        show={confirmUploadOutcome !== undefined}
        header={confirmUploadOutcome?.title ?? ''}
        message={{
          type: 'Warning',
          text: confirmUploadOutcome?.confirmMessage ?? ''
        }}
        confirmOptions={[
          {
            label: 'Cancel',
            action: () => {
              setConfirmUploadOutcome(undefined);
            }
          },
          { label: 'Continue', action: uploadFiles }
        ]}
      >
        <p className={'mt-6 font-bold'}>Do you wish to continue or cancel?</p>{' '}
      </ConfirmationModal>
    </div>
  );
};

export default FileUploader;
