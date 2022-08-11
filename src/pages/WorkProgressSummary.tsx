import React from 'react';
import { GetWorkSummaryQuery, WorkStatus } from '../types/sdk';

import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';

import DataTable from '../components/DataTable';
import { Column } from 'react-table';
import { alphaNumericSortDefault, statusSort } from '../types/stan';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useDownload } from '../lib/hooks/useDownload';
import { getTimestampStr } from '../lib/helpers';

type WorkProgressSummaryTableEntry = {
  status: WorkStatus;
  workType: string;
  numWorks: number;
  totalNumBlocks: number;
  totalNumSlides: number;
  totalNumOriginalSamples: number;
};
type WorkProgressSummaryProps = {
  summaryData: GetWorkSummaryQuery;
};
const WorkProgressSummary = ({ summaryData }: WorkProgressSummaryProps) => {
  const sortedTableDataRef = React.useRef<WorkProgressSummaryTableEntry[]>([]);
  const [downloadFileURL, setFileDownloadURL] = React.useState<string>('');
  const [workProgressSummaryData, setWorkProgressSummaryData] = React.useState<WorkProgressSummaryTableEntry[]>([]);

  React.useEffect(() => {
    setWorkProgressSummaryData(
      summaryData.worksSummary.map((data) => {
        return {
          workType: data.workType.name,
          status: data.status,
          numWorks: data.numWorks,
          totalNumBlocks: data.totalNumBlocks,
          totalNumSlides: data.totalNumSlides,
          totalNumOriginalSamples: data.totalNumOriginalSamples
        };
      })
    );
  }, [summaryData, setWorkProgressSummaryData]);
  /**
   * Rebuild the file object whenever the searchResult changes
   */
  const downloadData = React.useMemo(() => {
    return {
      columnData: {
        columns: columns
      },
      entries: workProgressSummaryData ?? []
    };
  }, [workProgressSummaryData]);

  const { downloadURL, requestDownload, extension } = useDownload(downloadData);

  React.useEffect(() => {
    setFileDownloadURL(downloadURL);
  }, [downloadURL, setFileDownloadURL]);

  /**
   * Rebuild the blob object on download action
   */
  const handleDownload = React.useCallback(() => {
    let data = sortedTableDataRef.current ? sortedTableDataRef.current : workProgressSummaryData ?? [];
    const fileurl = requestDownload({
      columnData: {
        columns: columns
      },
      entries: data
    });
    setFileDownloadURL(fileurl);
  }, [workProgressSummaryData, requestDownload]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Spatial Genomics Platform Status</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          {workProgressSummaryData.length > 0 ? (
            <>
              <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
                <p className="text-sm text-gray-700">Records</p>
                <a
                  href={downloadFileURL}
                  download={`${getTimestampStr()}_Summary${extension}`}
                  onClick={handleDownload}
                >
                  <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
                </a>
              </div>
              <DataTable
                sortable
                defaultSort={[
                  {
                    id: 'workType',
                    desc: false
                  },
                  {
                    id: 'status',
                    desc: false
                  },
                ]}
                columns={columns}
                data={workProgressSummaryData}
                ref={sortedTableDataRef}
              />
            </>
          ) : (
            <Warning message={'There were no results for the given search. Please try again.'} />
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default WorkProgressSummary;
const columns: Column<WorkProgressSummaryTableEntry>[] = [
  {
    Header: 'Work Type',
    accessor: 'workType',
    sortType: (rowA, rowB) => {
      return alphaNumericSortDefault(rowA.original.workType, rowB.original.workType);
    }
  },
  {
    Header: 'Status',
    accessor: 'status',
    sortType: (rowA, rowB) => {
      return statusSort(rowA.original.status, rowB.original.status);
    }
  },
  {
    Header: 'Number of Work Requests',
    accessor: 'numWorks'
  },
  {
    Header: 'Total Number of Blocks',
    accessor: 'totalNumBlocks'
  },
  {
    Header: 'Total Number of Slides',
    accessor: 'totalNumSlides'
  },
  {
    Header: 'Total Number of Original Samples',
    accessor: 'totalNumOriginalSamples'
  }
];
