import React from "react";
import {
  FindWorkProgressQueryVariables,
  FindWorkProgressQueryVariables as WorkProgressQueryInput,
  WorkStatus,
} from "../types/sdk";

import AppShell from "../components/AppShell";
import { safeParseQueryString } from "../lib/helpers";
import searchMachine from "../lib/machines/search/searchMachine";
import { useMachine } from "@xstate/react";
import Warning from "../components/notifications/Warning";
import {
  WorkProgressResultTableEntry,
  WorkProgressService,
} from "../lib/services/workProgressService";

import DataTable from "../components/DataTable";
import { ClientError } from "graphql-request";
import { Column } from "react-table";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import { SearchResultsType } from "../types/stan";
import { useLocation } from "react-router-dom";
import WorkProgressInput, {
  workProgressSearchSchema,
  WorkProgressSearchType,
} from "../components/workProgress/WorkProgressInput";

/**
 * Data structure to keep the data associated with this component
 */
export type WorkProgressUrlParams = {
  searchType: string;
  searchValues: string[] | undefined;
};
const defaultInitialValues: WorkProgressUrlParams = {
  searchType: WorkProgressSearchType.WorkNumber,
  searchValues: undefined,
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

  const workProgressMachine = searchMachine<
    FindWorkProgressQueryVariables,
    WorkProgressResultTableEntry
  >(new WorkProgressService());
  const [current, send] = useMachine(() =>
    workProgressMachine.withContext({
      findRequest: formatInputData(defaultInitialValues),
    })
  );

  /**
   * The deserialized URL search params
   */
  const memoUrlParams = React.useMemo(() => {
    /**
     *Schema to validate the deserialized URL search params
     */

    const params = safeParseQueryString<WorkProgressUrlParams>({
      query: location.search,
      schema: workProgressSearchSchema(workTypes),
    });
    if (params) {
      return {
        ...defaultInitialValues,
        ...params,
      };
    } else return params;
  }, [location.search, workTypes]);

  /**
   * When the URL search params change, send an event to the machine
   */
  React.useEffect(() => {
    if (
      !memoUrlParams ||
      !memoUrlParams.searchValues ||
      memoUrlParams.searchValues.length <= 0
    )
      return;
    send({ type: "FIND", request: formatInputData(memoUrlParams) });
  }, [memoUrlParams, send]);

  const {
    serverError,
    searchResult,
  }: {
    serverError?: ClientError | undefined | null;
    searchResult?: SearchResultsType<WorkProgressResultTableEntry>;
  } = current.context;

  /**
   * Convert the data associated with the form to query input data structure.
   * @param workProgressUrl
   */
  function formatInputData(
    workProgressUrl: WorkProgressUrlParams
  ): WorkProgressQueryInput {
    const queryInput: WorkProgressQueryInput = {
      workNumber: undefined,
      workTypes: undefined,
      statuses: undefined,
    };
    switch (workProgressUrl.searchType) {
      case WorkProgressSearchType.WorkNumber: {
        queryInput.workNumber =
          workProgressUrl.searchValues &&
          workProgressUrl.searchValues.length > 0
            ? workProgressUrl.searchValues[0]
            : "";
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
        <AppShell.Title>STAN</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <WorkProgressInput
            urlParams={memoUrlParams ?? defaultInitialValues}
            workTypes={workTypes}
          />
          <div className={"my-10 mx-auto max-w-screen-xl"}>
            {serverError && (
              <Warning message="Search Error" error={serverError} />
            )}
            <div className="my-10">
              {current.matches("searching") && (
                <div className="flex flex-row justify-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
            {current.matches("searched") ? (
              searchResult && searchResult.entries.length > 0 ? (
                <DataTable
                  sortable
                  defaultSort={[
                    //Sort by Status and within status sort with WorkNumber in descending order
                    {
                      id: "status",
                      desc: false,
                    },
                    {
                      id: "workNumber",
                      desc: true,
                    },
                  ]}
                  columns={columns}
                  data={searchResult.entries}
                />
              ) : (
                <Warning
                  message={
                    "There were no results for the given search. Please try again."
                  }
                />
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
const getDateSortType = (
  rowADate: Date | undefined,
  rowBDate: Date | undefined
) => {
  if (rowADate && rowBDate) {
    return rowADate.getTime() - rowBDate.getTime();
  }
  if (rowADate) return 1;
  return 0;
};
/**
 * Sort functionality for Status. The status need to be sorted in the order "active", "completed", "paused", "failed"
 * @param rowAStatus
 * @param rowBStatus
 */
const getStatusSortType = (rowAStatus: WorkStatus, rowBStatus: WorkStatus) => {
  const statusArray: WorkStatus[] = [
    WorkStatus.Active,
    WorkStatus.Completed,
    WorkStatus.Paused,
    WorkStatus.Failed,
    WorkStatus.Unstarted,
  ];
  return (
    statusArray.findIndex((val) => val === rowAStatus) -
    statusArray.findIndex((val) => val === rowBStatus)
  );
};

const columns: Column<WorkProgressResultTableEntry>[] = [
  {
    Header: "SGP/R&D Number",
    accessor: "workNumber",
    sortType: (rowA, rowB) => {
      const displayNameA = rowA.original.workNumber;
      const displayNameB = rowB.original.workNumber;
      if (displayNameA && displayNameB) {
        if (displayNameA > displayNameB) return 1;
        if (displayNameA < displayNameB) return -1;
        return 0;
      }
      if (displayNameA && !displayNameB) return 1;
      if (!displayNameA && displayNameB) return -1;
      return 0;
    },
  },
  {
    Header: "Work Type",
    accessor: "workType",
  },
  {
    Header: "Project",
    accessor: "project",
  },
  {
    Header: "Status",
    accessor: "status",
    sortType: (rowA, rowB) => {
      return getStatusSortType(rowA.original.status, rowB.original.status);
    },
  },
  {
    Header: "Last Sectioning Date",
    accessor: (originalRow) =>
      originalRow.lastSectionDate &&
      originalRow.lastSectionDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastSectionDate,
        rowB.original.lastSectionDate
      );
    },
  },
  {
    Header: "Last Staining Date",
    accessor: (originalRow) =>
      originalRow.lastStainingDate &&
      originalRow.lastStainingDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastStainingDate,
        rowB.original.lastStainingDate
      );
    },
  },
  {
    Header: "Last RNAscope/IHC staining Date",
    accessor: (originalRow) =>
      originalRow.lastRNAScopeIHCStainDate &&
      originalRow.lastRNAScopeIHCStainDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastRNAScopeIHCStainDate,
        rowB.original.lastRNAScopeIHCStainDate
      );
    },
  },
  {
    Header: "Last Visium LP Staining Date",
    accessor: (originalRow) =>
      originalRow.lastStainLPDate &&
      originalRow.lastStainLPDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastStainLPDate,
        rowB.original.lastStainLPDate
      );
    },
  },
  {
    Header: "Last Visium TO Staining Date",
    accessor: (originalRow) =>
      originalRow.lastStainTODate &&
      originalRow.lastStainTODate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastStainTODate,
        rowB.original.lastStainTODate
      );
    },
  },
  {
    Header: "Last RNA Extraction Date",
    accessor: (originalRow) =>
      originalRow.lastRNAExtractionDate &&
      originalRow.lastRNAExtractionDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastRNAExtractionDate,
        rowB.original.lastRNAExtractionDate
      );
    },
  },
  {
    Header: "Last RNA Analysis Date",
    accessor: (originalRow) =>
      originalRow.lastRNAAnalysisDate &&
      originalRow.lastRNAAnalysisDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastRNAAnalysisDate,
        rowB.original.lastRNAAnalysisDate
      );
    },
  },
  {
    Header: "Last cDNA Transfer Date",
    accessor: (originalRow) =>
      originalRow.lastCDNADate && originalRow.lastCDNADate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastCDNADate,
        rowB.original.lastCDNADate
      );
    },
  },
  {
    Header: "Last Imaging Date",
    accessor: (originalRow) =>
      originalRow.lastSlideImagedDate &&
      originalRow.lastSlideImagedDate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastSlideImagedDate,
        rowB.original.lastSlideImagedDate
      );
    },
  },
];
