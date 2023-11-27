import React from 'react';
import { UploadProgress } from './FileUploader';

/**
 * React hook for uploading a file
 * @param url - Upload url
 * @param errorField - Field in response to use as error message
 */
export interface UploadResult<T> {
  file: File;
  success: boolean;
  error?: Error;
  response?: T;
}

export function useUpload<T>(url: string, errorField?: string) {
  const [uploadResult, setUploadResult] = React.useState<UploadResult<T> | undefined>(undefined);

  /**External request for upload**/
  const requestUpload = React.useCallback(
    (file: File, setUploadInProgress: (val: UploadProgress) => void) => {
      const retUploadResult: UploadResult<T> = { file, success: false, error: undefined, response: undefined };
      async function postUpload(url: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
      }

      if (!file) return;
      postUpload(url, file)
        .then((response) => {
          setUploadInProgress({ file, progress: false });
          const success = response.ok;
          retUploadResult.success = true;
          response
            .json()
            .then((response) => {
              if (!success) {
                retUploadResult.error = new Error(errorField ? response[errorField] : response.message);
              } else {
                retUploadResult.response = response;
              }
              setUploadResult(retUploadResult);
            })
            .catch((error) => {
              // setting it so the notifyUploadOutcome still been called from the FileUpload component when the response does not contain a JSON
              retUploadResult.response = error;
              setUploadResult(retUploadResult);
            });
        })
        .catch((error) => {
          retUploadResult.error = new Error(error);
          setUploadResult(retUploadResult);
        });
    },
    [url, errorField]
  );

  return { requestUpload, uploadResult };
}
