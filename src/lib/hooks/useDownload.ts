import { Column } from 'react-table';
import { StringKeyedProps, createDownloadFileContentFromObjectKeys, createDownloadFileContent } from '../helpers';
import React, { useState } from 'react';
import { write, utils } from 'xlsx';

type ColumnData<T extends StringKeyedProps> = {
  columns: Array<Column<T>>;
};
type ColumnTextData = {
  columnNames: Array<string>;
  columnAccessPath: Array<Array<string>>;
};
type TextData = {
  columnNames: Array<string>;
};
type ColumnDataType<T> = ColumnData<T> | ColumnTextData | TextData;

const isColumnData = (x: any): x is ColumnData<any> => Object.keys(x).includes('columns');
const isColumnTextData = (x: any): x is ColumnTextData => Object.keys(x).includes('columnAccessPath');
const isTextData = (x: any): x is ColumnTextData => Object.keys(x).includes('columnNames');

type DownloadProps<T extends StringKeyedProps> = {
  columnData: ColumnDataType<T>;
  entries: Array<T> | Array<Array<string>>;
};

export function useDownload<T>(downloadPropsInput: DownloadProps<T>) {
  const [downloadURL, setDownloadURL] = useState<string>(URL.createObjectURL(new Blob()));

  /**External request for download**/
  const requestDownload = React.useCallback(
    (downloadProps: DownloadProps<T>): string => {
      const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let downloadData: string[][] = [];
      if (isColumnData(downloadProps.columnData)) {
        downloadData = createDownloadFileContent(downloadProps.columnData.columns, downloadProps.entries);
      }
      if (isColumnTextData(downloadProps.columnData)) {
        downloadData = createDownloadFileContentFromObjectKeys(
          downloadProps.columnData.columnNames,
          downloadProps.columnData.columnAccessPath,
          downloadProps.entries
        );
      }
      if (isTextData(downloadProps.columnData)) {
        const colNames = downloadProps.columnData.columnNames;
        downloadData = downloadProps.entries.map((entry) => {
          return Array.isArray(entry) ? entry : [];
        });
        downloadData.splice(0, 0, colNames);
      }
      const ws = utils.aoa_to_sheet(downloadData);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
      const downloadBlob = new Blob([excelBuffer], { type: fileType });

      const downloadFileURL = URL.createObjectURL(downloadBlob);
      setDownloadURL(downloadFileURL);
      return downloadFileURL;
    },
    [setDownloadURL]
  );

  /**update download properties whenever input parameters change**/
  React.useEffect(() => {
    requestDownload(downloadPropsInput);
  }, [downloadPropsInput, requestDownload]);

  /**
   * Cleanup function that revokes the URL when it's no longer needed
   */
  React.useEffect(() => {
    return () => URL.revokeObjectURL(downloadURL);
  }, [downloadURL]);

  return { downloadURL, requestDownload, extension: '.xlsx' };
}
