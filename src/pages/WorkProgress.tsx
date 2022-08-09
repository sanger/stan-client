import React from 'react';
import {
  FindWorkProgressQueryVariables,
  FindWorkProgressQueryVariables as WorkProgressQueryInput,
  WorkStatus
} from '../types/sdk';

import AppShell from '../components/AppShell';
import { getTimestampStr, safeParseQueryString } from '../lib/helpers';
import searchMachine from '../lib/machines/search/searchMachine';
import { useMachine } from '@xstate/react';
import Warning from '../components/notifications/Warning';
import { WorkProgressResultTableEntry, WorkProgressService } from '../lib/services/workProgressService';

import DataTable from '../components/DataTable';
import { ClientError } from 'graphql-request';
import { Cell, Column } from 'react-table';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import { alphaNumericSortDefault, SearchResultsType, statusSort } from '../types/stan';
import { useLocation } from 'react-router-dom';
import WorkProgressInput, {
  workProgressSearchSchema,
  WorkProgressSearchType
} from '../components/workProgress/WorkProgressInput';
import StyledLink from '../components/StyledLink';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useDownload } from '../lib/hooks/useDownload';
import Heading from '../components/Heading';

/**
 * Data structure to keep the data associated with this component
 */
export type WorkProgressUrlParams = {
  searchType: string;
  searchValues: string[] | undefined;
};
const defaultInitialValues: WorkProgressUrlParams = {
  searchType: WorkProgressSearchType.WorkNumber,
  searchValues: undefined
};

/**
 * Possible URL search params for the page e.g.?searchType=SGP%2FR%26D%20Number&searchValues[]=sgp2
 * or
 * ?searchType=Status&searchValues[]=completed&searchValues[]=active
 * or
 * ?searchType=Work%20Type&searchValues[]=WorkType1&searchValues[]=Worktype2
 * */
