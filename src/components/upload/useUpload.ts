import React from 'react';

/**
 * React hook for uploading a file
 * @param url - Upload url
 */
export function useUpload(url: string) {
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean>(false);

  /**Initialize hook state**/
  const initializeUpload = React.useCallback(() => {
    setError(undefined);
    setUploadSuccess(false);
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
          if (success) {
            setUploadSuccess(true);
          }
          response.json().then((response) => {
            if (!success) {
              // get error message from body
              setError(new Error(response.message));
            } else {
              setUploadSuccess(true);
            }
          });
        })
        .catch((error) => {
          // get error message from body or default to response status
          setError(new Error(error));
        });
    },
    [url]
  );

  return { error, uploadSuccess, requestUpload, initializeUpload };
}
