import React from "react";
import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables as WorkProgressQueryInput,
} from "../types/sdk";

import AppShell from "../components/AppShell";
import { ParsedQuery } from "query-string";
import { cleanParams, objectKeys, parseQueryString } from "../lib/helpers";
import { mapValues, merge } from "lodash";
import genericSearchMachine from "../lib/machines/workProgress/genericSearchMachine";
import { useMachine } from "@xstate/react";
import Warning from "../components/notifications/Warning";
import {
  WorkProgressResultsType,
  WorkProgressResultTableEntry,
  WorkProgressService,
} from "../lib/services/workProgressService";
import WorkProgressInput, {
  WorkProgressInputData,
  WorkProgressInputTypeField,
} from "../components/workProgress/WorkProgressInput";
import DataTable from "../components/DataTable";
import { ClientError } from "graphql-request";
import { Column } from "react-table";

type WorkProgressProps = {
  workProgressInfo: FindWorkProgressQuery;
  urlParamsString: string;
};

const defaultInitialValues: WorkProgressQueryInput = {
  workNumber: "",
  workType: "",
  status: undefined,
};
const defaultKeys: Array<keyof WorkProgressQueryInput> = objectKeys(
  defaultInitialValues
);

function WorkProgress({ urlParamsString }: WorkProgressProps) {
  const params: ParsedQuery = parseQueryString(urlParamsString);
  const workProgressQueryInput: WorkProgressQueryInput = merge(
    {},
    defaultInitialValues,
    cleanParams(params, defaultKeys)
  );
  const workProgressMachine = genericSearchMachine(new WorkProgressService());
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
    searchResult?: WorkProgressResultsType;
  } = current.context;

  const handleSubmission = (workProgressInput: WorkProgressInputData) => {
    debugger;
    const queryInput = mapValues(workProgressQueryInput, () => "");
    switch (workProgressInput.selectedType) {
      case WorkProgressInputTypeField.WorkNumber: {
        queryInput.workNumber = workProgressInput.selectedValue;
        break;
      }
      case WorkProgressInputTypeField.WorkType: {
        queryInput.workType = workProgressInput.selectedValue;
        break;
      }
      case WorkProgressInputTypeField.Status: {
        queryInput.status = workProgressInput.selectedValue;
        break;
      }
    }
    send({ type: "FIND", request: queryInput });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    //history.replace(`/?${stringify(workProgressInput)}`);
  };
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <WorkProgressInput onSubmitAction={handleSubmission} />
          <div>
            {serverError && (
              <Warning message="Search Error" error={serverError} />
            )}
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
                    defaultSort={[{ id: "workNumber" }]}
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

const getDateSortType = (
  rowADate: Date | undefined,
  rowBDate: Date | undefined
) => {
  if (rowADate && rowBDate) {
    return rowADate.getTime() - rowBDate.getTime();
  }
  if (rowADate) return 1;
  else return -1;
};

const columns: Column<WorkProgressResultTableEntry>[] = [
  {
    Header: "SGP/R&D Number",
    accessor: "workNumber",
  },
  {
    Header: "Status",
    accessor: (originalRow) => originalRow.status,
    sortType: (rowA, rowB) => {
      if (rowB.original.status < rowA.original.status) return 1;
      else return -1;
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
