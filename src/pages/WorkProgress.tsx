import React, { useState } from "react";
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
import * as Yup from "yup";
import { useLocation } from "react-router-dom";
import WorkProgressInput, {
  filterValidationSchema,
  WorkProgressFilterType,
  workProgressSearchSchema,
  WorkProgressSearchType,
} from "../components/workProgress/WorkProgressInput";

/**
 * Data structure to keep the data associated with this component
 */
export type WorkProgressUrlParams = {
  searchType: string;
  searchValue: string;
  filterType: string;
  filterValues: string[];
};

const defaultInitialValues: WorkProgressUrlParams = {
  searchType: WorkProgressSearchType.WorkNumber,
  searchValue: "",
  filterType: WorkProgressFilterType.Status,
  filterValues: Object.values(WorkStatus),
};

const WorkProgress = ({ workTypes }: { workTypes: string[] }) => {
  const [filter, setFilter] = useState<{ type: string; values: string[] }>({
    type: defaultInitialValues.filterType,
    values: defaultInitialValues.filterValues,
  });
  const [reset, setReset] = React.useState(false);
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
    const validationSchema: Yup.ObjectSchema = Yup.object().shape({
      ...workProgressSearchSchema.fields,
      ...filterValidationSchema(workTypes).fields,
    });

    return safeParseQueryString<WorkProgressUrlParams>(
      {
        query: location.search,
        schema: validationSchema,
      } ?? defaultInitialValues
    );
  }, [location.search, workTypes]);

  /**
   * When the URL search params change, send an event to the machine
   */
  React.useEffect(() => {
    if (!memoUrlParams) return;
    setFilter({
      type: memoUrlParams.filterType,
      values: memoUrlParams.filterValues,
    });
    send({ type: "FIND", request: formatInputData(memoUrlParams) });
    setReset(false);
  }, [memoUrlParams, send, setFilter, setReset]);

  const {
    serverError,
    searchResult,
  }: {
    serverError?: ClientError | undefined | null;
    searchResult?: SearchResultsType<WorkProgressResultTableEntry>;
  } = current.context;

  /**
   * Callback to handle filter action
   */
  const handleFilter = React.useCallback(
    (filterType: string, filterValues: string[]) => {
      setFilter({ type: filterType, values: filterValues });
    },
    [setFilter]
  );

  const handleReset = React.useCallback(() => {
    setReset(true);
  }, [setReset]);

  /***
   * Filter the results
   */
  const filterResults = (
    workProgressResults: WorkProgressResultTableEntry[],
    filter?: { type: string; values: string[] }
  ): WorkProgressResultTableEntry[] => {
    if (!filter) {
      return workProgressResults;
    }
    return workProgressResults.filter(
      (workProgressResult) =>
        filter.values.findIndex((filterValue) => {
          return filter.type === WorkProgressFilterType.WorkType
            ? filterValue === workProgressResult.workType
            : filterValue === workProgressResult.status;
        }) !== -1
    );
  };

  /**
   * Convert the data associated with the form to query input data structure.
   * @param workProgressUrl
   */
  function formatInputData(
    workProgressUrl: WorkProgressUrlParams
  ): WorkProgressQueryInput {
    const queryInput: WorkProgressQueryInput = {
      workNumber: undefined,
      workType: undefined,
      status: undefined,
    };
    switch (workProgressUrl.searchType) {
      case WorkProgressSearchType.WorkNumber: {
        queryInput.workNumber = workProgressUrl.searchValue;
        break;
      }
      case WorkProgressSearchType.WorkType: {
        queryInput.workType = workProgressUrl.searchValue;
        break;
      }
      case WorkProgressSearchType.Status: {
        queryInput.status = workProgressUrl.searchValue as WorkStatus;
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
            isFilterRequired={
              searchResult !== undefined &&
              searchResult.entries.length > 0 &&
              !reset
            }
            workTypes={workTypes}
            onFilter={handleFilter}
            onReset={handleReset}
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
            {current.matches("searched") && !reset ? (
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
                  data={filterResults(searchResult.entries, filter)}
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
