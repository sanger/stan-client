import { FileFieldsFragment } from '../../types/sdk';
import { stanCore } from '../sdk';

/**
 * Find all uploaded files for a workNumber
 * @param workNumbers list of workNumbers to find all the uploaded files of
 * @return  uploaded files if any, otherwise an empty array
 */
export async function findUploadedFiles(workNumbers: string[]): Promise<FileFieldsFragment[]> {
  let response;
  try {
    response = await stanCore.FindFiles({ workNumbers });
  } catch (e) {
    console.error('Error in findUploadedFiles');
    return [];
  }
  return response.listFiles;
}

/**
 * Check whether any file has been uploaded to the SGP folder of a workNumber
 * @param workNumber the workNumber whose folder to check
 * @return true if at least one file has been uploaded, otherwise false
 */
export async function hasUploadedFilesInSgpFolder(workNumber: string): Promise<boolean> {
  const files = await findUploadedFiles([workNumber]);
  return files.length > 0;
}
