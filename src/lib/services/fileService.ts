import { FileFieldsFragment } from '../../types/sdk';
import { stanCore } from '../sdk';

/**
 * Find all uploaded files for a workNumber
 * @param workNumber the workNumber to find all the uploaded files of
 * @return  uploaded files if any, otherwise an empty array
 */
export async function findUploadedFiles(workNumber: string): Promise<FileFieldsFragment[]> {
  let response;
  try {
    response = await stanCore.FindFiles({ workNumber });
  } catch (e) {
    console.error('Error in findUploadedFiles');
    return [];
  }
  return response.listFiles;
}
