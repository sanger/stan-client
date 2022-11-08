import React from 'react';

/**
 * React hook for uploading a file
 * @param url - Upload url
 */
export function useUpload(url: string) {
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean>(false);

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
          if (response.ok) {
            setUploadSuccess(true);
          } else {
            // get error message from body or default to response status
            setError(new Error(response.statusText));
          }
        })
        .catch((error) => {
          // get error message from body or default to response status
          setError(new Error(error));
        });
    },
    [url]
  );

  return { error, uploadSuccess, requestUpload };
}
