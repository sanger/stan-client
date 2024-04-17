import React from 'react';

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

export type UploadProgress = {
  file: File;
  progress: boolean;
};

export function useUpload<T>(url: string, errorField?: string) {
  const [uploadResult, setUploadResult] = React.useState<UploadResult<T> | undefined>(undefined);

  const initialiseUpload = React.useCallback(() => {
    setUploadResult(undefined);
  }, [setUploadResult]);

  /**External request for upload
   * @param {File} - The file to be uploaded.
   * @param {function} - A callback function to notify upload progress.
   * @param {string[]} - An array of clashing external names that the user confirmed to upload (used by block registration by file upload)
   */
  const requestUpload = React.useCallback(
    (
      file: File,
      notifyUploadProgress?: (uploadProgress: UploadProgress | undefined) => void,
      existingExternalNames?: string[],
      ignoreExternalNames: boolean = false
    ) => {
      const retUploadResult: UploadResult<T> = { file, success: false, error: undefined, response: undefined };
      async function postUpload(url: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        if (existingExternalNames) {
          formData.append(
            ignoreExternalNames ? 'ignoreExternalNames' : 'existingExternalNames',
            existingExternalNames.join(',')
          );
        }
        return await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
      }

      if (!file) return;
      notifyUploadProgress?.({ file, progress: true });
      postUpload(url, file)
        .then((response) => {
          retUploadResult.success = response.ok;
          response
            .json()
            .then((response) => {
              if (!retUploadResult.success) {
                retUploadResult.error = new Error(errorField ? response[errorField] : response.message);
              } else {
                retUploadResult.response = response;
              }
              setUploadResult(retUploadResult);
              notifyUploadProgress?.(undefined);
            })
            .catch((error) => {
              // setting it so the notifyUploadOutcome still been called from the FileUpload component when the response does not contain a JSON
              setUploadResult({ ...retUploadResult, response: error });
              notifyUploadProgress?.(undefined);
            });
        })
        .catch((error) => {
          setUploadResult({ ...retUploadResult, error: new Error(error) });
          notifyUploadProgress?.(undefined);
        });
    },
    [url, errorField]
  );

  return { initialiseUpload, requestUpload, uploadResult };
}
