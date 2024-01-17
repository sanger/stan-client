import React, { useMemo } from 'react';
import {
  FindWorkProgressQueryVariables,
  FindWorkProgressQueryVariables as WorkProgressQueryInput,
  GetWorkProgressInputsQuery,
  WorkStatus
} from '../types/sdk';

import AppShell from '../components/AppShell';
import { getTimestampStr, safeParseQueryString } from '../lib/helpers';
import searchMachine from '../lib/machines/search/searchMachine';
import { useMachine } from '@xstate/react';
import Warning from '../components/notifications/Warning';
import { WorkProgressResultTableEntry, WorkProgressService } from '../lib/services/workProgressService';

import DataTable from '../components/DataTable';
import { CellProps, Column } from 'react-table';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import { alphaNumericSortDefault, SearchResultsType, ServerErrors, statusSort } from '../types/stan';
import { useLoaderData, useLocation } from 'react-router-dom';
import WorkProgressInput, { workProgressSearchSchema } from '../components/workProgress/WorkProgressInput';
import StyledLink from '../components/StyledLink';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useDownload } from '../lib/hooks/useDownload';
import Heading from '../components/Heading';
import { useAuth } from '../context/AuthContext';
import TopScrollingBar from '../components/TopScrollingBar';
/**
 * Data structure to keep the data associated with this component
 */
export type WorkProgressUrlParams = {
  workNumber?: string;
  programs?: string[];
  statuses?: string[];
  workTypes?: string[];
  requesters?: string[];
};
const defaultInitialValues: WorkProgressUrlParams = {
  workNumber: undefined,
  programs: undefined,
  statuses: undefined,
  workTypes: undefined,
  requesters: undefined
};
type WorkProgressProps = {
  workTypes: string[];
  programs: string[];
  requesters: string[];
};
/**
 *
 * Example URL search params for the page e.g.
 * http://localhost:3000/?programs[]=program_1&programs[]=program_2&workNumber=SGP1008
 * */
