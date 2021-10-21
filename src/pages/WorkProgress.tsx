import React from "react";
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
import WorkProgressInput from "../components/workProgress/WorkProgressInput";
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

  const handleSubmission = (workProgressInput: WorkProgressQueryInput) => {
    send({ type: "FIND", request: workProgressInput });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    history.replace(`/?${stringify(workProgressInput)}`);
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <WorkProgressInput
            initialValue={workProgressQueryInput}
            onSubmitAction={handleSubmission}
          />
          <div className={"my-10"}>
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
                <div>
                  <div className="mt-6 mb-2 flex flex-row items-center justify-end">
                    <p className="text-sm text-gray-700">
                      Displaying{" "}
                      <span className="font-medium">
                        {" "}
                        {searchResult.entries.length}{" "}
                      </span>
                      results
                    </p>
                  </div>
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
                </div>
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
