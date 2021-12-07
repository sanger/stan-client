import React, { useState } from "react";
import {
  FindWorkProgressQueryVariables,
  FindWorkProgressQueryVariables as WorkProgressQueryInput,
  WorkStatus,
} from "../types/sdk";

import AppShell from "../components/AppShell";
import { ParsedQuery } from "query-string";
import {
  cleanParams,
  objectKeys,
  parseQueryString,
  stringify,
} from "../lib/helpers";
import { merge } from "lodash";
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
import { history } from "../lib/sdk";
import WorkProgressInput, {
  WorkProgressFilterType,
  WorkProgressInputData,
  WorkProgressSearchType,
} from "../components/workProgress/WorkProgressInput";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import { SearchResultsType } from "../types/stan";

type WorkProgressProps = {
  urlParamsString: string;
};

const defaultInitialValues: WorkProgressQueryInput = {
  workNumber: "",
  workType: "",
  status: undefined,
};

function WorkProgress({ urlParamsString }: WorkProgressProps) {
  const params: ParsedQuery = parseQueryString(urlParamsString);
  const [workProgressInput, setWorkProgressInput] = useState<
    WorkProgressInputData | undefined
  >(undefined);

  const workProgressQueryInput: WorkProgressQueryInput = merge(
    {},
    defaultInitialValues,
    cleanParams(params, objectKeys(defaultInitialValues))
  );
  const workProgressMachine = searchMachine<
    FindWorkProgressQueryVariables,
    WorkProgressResultTableEntry
  >(new WorkProgressService());
  const [current, send] = useMachine(() =>
    workProgressMachine.withContext({
      findRequest: workProgressQueryInput,
    })
  );
  const {
    serverError,
    searchResult,
  }: {
    serverError?: ClientError | undefined | null;
    searchResult?: SearchResultsType<WorkProgressResultTableEntry>;
  } = current.context;

  const handleSubmit = React.useCallback(
    (workProgressInput: WorkProgressInputData, filterOnly: boolean) => {
      setWorkProgressInput(workProgressInput);
      debugger;
      if (!filterOnly) {
        send({ type: "FIND", request: formatInputData(workProgressInput) });
      }
      // Replace instead of push so user doesn't have to go through a load of old searches when going back
      history.replace(`/?${stringify(workProgressInput)}`);
    },
    [setWorkProgressInput, send]
  );

  /***
   * Filter results
   */
  const filterResults = (
    workProgressResults: WorkProgressResultTableEntry[],
    workProgressInput?: WorkProgressInputData
  ): WorkProgressResultTableEntry[] => {
    debugger;
    if (
      workProgressInput &&
      workProgressInput.filterType &&
      workProgressInput.filterValues.length > 0
    ) {
      return workProgressResults.filter((workProgressResult) => {
        const findIndx = workProgressInput.filterValues.findIndex(
          (filterValue) => {
            return workProgressInput.filterType ===
              WorkProgressFilterType.WorkType
              ? filterValue === workProgressResult.workType
              : filterValue === workProgressResult.status;
          }
        );
        debugger;
        return findIndx !== -1;
      });
    } else {
      return workProgressResults;
    }
  };

  /**
   * Convert the data associated with the form to query input data structure.
   * @param workProgressInputFields
   */
  function formatInputData(
    workProgressInputFields: WorkProgressInputData
  ): WorkProgressQueryInput {
    const queryInput: WorkProgressQueryInput = {
      workNumber: undefined,
      workType: undefined,
      status: undefined,
    };
    switch (workProgressInputFields.searchType) {
      case WorkProgressSearchType.WorkNumber: {
        queryInput.workNumber = workProgressInputFields.searchValue;
        break;
      }
      case WorkProgressSearchType.WorkType: {
        queryInput.workType = workProgressInputFields.searchValue;
        break;
      }
      case WorkProgressSearchType.Status: {
        queryInput.status = workProgressInputFields.searchValue as WorkStatus;
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
            initialValue={workProgressQueryInput}
            isFilterRequired={true}
            onSubmitAction={handleSubmit}
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
                  data={filterResults(searchResult.entries, workProgressInput)}
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
}

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
    Header: "Last Date cDNA",
    accessor: (originalRow) =>
      originalRow.lastCDNADate && originalRow.lastCDNADate.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return getDateSortType(
        rowA.original.lastCDNADate,
        rowB.original.lastCDNADate
      );
    },
  },
];
