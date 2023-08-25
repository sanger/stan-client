import React from 'react';

/**
 * React hook for uploading a file
 * @param url - Upload url
 * @param errorField - Field in response to use as error message
 */
export function useUpload(url: string, errorField?: string) {
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean>(false);
  const [uploadResponse, setUploadResponse] = React.useState(undefined);

  /**Initialize hook state**/
  const initializeUpload = React.useCallback(() => {
    setError(undefined);
    setUploadSuccess(false);
    setUploadResponse(undefined);
  }, [setError, setUploadSuccess]);

  /**External request for upload**/
  const requestUpload = React.useCallback(
    (file: File) => {
      async function postUpload(url: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
      }
      //Reset Upload status
      setError(undefined);
      setUploadSuccess(false);
      if (!file) return;
      postUpload(url, file)
        .then((response) => {
          const success = response.ok;
          setUploadSuccess(success);
          response.json().then((response) => {
            if (!success) {
              setError(new Error(errorField ? response[errorField] : response.message));
            } else {
              setUploadResponse(response);
            }
          });
        })
        .catch((error) => {
          setError(new Error(error));
        });
    },
    [url, errorField, setError, setUploadSuccess]
  );

  return { error, uploadSuccess, uploadResponse, requestUpload, initializeUpload };
}
