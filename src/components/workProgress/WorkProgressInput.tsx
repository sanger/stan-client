import { useMachine } from "@xstate/react";
import * as Yup from "yup";
import Heading from "../Heading";
import { Form, Formik } from "formik";
import Warning from "../notifications/Warning";
import React from "react";
import createWorkProgressInputMachine from "./workProgressInput.machine";
import BlueButton from "../buttons/BlueButton";
import { WorkStatus } from "../../types/sdk";
import { KeyValueViewer } from "../KeyValueViewer";
import { WorkProgressUrlParams } from "../../pages/WorkProgress";
import { history } from "../../lib/sdk";
import { stringify } from "../../lib/helpers";

/**
 * Enum to fill the Search Type field
 */
export enum WorkProgressSearchType {
  WorkNumber = "SGP/R&D Number",
  WorkType = "Work Type",
  Status = "Status",
}

/**
 * Enum to fill the Search Type field
 */
export enum WorkProgressFilterType {
  WorkType = "Work Type",
  Status = "Status",
}

/**
 * Form validation schema
 */
export const workProgressSearchSchema: Yup.ObjectSchema = Yup.object().shape({
  searchType: Yup.string()
    .oneOf(Object.values(WorkProgressSearchType))
    .required(),
  searchValue: Yup.string().ensure(),
});
/**
 * Filter validation schema
 */
export const filterValidationSchema = (
  workTypes: string[]
): Yup.ObjectSchema => {
  return Yup.object().shape({
    filterType: Yup.string()
      .oneOf([WorkProgressFilterType.WorkType, WorkProgressFilterType.Status])
      .optional(),
    filterValue: Yup.array()
      .of(Yup.string())
      .when("filterType", {
        is: (value: string) => value === WorkProgressFilterType.WorkType,
        then: Yup.array()
          .of(workTypes ? Yup.string().oneOf(workTypes) : Yup.string())
          .optional(),
        otherwise: Yup.array()
          .of(Yup.string().oneOf(Object.values(WorkStatus)))
          .optional(),
      }),
  });
};

type WorkProgressInputParams = {
  urlParams: WorkProgressUrlParams;
  workTypes: string[];
  isFilterRequired: boolean;
  onFilter: (filterType: string, filterValues: string[]) => void;
};

export default function WorkProgressInput({
  urlParams,
  workTypes,
  isFilterRequired,
  onFilter,
}: WorkProgressInputParams) {
  const [current, send] = useMachine(
    createWorkProgressInputMachine({
      workProgressInput: urlParams,
    })
  );

  const {
    workProgressInput: { searchType, searchValue, filterType },
    serverError,
  } = current.context;

  const generateValuesForType = React.useCallback(
    (type: string): string[] => {
      switch (type) {
        case WorkProgressSearchType.WorkNumber:
          return [];
        case WorkProgressSearchType.WorkType:
          return workTypes ?? [];
        case WorkProgressSearchType.Status:
          return Object.values(WorkStatus);
        default:
          return [];
      }
    },
    [workTypes]
  );

  const memoSearchInputKeyValues = React.useMemo(() => {
    const map = new Map<string, string[]>();
    Object.values(WorkProgressSearchType).forEach((key) => {
      map.set(key, generateValuesForType(key));
    });
    return map;
  }, [generateValuesForType]);

  const memoFilterInputKeyValues = React.useMemo(() => {
    const map = new Map<string, string[]>();
    if (searchType === WorkProgressSearchType.WorkNumber) {
      Object.values(WorkProgressFilterType).forEach((key) => {
        map.set(key, generateValuesForType(key));
      });
    } else if (searchType === WorkProgressSearchType.WorkType) {
      map.set(
        WorkProgressSearchType.Status,
        generateValuesForType(WorkProgressSearchType.Status)
      );
    } else {
      map.set(
        WorkProgressSearchType.WorkType,
        generateValuesForType(WorkProgressSearchType.WorkType.toString())
      );
    }
    return map;
  }, [searchType, generateValuesForType]);

  //Send Events to State machine
  const onSelectSearchType = React.useCallback(
    (key: string) => {
      send({
        type: "SET_SEARCH_TYPE",
        value: key,
      });
    },
    [send]
  );
  const onSelectSearchValue = React.useCallback(
    (value: string[]) => {
      send({ type: "SET_SEARCH_VALUE", value: value[0] });
    },
    [send]
  );
  const onSelectFilterType = React.useCallback(
    (key: string) => {
      send({ type: "SET_FILTER_TYPE", value: key });
    },
    [send]
  );
  const onSelectFilterValue = React.useCallback(
    (value: string[]) => {
      send({ type: "SET_FILTER_VALUE", value: value });
    },
    [send]
  );

  return (
    <>
      <div className="mx-auto max-w-screen-xl mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
        <Heading level={3} showBorder={false}>
          Search
        </Heading>
        <Formik
          initialValues={urlParams}
          validateOnChange={true}
          validateOnBlur={false}
          validateOnMount={false}
          onSubmit={async () => {
            history.push({
              pathname: "/",
              search: stringify(current.context.workProgressInput),
            });
          }}
          validationSchema={workProgressSearchSchema}
        >
          {({ errors, isValid }) => (
            <Form>
              {!isValid && (
                <Warning className={"mb-5"} message={"Validation Error"}>
                  {Object.values(errors)}
                </Warning>
              )}
              {serverError && (
                <Warning message="Search Error" error={serverError} />
              )}
              <div className={" flex flex-row "}>
                {
                  <KeyValueViewer
                    keyValueMap={memoSearchInputKeyValues}
                    onChangeKey={onSelectSearchType}
                    onChangeValue={onSelectSearchValue}
                    multiSelectValues={false}
                    schemaNameKey={"searchType"}
                    schemaNameValue={"searchValue"}
                    initialKeyValue={{
                      key: urlParams.searchType,
                      value: [urlParams.searchValue],
                    }}
                  />
                }
                <div className="sm:flex sm:flex-row  justify-end">
                  <BlueButton type="submit" disabled={!searchValue}>
                    Search
                  </BlueButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      {isFilterRequired && memoFilterInputKeyValues.size > 0 && (
        <div className="mx-auto max-w-screen-xl mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
          <Heading level={4} showBorder={false}>
            Filter by
          </Heading>
          <Formik<{ filterType: string; filterValues: string[] }>
            initialValues={{
              filterType: WorkProgressFilterType.Status,
              filterValues: Object.values(WorkStatus),
            }}
            validateOnChange={false}
            validateOnBlur={false}
            validateOnMount={false}
            onSubmit={async (values) => {
              onFilter(values.filterType, values.filterValues);
            }}
            validationSchema={filterValidationSchema}
          >
            <Form>
              <div className={"flex flex-row"}>
                <KeyValueViewer
                  keyValueMap={memoFilterInputKeyValues}
                  onChangeKey={onSelectFilterType}
                  onChangeValue={onSelectFilterValue}
                  initialKeyValue={{
                    key: urlParams.filterType,
                    value: urlParams.filterValues,
                  }}
                  multiSelectValues={true}
                  schemaNameKey={"filterType"}
                  schemaNameValue={"filterValue"}
                  valueLabel={
                    searchType !== WorkProgressSearchType.WorkNumber
                      ? filterType
                      : ""
                  }
                />
                <div className="flex flex-col justify-end">
                  <BlueButton type="submit" disabled={!searchValue}>
                    Filter
                  </BlueButton>
                </div>
              </div>
            </Form>
          </Formik>
        </div>
      )}
    </>
  );
}
