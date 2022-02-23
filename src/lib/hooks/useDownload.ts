import { Column } from "react-table";
import {
  StringKeyedProps,
  createDownloadFileContentFromObjectKeys,
  createDownloadFileContent,
} from "../helpers";
import React, { useState } from "react";

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

const isColumnData = (x: any): x is ColumnData<any> =>
  Object.keys(x).includes("columns");
const isColumnTextData = (x: any): x is ColumnTextData =>
  Object.keys(x).includes("columnAccessPath");
const isTextData = (x: any): x is ColumnTextData =>
  Object.keys(x).includes("columnNames");

type DownloadProps<T extends StringKeyedProps> = {
  columnData: ColumnDataType<T>;
  entries: Array<T> | Array<Array<string>>;
  delimiter?: string;
};

export function useDownload<T>({
  columnData,
  entries,
  delimiter,
}: DownloadProps<T>) {
  const [downloadURL, setDownloadURL] = useState<string>(
    URL.createObjectURL(new Blob())
  );

  const requestDownload = React.useCallback(
    (downloadProps: DownloadProps<T>) => {
      let delimiterVal = downloadProps.delimiter;
      if (!delimiterVal) {
        delimiterVal = "\t";
      }
      if (isColumnData(downloadProps.columnData)) {
        return new Blob([
          createDownloadFileContent(
            downloadProps.columnData.columns,
            downloadProps.entries,
            delimiterVal
          ),
        ]);
      } else if (isColumnTextData(downloadProps.columnData)) {
        return new Blob([
          createDownloadFileContentFromObjectKeys(
            downloadProps.columnData.columnNames,
            downloadProps.columnData.columnAccessPath,
            downloadProps.entries,
            delimiterVal
          ),
        ]);
      } else if (isTextData(downloadProps.columnData)) {
        const colNames = downloadProps.columnData.columnNames.join(
          delimiterVal
        );
        const values = downloadProps.entries
          .map((entry) => {
            return Array.isArray(entry) ? entry.join(delimiterVal) : "";
          })
          .join("\n");
        const downloadData = `${colNames}\n${values}`;
        return new Blob([downloadData]);
      }
      return new Blob([]);
    },
    []
  );

  const downloadFile = React.useMemo(() => {
    return requestDownload({ columnData, entries, delimiter });
  }, [entries, delimiter, columnData, requestDownload]);

  /**
   * Whenever the workWithCommentsFile file changes we need to rebuild the download URL
   */
  React.useEffect(() => {
    const downloadFileURL = URL.createObjectURL(downloadFile);
    setDownloadURL(downloadFileURL);
    /**
     * Cleanup function that revokes the URL when it's no longer needed
     */
    return () => URL.revokeObjectURL(downloadFileURL);
  }, [downloadFile, setDownloadURL]);

  return { downloadURL, requestDownload };
}
