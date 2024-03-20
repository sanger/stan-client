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
type ColumnDataType<T extends StringKeyedProps> = ColumnData<T> | ColumnTextData | TextData;

const isColumnData = (x: any): x is ColumnData<any> => Object.keys(x).includes('columns');
const isColumnTextData = (x: any): x is ColumnTextData => Object.keys(x).includes('columnAccessPath');
const isTextData = (x: any): x is ColumnTextData => Object.keys(x).includes('columnNames');

type FileType = {
  type: 'excel' | 'graph';
  extension: '.xlsx' | '.html';
};

type DownloadProps<T extends StringKeyedProps> = {
  columnData?: ColumnDataType<T>;
  entries?: Array<T> | Array<Array<string>>;
  graph?: string;
  fileType?: FileType;
};

export const ExcelFileType: FileType = { type: 'excel', extension: '.xlsx' };
export const GraphFileType: FileType = { type: 'graph', extension: '.html' };

const generateDownloadExcelFileUrl = <T extends StringKeyedProps>(
  columnData: ColumnDataType<T>,
  entries: Array<T> | Array<Array<string>>
) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let downloadData: string[][] = [];
  if (isColumnData(columnData)) {
    downloadData = createDownloadFileContent(columnData.columns, entries);
  }
  if (isColumnTextData(columnData)) {
    downloadData = createDownloadFileContentFromObjectKeys(
      columnData.columnNames,
      columnData.columnAccessPath,
      entries
    );
  }
  if (isTextData(columnData)) {
    const colNames = columnData.columnNames;
    downloadData = entries.map((entry) => {
      return Array.isArray(entry) ? entry : [];
    });
    downloadData.splice(0, 0, colNames);
  }
  const ws = utils.aoa_to_sheet(downloadData);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const downloadBlob = new Blob([excelBuffer], { type: fileType });

  return URL.createObjectURL(downloadBlob);
};

const downloadAsHtmlFile = (svgData: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>History Result Graph</title>
    </head>
    <body>
        ${svgData}
    </body>
    </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
};

export function useDownload<T extends StringKeyedProps>({
  columnData,
  entries,
  graph,
  fileType = ExcelFileType
}: DownloadProps<T>) {
  const [downloadURL, setDownloadURL] = useState<string>(URL.createObjectURL(new Blob()));

  /**External request for download**/
  const requestDownload = React.useCallback(async (downloadProps: DownloadProps<T>) => {
    let downloadFileURL: string = '';
    if (downloadProps.fileType === GraphFileType) {
      try {
        downloadFileURL = downloadAsHtmlFile(downloadProps.graph!);
      } catch (error) {
        console.error('Error generating the graph download URL:', error);
      }
    } else {
      downloadFileURL = generateDownloadExcelFileUrl(downloadProps.columnData!, downloadProps.entries!);
    }

    setDownloadURL(downloadFileURL);
    return downloadFileURL;
  }, []);

  /**update download properties whenever input parameters change**/
  React.useEffect(() => {
    requestDownload({ columnData, entries, graph, fileType });
  }, [columnData, entries, graph, fileType, requestDownload]);

  /**
   * Cleanup function that revokes the URL when it's no longer needed
   */
  React.useEffect(() => {
    return () => URL.revokeObjectURL(downloadURL);
  }, [downloadURL]);

  return { downloadURL, requestDownload, extension: fileType?.extension };
}
