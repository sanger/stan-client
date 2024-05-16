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

interface FileParserProps {
  rowIndex: number;
}

/**
 * Parses CSV data into an array of objects where each object represents a row in the CSV file.
 * The keys of each object are column names (extracted from the CSV header), and the values
 * are cell values from the corresponding row.
 * are cell values from the corresponding row.
 *
 * @param csvData The CSV data to parse as a string.
 * @returns An array of objects representing rows in the CSV file, with keys as column names
 * and values as cell values.
 */
const parseCSV = (csvData: string): { [key: string]: string }[] => {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map((header) => header.trim());
  const result: { [key: string]: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: { [key: string]: string } = {};
    if (values.every((value) => value.trim() === '')) {
      continue;
    }
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ? values[j].trim() : '';
    }
    result.push(row);
  }
  return result;
};
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
            sampleMetricData: prev.sampleMetricData.map((data, index) => {
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
          sampleMetricData: prev.sampleMetricData.map((data, index) => {
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
    if (!values.sampleMetricData[rowIndex].file) return;
    await setFieldValue(`sampleMetricData[${rowIndex}].uploadInProgress`, { progress: true });
    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      if (event.target) {
        const result = event.target.result as string;
        const data = parseCSV(result);
        if (data.length === 0) {
          await setFieldValue(`sampleMetricData[${rowIndex}].uploadResult`, {
            error: new Error('Error while parsing the uploaded file'),
            success: false
          });
          return;
        }
        const metrics: Metric[] = [];
        data.forEach((row) => {
          Object.keys(row).forEach((key) => {
            metrics.push({
              name: key,
              value: row[key]
            });
          });
        });
        await setValues((prev) => {
          return {
            ...prev,
            sampleMetricData: prev.sampleMetricData.map((data, index) => {
              if (index === rowIndex) {
                return {
                  ...data,
                  uploadResult: {
                    error: undefined,
                    success: true,
                    file: values.sampleMetricData[rowIndex].file!
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
    };
    reader.readAsText(values.sampleMetricData[rowIndex].file!);
  }, [setFieldValue, setValues, rowIndex, values.sampleMetricData]);

  const onRemoveFile = React.useCallback(async () => {
    await setValues((prev) => {
      return {
        ...prev,
        sampleMetricData: prev.sampleMetricData.map((data, index) => {
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
    <div className={'max-w-32 bg-gray-100 border border-gray-200 bg-gray-100 rounded-md'}>
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
              className={'bg-white text-gray-400 disabled:cursor-not-allowed whitespace-nowrap  py-2 px-4 rounded'}
            >
              Select file...
            </label>
          </div>
          <BlueButton
            miniButton
            type={'button'}
            disabled={
              !values.sampleMetricData[rowIndex].file ||
              values.sampleMetricData[rowIndex].uploadInProgress?.progress ||
              values.sampleMetricData[rowIndex].metrics.length > 0
            }
            onClick={onUploadAction}
            data-testid={'upload-btn'}
            id={`upload-btn-${rowIndex}`}
          >
            <UploadIcon
              className={
                !values.sampleMetricData[rowIndex].file ? 'text-gray-300 disabled:cursor-not-allowed' : 'text-white'
              }
            />
          </BlueButton>
        </div>
      </div>

      {values.sampleMetricData[rowIndex].file && (
        <div data-testid={'file-description'} className={'p-2 border-b-2 border-gray-200 bg-white'}>
          <div key={`${values.sampleMetricData[rowIndex].file?.name}`} className={'flex flex-row justify-between'}>
            <div className="flex">
              <div>
                <FileIcon data-testid={'fileIcon'} className={'mr-2 text-gray-600'} />
              </div>
              <span className={'whitespace-nowrap'}>{values.sampleMetricData[rowIndex].file?.name}</span>
              <div className="flex p-1 space-x-4">
                {values.sampleMetricData[rowIndex].uploadResult?.success ? (
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
              {values.sampleMetricData[rowIndex].uploadResult?.success && (
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
      {values.sampleMetricData[rowIndex].uploadResult?.error && (
        <div
          data-testid={'error-div'}
          className={'flex flex-col text-red-600 text-sm p-2 border-b-2 border-gray-200 bg-white'}
        >
          Error:
          {values.sampleMetricData[rowIndex].uploadResult?.error?.message}
        </div>
      )}

      {values.sampleMetricData[rowIndex].uploadInProgress?.progress && (
        <div className="flex flex-row whitespace-nowrap p-4 space-x-6 justify-start">
          <div className={'text-blue-600 text-sm'}>{'Uploading in progress...'}</div>
          <LoadingSpinner className={'w-3 h-3 mt-1 text-blue-600'} />
        </div>
      )}
    </div>
  );
};

export default MetricsReader;
