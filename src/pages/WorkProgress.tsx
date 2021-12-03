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
  WorkProgressInputData,
  WorkProgressInputTypeField,
} from "../components/workProgress/WorkProgressInput";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import { SearchResultsType } from "../types/stan";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import FormikSelect from "../components/forms/Select";
import BlueButton from "../components/buttons/BlueButton";
import Heading from "../components/Heading";

type WorkProgressProps = {
  urlParamsString: string;
};

const defaultInitialValues: WorkProgressQueryInput = {
  workNumber: "",
  workType: "",
  status: undefined,
};

/**
 * Filter inputs to search result
 */
type WorkProgressFilterInput = {
  type: string;
  values: string[];
};

function WorkProgress({ urlParamsString }: WorkProgressProps) {
  const params: ParsedQuery = parseQueryString(urlParamsString);
  const [workProgressInput, setWorkProgressInput] = useState<
    WorkProgressInputData | undefined
  >(undefined);
  const [workProgressResultData, setWorkProgressResultData] = useState<
    WorkProgressResultTableEntry[]
  >([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [filterInput, setFilterInput] = useState<
    WorkProgressFilterInput | undefined
  >(undefined);
  /**
   * Filter validation schema
   */
  const filterValidationSchema: Yup.ObjectSchema = Yup.object().shape({
    type: Yup.string()
      .oneOf([
        WorkProgressInputTypeField.WorkType,
        WorkProgressInputTypeField.Status,
      ])
      .optional()
      .label("Type"),
    values: Yup.array()
      .of(Yup.string())
      .when("type", {
        is: (value: string) => value === WorkProgressInputTypeField.WorkType,
        then: Yup.array().of(Yup.string().oneOf(workTypes)).required(),
        otherwise: Yup.array()
          .of(Yup.string().oneOf(Object.values(WorkStatus)))
          .required(),
      }),
  });

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

  /**Update the results when state machine fetches data**/
  React.useEffect(() => {
    if (!searchResult) {
      setWorkProgressResultData([]);
      return;
    }
    setWorkProgressResultData(searchResult.entries);
  }, [searchResult]);

  const handleSubmission = (
    workProgressInput: WorkProgressInputData,
    workTypes?: string[]
  ) => {
    if (workTypes) setWorkTypes(workTypes);
    setWorkProgressInput(workProgressInput);
    send({ type: "FIND", request: formatInputData(workProgressInput) });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    history.replace(`/?${stringify(workProgressInput)}`);
  };

  const handleInputChange = React.useCallback(() => {
    setWorkProgressResultData([]);
  }, [setWorkProgressResultData]);

  /***
   * Filter results
   */
  const filterResults = (
    filterInput: WorkProgressFilterInput,
    workProgressResults: WorkProgressResultTableEntry[]
  ): WorkProgressResultTableEntry[] => {
    return workProgressResults.filter(
      (workProgressResult) =>
        filterInput.values.findIndex((filterValue) =>
          filterInput.type === WorkProgressInputTypeField.WorkType
            ? filterValue === workProgressResult.workType
            : filterValue === workProgressResult.status
        ) !== -1
    );
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
    switch (workProgressInputFields.selectedType) {
      case WorkProgressInputTypeField.WorkNumber: {
        queryInput.workNumber = workProgressInputFields.selectedValue;
        break;
      }
      case WorkProgressInputTypeField.WorkType: {
        queryInput.workType = workProgressInputFields.selectedValue;
        break;
      }
      case WorkProgressInputTypeField.Status: {
        queryInput.status = workProgressInputFields.selectedValue as WorkStatus;
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
            onSubmitAction={handleSubmission}
            onInputChange={handleInputChange}
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
                workProgressInput &&
                workProgressResultData &&
                workProgressResultData.length > 0 && (
                  <div>
                    <div className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
                      <Heading level={4} showBorder={false}>
                        Filter by
                      </Heading>
                      <Formik<WorkProgressFilterInput>
                        initialValues={{
                          type:
                            workProgressInput.selectedType ===
                            WorkProgressInputTypeField.WorkType
                              ? WorkProgressInputTypeField.Status
                              : WorkProgressInputTypeField.WorkType,
                          values: [],
                        }}
                        onSubmit={setFilterInput}
                        validationSchema={filterValidationSchema}
                      >
                        {({ values }) => (
                          <Form>
                            <div className={"flex flex-col"}>
                              <div className="space-y-2 md:grid md:grid-cols-2 md:px-10 md:space-y-0 md:flex md:flex-col md:justify-center md:items-start md:gap-4">
                                {workProgressInput.selectedType ===
                                  WorkProgressInputTypeField.WorkNumber && (
                                  <FormikSelect
                                    label=""
                                    name="type"
                                    emptyOption={false}
                                  >
                                    {[
                                      WorkProgressInputTypeField.WorkType,
                                      WorkProgressInputTypeField.Status,
                                    ].map((workType) => (
                                      <option key={workType} value={workType}>
                                        {workType}
                                      </option>
                                    ))}
                                  </FormikSelect>
                                )}
                                <div className="md:flex-grow">
                                  <FormikSelect
                                    label={
                                      workProgressInput.selectedType !==
                                      WorkProgressInputTypeField.WorkNumber
                                        ? values.type
                                        : ""
                                    }
                                    name="values"
                                    multiple={true}
                                    className={"ml-6"}
                                    emptyOption={false}
                                  >
                                    {(values.type ===
                                    WorkProgressInputTypeField.WorkType
                                      ? workTypes
                                      : Object.values(WorkStatus)
                                    ).map((filterValue) => (
                                      <option
                                        key={filterValue}
                                        value={filterValue}
                                      >
                                        {filterValue}
                                      </option>
                                    ))}
                                  </FormikSelect>
                                </div>
                              </div>
                              <div className="flex mt-4 justify-end ">
                                <BlueButton type="submit">Filter</BlueButton>
                              </div>
                            </div>
                          </Form>
                        )}
                      </Formik>
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
                      data={
                        filterInput
                          ? filterResults(filterInput, workProgressResultData)
                          : workProgressResultData
                      }
                    />
                  </div>
                )
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
