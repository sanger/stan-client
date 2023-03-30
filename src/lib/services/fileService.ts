import { FileFieldsFragment } from '../../types/sdk';
import { stanCore } from '../sdk';

/**
 * Find all uploaded files for a workNumber
 * @param workNumbers list od workNumbers to find all the uploaded files of
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