const WorkProgress = ({ workTypes }: { workTypes: string[] }) => {
  const location = useLocation();

  const workProgressMachine = searchMachine<FindWorkProgressQueryVariables, WorkProgressResultTableEntry>(
    new WorkProgressService()
  );
  const [current, send] = useMachine(() =>
    workProgressMachine.withContext({
      findRequest: formatInputData(defaultInitialValues)
    })
  );

  const {
    serverError,
    searchResult
  }: {
    serverError?: ClientError | undefined | null;
    searchResult?: SearchResultsType<WorkProgressResultTableEntry>;
  } = current.context;
  const sortedTableDataRef = React.useRef<WorkProgressResultTableEntry[]>([]);
  const [downloadFileURL, setFileDownloadURL] = React.useState<string>('');

  /**
   * Rebuild the file object whenever the searchResult changes
   */
  const downloadData = React.useMemo(() => {
    return {
      columnData: {
        columns: columns
      },
      entries: searchResult ? searchResult.entries : []
    };
  }, [searchResult]);

  const { downloadURL, requestDownload, extension } = useDownload(downloadData);

  React.useEffect(() => {
    setFileDownloadURL(downloadURL);
  }, [downloadURL, setFileDownloadURL]);
  /**
   * The deserialized URL search params
   */
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
   * Rebuild the blob object on download action
   */
  const handleDownload = React.useCallback(() => {
    let data = sortedTableDataRef.current ? sortedTableDataRef.current : searchResult ? searchResult.entries : [];
    const fileurl = requestDownload({
      columnData: {
        columns: columns
      },
      entries: data
    });
    setFileDownloadURL(fileurl);
  }, [searchResult, requestDownload]);

  /**
   * When the URL search params change, send an event to the machine
   */
  React.useEffect(() => {
    if (!memoUrlParams || !memoUrlParams.searchValues || memoUrlParams.searchValues.length <= 0) {
      return;
    }
    send({ type: 'FIND', request: formatInputData(memoUrlParams) });
  }, [memoUrlParams, send]);

  /**
   * Convert the data associated with the form to query input data structure.
   * @param workProgressUrl
   */
  function formatInputData(workProgressUrl: WorkProgressUrlParams): WorkProgressQueryInput {
    const queryInput: WorkProgressQueryInput = {
      workNumber: undefined,
      workTypes: undefined,
      statuses: undefined
    };
    switch (workProgressUrl.searchType) {
      case WorkProgressSearchType.WorkNumber: {
        queryInput.workNumber =
          workProgressUrl.searchValues && workProgressUrl.searchValues.length > 0
            ? workProgressUrl.searchValues[0]
            : '';
        break;
      }
      case WorkProgressSearchType.WorkType: {
        queryInput.workTypes = workProgressUrl.searchValues;
        break;
      }
      case WorkProgressSearchType.Status: {
        queryInput.statuses = workProgressUrl.searchValues as WorkStatus[];
        break;
      }
    }
    return queryInput;
  }

  return (
    <AppShell>
      <AppShell.Header>
        <div className="flex flex-row">
          <AppShell.Title>STAN</AppShell.Title>
        </div>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <div className="mx-auto max-w-screen-lg mt-2 my-6 rounded-md space-y-4">
            <div className={'flex flex-col w-full border border-gray-200 bg-gray-100 p-4 gap-y-4 text-lg'}>
              <Heading level={3} showBorder={false}>
                Summary Dashboard
              </Heading>
              <div className={' mx-auto flex w-full p-4 rounded-md justify-center bg-gray-200'}>
                <StyledLink to={`work_progress_summary`} className={'text-lg'}>
                  Spatial Genomics Platform Status
                </StyledLink>
              </div>
            </div>
          </div>
          <WorkProgressInput urlParams={memoUrlParams ?? defaultInitialValues} workTypes={workTypes} />
          <div className={'my-10 mx-auto max-w-screen-xl'}>
            {serverError && <Warning message="Search Error" error={serverError} />}
            <div className="my-10">
              {current.matches('searching') && (
                <div className="flex flex-row justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
            {current.matches('searched') ? (
              searchResult && searchResult.entries.length > 0 ? (
                <>
                  <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
                    <p className="text-sm text-gray-700">
                      Records for {memoUrlParams?.searchType}
                      <span className="font-medium">
                        {': '}
                        {memoUrlParams?.searchValues && memoUrlParams?.searchValues.length < 4
                          ? memoUrlParams?.searchValues?.join(',')
                          : memoUrlParams?.searchValues?.slice(0, 3).join(',') + ',...'}
                      </span>
                    </p>
                    <a
                      href={downloadFileURL}
                      download={`${getTimestampStr()}_${memoUrlParams?.searchType}_${
                        memoUrlParams?.searchValues && memoUrlParams?.searchValues.length < 4
                          ? memoUrlParams?.searchValues.join('&')
                          : memoUrlParams?.searchValues?.slice(0, 3).join('&') + '&etc'
                      }${extension}`}
                      onClick={handleDownload}
                    >
                      <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
                    </a>
                  </div>
                  <DataTable
                    sortable
                    defaultSort={[
                      //Sort by Status and within status sort with WorkNumber in descending order
                      {
                        id: 'status',
                        desc: false
                      },
                      {
                        id: 'workNumber',
                        desc: true
                      }
                    ]}
                    columns={columns}
                    data={searchResult.entries}
                    ref={sortedTableDataRef}
                  />
                </>
              ) : (
                <Warning message={'There were no results for the given search. Please try again.'} />
              )
            ) : (
              <div />
            )}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default WorkProgress;

/**
 * Sort functionality for Date type
 */
const getDateSortType = (rowADate: Date | undefined, rowBDate: Date | undefined) => {
  if (rowADate && rowBDate) {
    return rowADate.getTime() - rowBDate.getTime();
  }
  if (rowADate) return 1;
  return 0;
};

const formatDateFieldDisplay = (
  props: Cell<WorkProgressResultTableEntry>,
  propName: keyof WorkProgressResultTableEntry
) => {
  if (!Object.keys(props.row.original).find((key) => key === propName)) {
    return <></>;
  } else {
    return (
      <>
        {props.row.original[propName] &&
          props.row.original[propName] instanceof Date &&
          (props.row.original[propName] as Date).toLocaleDateString()}
      </>
    );
  }
};
const columns: Column<WorkProgressResultTableEntry>[] = [
  {
    Header: 'Priority',
    accessor: 'priority'
  },
  {
    Header: 'SGP/R&D Number',
    accessor: 'workNumber',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => {
      const workNumber = props.row.original.workNumber;
      return (
        <StyledLink to={`/history/?kind=workNumber&value=${workNumber ? encodeURIComponent(workNumber) : workNumber}`}>
          {workNumber}
        </StyledLink>
      );
    },
    sortType: (rowA, rowB) => {
      return alphaNumericSortDefault(rowA.original.workNumber, rowB.original.workNumber);
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
    Header: 'Work Requester',
    accessor: 'workRequester',
    sortType: (rowA, rowB) => {
      return statusSort(rowA.original.status, rowB.original.status);
    }
  },
  {
    Header: 'Work Type',
    accessor: 'workType'
  },
  {
    Header: 'Project',
    accessor: 'project'
  },

  {
    Header: 'Last Sectioning Date',
    accessor: 'lastSectionDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastSectionDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastSectionDate, rowB.original.lastSectionDate);
    }
  },
  {
    Header: 'Last Staining Date',
    accessor: 'lastStainingDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastStainingDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastStainingDate, rowB.original.lastStainingDate);
    }
  },
  {
    Header: 'Last RNAscope/IHC staining Date',
    accessor: 'lastRNAScopeIHCStainDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRNAScopeIHCStainDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRNAScopeIHCStainDate, rowB.original.lastRNAScopeIHCStainDate);
    }
  },
  {
    Header: 'Last Imaging Date',
    accessor: 'lastSlideImagedDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastSlideImagedDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastSlideImagedDate, rowB.original.lastSlideImagedDate);
    }
  },
  {
    Header: 'Last RNA Extraction Date',
    accessor: 'lastRNAExtractionDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRNAExtractionDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRNAExtractionDate, rowB.original.lastRNAExtractionDate);
    }
  },
  {
    Header: 'Last RNA Analysis Date',
    accessor: 'lastRNAAnalysisDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRNAAnalysisDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRNAAnalysisDate, rowB.original.lastRNAAnalysisDate);
    }
  },
  {
    Header: 'Last Visium ADH stain date',
    accessor: 'lastVisiumADHStainDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastVisiumADHStainDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastVisiumADHStainDate, rowB.original.lastVisiumADHStainDate);
    }
  },
  {
    Header: 'Last Visium TO Staining Date',
    accessor: 'lastStainTODate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastStainTODate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastStainTODate, rowB.original.lastStainTODate);
    }
  },
  {
    Header: 'Last Visium LP Staining Date',
    accessor: 'lastStainLPDate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastStainLPDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastStainLPDate, rowB.original.lastStainLPDate);
    }
  },
  {
    Header: 'Last cDNA Transfer Date',
    accessor: 'lastCDNADate',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastCDNADate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastCDNADate, rowB.original.lastCDNADate);
    }
  },
  {
    Header: 'Last date 96 well plate Released',
    accessor: 'lastRelease96WellPlateData',
    Cell: (props: Cell<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRelease96WellPlateData'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRelease96WellPlateData, rowB.original.lastRelease96WellPlateData);
    }
  }
];
