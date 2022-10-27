import React from 'react';
import { GetWorkSummaryQuery, WorkStatus } from '../types/sdk';

import AppShell from '../components/AppShell';
import Warning from '../components/notifications/Warning';

import DataTable from '../components/DataTable';
import { Cell, Column } from 'react-table';
import { alphaNumericSortDefault } from '../types/stan';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useDownload } from '../lib/hooks/useDownload';
import { getTimestampStr, safeParseQueryString } from '../lib/helpers';
import WorkProgressInput, {
  workProgressSearchSchema,
  WorkProgressSearchType
} from '../components/workProgress/WorkProgressInput';
import { useLocation } from 'react-router-dom';
import { WorkProgressUrlParams } from './WorkProgress';
import BlueButton from '../components/buttons/BlueButton';
import { history } from '../lib/sdk';

const defaultInitialValues: WorkProgressUrlParams = {
  searchType: WorkProgressSearchType.WorkType,
  searchValues: undefined
};

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
  const [workTypes, setWorkTypes] = React.useState<string[]>([]);
  const location = useLocation();

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

  /**
   * Build the worktypes list
   */
  React.useEffect(() => {
    setWorkTypes(summaryData.worksSummary.workTypes.map((data) => data.name));
  }, [summaryData]);

  const { downloadURL, requestDownload, extension } = useDownload(downloadData);

  React.useEffect(() => {
    setFileDownloadURL(downloadURL);
  }, [downloadURL, setFileDownloadURL]);

  const memoUrlParams = React.useMemo(() => {
    /**
     *Schema to validate the deserialized URL search params
     */
    const params = safeParseQueryString<WorkProgressUrlParams>({
      query: location.search,
      schema: workProgressSearchSchema(workTypes)
    });
    if (params) {
      return {
        ...defaultInitialValues,
        ...params
      };
    } else return params;
  }, [location.search, workTypes]);

  /**
   * Builds the summary table data
   */
  React.useEffect(() => {
    let workSummaryGroups = summaryData.worksSummary.workSummaryGroups.map((data) => {
      return {
        workType: data.workType.name,
        status: data.status,
        numWorks: data.numWorks,
        totalNumBlocks: data.totalNumBlocks,
        totalNumSlides: data.totalNumSlides,
        totalNumOriginalSamples: data.totalNumOriginalSamples
      };
    });
    workSummaryGroups = memoUrlParams ? filterWorkSummary(workSummaryGroups, memoUrlParams) : workSummaryGroups;
    setWorkProgressSummaryData(workSummaryGroups);
  }, [summaryData, setWorkProgressSummaryData, memoUrlParams]);

  /**
   * filters the workSummarGroups based on URL params
   * @param workSummaryGroups
   * @param memoUrlParams
   */
  const filterWorkSummary = (
    workSummaryGroups: WorkProgressSummaryTableEntry[],
    memoUrlParams: { searchType: string; searchValues: string[] | undefined }
  ) => {
    if (
      !memoUrlParams ||
      !memoUrlParams.searchValues ||
      !memoUrlParams.searchType ||
      memoUrlParams.searchValues.length <= 0
    ) {
      return workSummaryGroups;
    }

    switch (memoUrlParams.searchType) {
      case 'Work Type':
        return (workSummaryGroups = workSummaryGroups.filter((group) => {
          return memoUrlParams.searchValues?.includes(group.workType) ? true : false;
        }));
      case 'Status':
        return (workSummaryGroups = workSummaryGroups.filter((group) => {
          return memoUrlParams.searchValues?.includes(group.status) ? true : false;
        }));
      default:
        return workSummaryGroups;
    }
  };

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
        <div className="mx-auto max-w-screen-lg bg-gray-100 border border-gray-200 bg-gray-100 rounded-md">
          <WorkProgressInput
            urlParams={memoUrlParams ?? defaultInitialValues}
            workTypes={workTypes}
            searchTypes={[WorkProgressSearchType.WorkType, WorkProgressSearchType.Status]}
          />
          <div className="flex justify-end px-6 pb-6">
            <BlueButton type="reset" disabled={!memoUrlParams} onClick={() => history.push(location.pathname)}>
              Clear filter
            </BlueButton>
          </div>
        </div>
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
                  }
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

/**
 * Sort functionality for Status in Work Summary page. The status need to be sorted in the order "active", "completed", "paused", "failed"
 * @param rowAStatus
 * @param rowBStatus
 */
export const summaryStatusSort = (rowAStatus: WorkStatus, rowBStatus: WorkStatus) => {
  const statusArray: WorkStatus[] = [
    WorkStatus.Unstarted,
    WorkStatus.Active,
    WorkStatus.Paused,
    WorkStatus.Completed,
    WorkStatus.Failed,
    WorkStatus.Withdrawn
  ];
  return statusArray.findIndex((val) => val === rowAStatus) - statusArray.findIndex((val) => val === rowBStatus);
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
      return summaryStatusSort(rowA.original.status, rowB.original.status);
    }
  },
  {
    Header: 'Number of Work Requests',
    accessor: 'numWorks',
    Cell: (props: Cell<WorkProgressSummaryTableEntry>) => {
      return <p className="text-center">{props.row.original.numWorks}</p>;
    }
  },
  {
    Header: 'Total Number of Blocks',
    accessor: 'totalNumBlocks',
    Cell: (props: Cell<WorkProgressSummaryTableEntry>) => {
      return <p className="text-center">{props.row.original.totalNumBlocks}</p>;
    }
  },
  {
    Header: 'Total Number of Slides',
    accessor: 'totalNumSlides',
    Cell: (props: Cell<WorkProgressSummaryTableEntry>) => {
      return <p className="text-center">{props.row.original.totalNumSlides}</p>;
    }
  },
  {
    Header: 'Total Number of Original Samples',
    accessor: 'totalNumOriginalSamples',
    Cell: (props: Cell<WorkProgressSummaryTableEntry>) => {
      return <p className="text-center">{props.row.original.totalNumOriginalSamples}</p>;
    }
  }
];