const WorkProgress = () => {
  const location = useLocation();
  const workProgress = useLoaderData() as GetWorkProgressInputsQuery;

  const workProgressMachine = useMemo(
    () =>
      searchMachine<FindWorkProgressQueryVariables, WorkProgressResultTableEntry>(new WorkProgressService(), {
        findRequest: formatInputData(defaultInitialValues)
      }),
    []
  );
  const [current, send] = useMachine(workProgressMachine);

  const {
    serverError,
    searchResult
  }: {
    serverError?: ServerErrors | undefined | null;
    searchResult?: SearchResultsType<WorkProgressResultTableEntry>;
  } = current.context;
  const sortedTableDataRef = React.useRef<WorkProgressResultTableEntry[]>([]);
  const [downloadFileURL, setFileDownloadURL] = React.useState<string>('');

  const auth = useAuth();

  const memoWorkProgress = React.useMemo(() => {
    const retWorkProgress: WorkProgressProps = {
      workTypes: [],
      programs: [],
      requesters: []
    };
    if (!retWorkProgress) return retWorkProgress;
    if (workProgress.workTypes) {
      retWorkProgress.workTypes = workProgress.workTypes?.map((workType) => workType.name);
    }
    if (workProgress.programs) {
      retWorkProgress.programs = workProgress.programs?.map((program) => program.name);
    }
    if (workProgress.releaseRecipients) {
      retWorkProgress.requesters = workProgress.releaseRecipients?.map((recipient) => recipient.username);
    }
    return retWorkProgress;
  }, [workProgress]);
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
      schema: workProgressSearchSchema(
        memoWorkProgress.workTypes,
        memoWorkProgress.programs,
        memoWorkProgress.requesters
      )
    });
    if (params) {
      return {
        ...defaultInitialValues,
        ...params
      };
    } else return params;
  }, [location.search, memoWorkProgress]);

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
    if (
      !memoUrlParams ||
      (!memoUrlParams.workNumber &&
        !memoUrlParams.workTypes &&
        !memoUrlParams.programs &&
        !memoUrlParams.statuses &&
        !memoUrlParams.requesters)
    ) {
      return;
    }
    const value = formatInputData(memoUrlParams);
    send({ type: 'FIND', request: value });
  }, [memoUrlParams, send]);

  /**
   * Convert the data associated with the form to query input data structure.
   * @param workProgressUrl
   */
  function formatInputData(workProgressUrl: WorkProgressUrlParams): WorkProgressQueryInput {
    return {
      workNumber: workProgressUrl.workNumber ?? undefined,
      workTypes: workProgressUrl.workTypes ?? undefined,
      statuses: workProgressUrl.statuses ? (workProgressUrl.statuses as WorkStatus[]) : undefined,
      programs: workProgressUrl.programs ?? undefined,
      requesters: workProgressUrl.requesters ?? undefined
    };
  }
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <div className="mx-auto flex flex-row max-w-screen-lg mt-2 my-6 rounded-md space-x-4">
            <div
              className={
                'flex flex-col w-full border border-gray-200 bg-gray-100 p-4 gap-y-4 text-lg shadow-lg hover:shadow-2xl'
              }
            >
              <Heading level={3} showBorder={false}>
                Summary Dashboard
              </Heading>
              <div className={'mx-auto flex w-full p-4 rounded-md justify-center bg-gray-400 shadow-sm'}>
                <StyledLink to={`work_progress_summary`} className={'text-md'}>
                  Spatial Genomics Platform Status
                </StyledLink>
              </div>
            </div>
            <div
              className={
                'flex flex-col w-full border border-gray-200 bg-gray-100 p-4 gap-y-4 text-lg shadow-lg hover:shadow-2xl'
              }
            >
              <Heading level={3} showBorder={false}>
                Work request
              </Heading>
              <div className={'mx-auto flex w-full p-4 rounded-md justify-center bg-gray-400'}>
                <StyledLink
                  to={`${auth.isAuthenticated() ? 'sgp' : 'login'}`}
                  state={{ referrer: '/sgp' }}
                  className={'text-md'}
                >
                  Allocate SGP Number
                </StyledLink>
              </div>
            </div>
          </div>

          <WorkProgressInput
            urlParams={memoUrlParams ?? defaultInitialValues}
            workTypes={memoWorkProgress.workTypes}
            programs={memoWorkProgress.programs}
            requesters={memoWorkProgress.requesters}
          />

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
                    <p className="text-sm text-gray-700">Search records</p>
                    <a
                      href={downloadFileURL}
                      download={`${getTimestampStr()}_dashboard_search_${extension}`}
                      onClick={handleDownload}
                    >
                      <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
                    </a>
                  </div>
                  <TopScrollingBar>
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
                      fixedHeader={true}
                    />
                  </TopScrollingBar>
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
  props: CellProps<WorkProgressResultTableEntry>,
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
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => {
      const workNumber = props.row.original.workNumber;
      return (
        <StyledLink to={`/history/?workNumber=${workNumber ? encodeURIComponent(workNumber) : workNumber}`}>
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
    Header: 'Status Comment',
    accessor: 'workComment'
  },
  {
    Header: 'Work Requester',
    accessor: 'workRequester',
    sortType: (rowA, rowB) => {
      if (rowA.original.workRequester && rowB.original.workRequester) {
        return alphaNumericSortDefault(rowA.original.workRequester, rowB.original.workRequester);
      } else if (rowA.original.workRequester && !rowB.original.workRequester) {
        return 1;
      } else if (!rowA.original.workRequester && rowB.original.workRequester) {
        return -1;
      }
      return 0;
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
    Header: 'Omero Project',
    accessor: 'omeroProject'
  },
  {
    Header: 'Program',
    accessor: 'program'
  },
  {
    Header: 'Most Recent Operation',
    accessor: 'mostRecentOperation'
  },
  {
    Header: 'Last Sectioning Date',
    accessor: 'lastSectionDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastSectionDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastSectionDate, rowB.original.lastSectionDate);
    }
  },
  {
    Header: 'Last Staining Date',
    accessor: 'lastStainingDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastStainingDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastStainingDate, rowB.original.lastStainingDate);
    }
  },
  {
    Header: 'Last RNAscope/IHC Staining Date',
    accessor: 'lastRNAScopeIHCStainDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRNAScopeIHCStainDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRNAScopeIHCStainDate, rowB.original.lastRNAScopeIHCStainDate);
    }
  },
  {
    Header: 'Last Imaging Date',
    accessor: 'lastSlideImagedDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastSlideImagedDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastSlideImagedDate, rowB.original.lastSlideImagedDate);
    }
  },
  {
    Header: 'Last RNA Extraction Date',
    accessor: 'lastRNAExtractionDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRNAExtractionDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRNAExtractionDate, rowB.original.lastRNAExtractionDate);
    }
  },
  {
    Header: 'Last RNA Analysis Date',
    accessor: 'lastRNAAnalysisDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastRNAAnalysisDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRNAAnalysisDate, rowB.original.lastRNAAnalysisDate);
    }
  },
  {
    Header: 'Last Visium ADH Stain Date',
    accessor: 'lastVisiumADHStainDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastVisiumADHStainDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastVisiumADHStainDate, rowB.original.lastVisiumADHStainDate);
    }
  },
  {
    Header: 'Last Visium TO Staining Date',
    accessor: 'lastStainTODate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastStainTODate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastStainTODate, rowB.original.lastStainTODate);
    }
  },
  {
    Header: 'Last Visium LP Staining Date',
    accessor: 'lastStainLPDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastStainLPDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastStainLPDate, rowB.original.lastStainLPDate);
    }
  },
  {
    Header: 'Last cDNA Transfer Date',
    accessor: 'lastCDNADate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastCDNADate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastCDNADate, rowB.original.lastCDNADate);
    }
  },
  {
    Header: 'Last Date 96 Well Plate Released',
    accessor: 'lastRelease96WellPlateData',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) =>
      formatDateFieldDisplay(props, 'lastRelease96WellPlateData'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastRelease96WellPlateData, rowB.original.lastRelease96WellPlateData);
    }
  },
  {
    Header: 'Last Xenium Probe Hybridisation Date',
    accessor: 'lastXeniumProbeHybridisationDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) =>
      formatDateFieldDisplay(props, 'lastXeniumProbeHybridisationDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastXeniumProbeHybridisationDate,
        rowB.original.lastXeniumProbeHybridisationDate
      );
    }
  },
  {
    Header: 'Last Xenium Analyser Date',
    accessor: 'lastXeniumAnalyserDate',
    Cell: (props: CellProps<WorkProgressResultTableEntry>) => formatDateFieldDisplay(props, 'lastXeniumAnalyserDate'),
    sortType: (rowA, rowB) => {
      return getDateSortType(rowA.original.lastXeniumAnalyserDate, rowB.original.lastXeniumAnalyserDate);
    }
  }
];
