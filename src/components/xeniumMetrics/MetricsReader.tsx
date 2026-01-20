import React from 'react';
import { Input } from '../forms/Input';
import BlueButton from '../buttons/BlueButton';
import LoadingSpinner from '../icons/LoadingSpinner';
import FileIcon from '../icons/FileIcon';
import FailIcon from '../icons/FailIcon';
import UploadIcon from '../icons/UploadIcon';
import PassIcon from '../icons/PassIcon';
import { useFormikContext } from 'formik';
import { Metric, XeniumMetricsForm } from '../../pages/XeniumMetrics';
import Papa from 'papaparse';

interface FileParserProps {
  rowIndex: number;
}

const MetricsReader = ({ rowIndex }: FileParserProps) => {
  const { setFieldValue, setValues, values } = useFormikContext<XeniumMetricsForm>();
  /**Callback function to handle file change**/
  const onFileChange = React.useCallback(
    async (evt: React.ChangeEvent<HTMLInputElement>) => {
      if (!evt.currentTarget.files || evt.currentTarget.files.length <= 0) return;
      const uploadedFile = evt.currentTarget.files[0];
      if (uploadedFile.type !== 'text/csv') {
        await setValues((prev) => {
          return {
            ...prev,
            sectionsMetricData: prev.sectionsMetricData.map((data, index) => {
              if (index === rowIndex) {
                return {
                  ...data,
                  file: undefined,
                  uploadResult: {
                    error: new Error('File type not supported. Please upload a CSV file.'),
                    success: false,
                    file: uploadedFile
                  },
                  uploadInProgress: undefined,
                  metrics: []
                };
              }
              return data;
            })
          };
        });
        return;
      }
      await setValues((prev) => {
        return {
          ...prev,
          sectionsMetricData: prev.sectionsMetricData.map((data, index) => {
            if (index === rowIndex) {
              return {
                ...data,
                file: uploadedFile,
                uploadResult: undefined,
                metrics: []
              };
            }
            return data;
          })
        };
      });
    },
    [setValues, rowIndex]
  );

  /**Handler for 'Upload' button click**/
  const onUploadAction = React.useCallback(async () => {
    if (!values.sectionsMetricData[rowIndex].file) return;
    await setFieldValue(`sectionsMetricData[${rowIndex}].uploadInProgress`, { progress: true });
    Papa.parse(values.sectionsMetricData[rowIndex].file as File, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results, parser) {
        if (results.errors.length > 0) {
          await setFieldValue(`sectionsMetricData[${rowIndex}].uploadResult`, {
            error: new Error(
              'Error while parsing the uploaded file: ' + results.errors.map((error) => error.message).join(', ')
            ),
            success: false
          });
          return;
        } else {
          const metrics: Metric[] = [];
          results.data.forEach((row) => {
            Object.keys(row as Record<string, string>).forEach((key) => {
              metrics.push({
                name: key,
                value: (row as Record<string, string>)[key]
              });
            });
          });
          await setValues((prev) => {
            return {
              ...prev,
              sectionsMetricData: prev.sectionsMetricData.map((data, index) => {
                if (index === rowIndex) {
                  return {
                    ...data,
                    uploadResult: {
                      error: undefined,
                      success: true,
                      file: values.sectionsMetricData[rowIndex].file!
                    },
                    uploadInProgress: undefined,
                    metrics: metrics
                  };
                }
                return data;
              })
            };
          });
        }
      }
    });
  }, [setFieldValue, setValues, rowIndex, values.sectionsMetricData]);

  const onRemoveFile = React.useCallback(async () => {
    await setValues((prev) => {
      return {
        ...prev,
        sectionsMetricData: prev.sectionsMetricData.map((data, index) => {
          if (index === rowIndex) {
            return {
              ...data,
              uploadResult: undefined,
              uploadInProgress: undefined,
              metrics: [],
              file: undefined
            };
          }
          return data;
        })
      };
    });
  }, [setValues, rowIndex]);

  return (
    <div className={'max-w-80 border border-gray-200 bg-gray-100 rounded-md pr-4 pl-4'}>
      <div className="flex flex-col border-b-2 border-gray-200 space-x-6 py-2" data-testid={'upload'}>
        <div className="grid grid-cols-3">
          <div className="flex flex-row space-x-4 col-span-2">
            <Input
              type="file"
              id={`file-${rowIndex}`}
              onChange={onFileChange}
              data-testid="file-input"
              className="hidden disabled:bg-gray-100"
            />
            <label
              htmlFor={`file-${rowIndex}`}
              className={
                'bg-white text-gray-400 disabled:cursor-not-allowed whitespace-nowrap  py-2 px-4 rounded w-32 text-center'
              }
            >
              Select file...
            </label>
          </div>
          <BlueButton
            miniButton
            type={'button'}
            disabled={
              !values.sectionsMetricData[rowIndex].file ||
              values.sectionsMetricData[rowIndex].uploadInProgress?.progress ||
              values.sectionsMetricData[rowIndex].metrics.length > 0
            }
            onClick={onUploadAction}
            data-testid={'upload-btn'}
            id={`upload-btn-${rowIndex}`}
          >
            <UploadIcon
              className={
                !values.sectionsMetricData[rowIndex].file ? 'text-gray-300 disabled:cursor-not-allowed' : 'text-white'
              }
            />
          </BlueButton>
        </div>
      </div>

      {values.sectionsMetricData[rowIndex].file && (
        <div data-testid={'file-description'} className={'p-2 border-b-2 border-gray-200 bg-white'}>
          <div key={`${values.sectionsMetricData[rowIndex].file?.name}`} className={'flex flex-row justify-between'}>
            <div className="flex">
              <div>
                <FileIcon data-testid={'fileIcon'} className={'mr-2 text-gray-600'} />
              </div>
              <span className={'whitespace-nowrap'}>{values.sectionsMetricData[rowIndex].file?.name}</span>
              <div className="flex p-1 space-x-4">
                {values.sectionsMetricData[rowIndex].uploadResult?.success ? (
                  <PassIcon className={'h-4 w-4 text-green-600'} />
                ) : (
                  <FailIcon
                    className={'h-4 w-4 cursor-pointer text-black  hover:bg-gray-200 '}
                    onClick={() => onRemoveFile()}
                  />
                )}
              </div>
            </div>
            <div className={'flex justify-end p-2 space-x-4'}>
              {values.sectionsMetricData[rowIndex].uploadResult?.success && (
                <div className="grid grid-cols-2 justify-end">
                  <FailIcon
                    className={'h-4 w-4 cursor-pointer text-red-500 hover:bg-gray-200 '}
                    onClick={() => onRemoveFile()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {values.sectionsMetricData[rowIndex].uploadResult?.error && (
        <div
          data-testid={'error-div'}
          className={'flex flex-col text-red-600 text-sm p-2 border-b-2 border-gray-200 bg-white'}
        >
          Error:
          {values.sectionsMetricData[rowIndex].uploadResult?.error?.message}
        </div>
      )}

      {values.sectionsMetricData[rowIndex].uploadInProgress?.progress && (
        <div className="flex flex-row whitespace-nowrap p-4 space-x-6 justify-start">
          <div className={'text-blue-600 text-sm'}>{'Uploading in progress...'}</div>
          <LoadingSpinner className={'w-3 h-3 mt-1 text-blue-600'} />
        </div>
      )}
    </div>
  );
};

export default MetricsReader;
