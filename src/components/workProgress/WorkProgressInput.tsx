import { useMachine } from "@xstate/react";
import * as Yup from "yup";
import Heading from "../Heading";
import { Form, Formik } from "formik";
import Warning from "../notifications/Warning";
import React from "react";
import createWorkProgressInputMachine from "./workProgressInput.machine";
import BlueButton from "../buttons/BlueButton";
import {
  FindWorkProgressQueryVariables as WorkProgressQueryInput,
  WorkStatus,
} from "../../types/sdk";
import { KeyValueViewer } from "../KeyValueViewer";

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
 * Filter inputs to search result
 */
export type WorkProgressFilterInput = {
  filterType: string;
  filterValues: string[];
};

/**
 * Data structure to keep the data associated with this component
 */
export type WorkProgressInputData = {
  searchType: string;
  searchValue: string;
  filterType: string;
  filterValues: string[];
};

/**
 * This is to reformat the data in query input to form
 * @param workProgressInput
 */
const mergeFieldTypes = (workProgressInput: WorkProgressQueryInput) => {
  if (workProgressInput.workNumber) {
    return {
      selectedType: WorkProgressSearchType.WorkNumber,
      selectedValue: workProgressInput.workNumber,
    };
  } else if (workProgressInput.workType) {
    return {
      selectedType: WorkProgressSearchType.WorkType,
      selectedValue: workProgressInput.workType,
    };
  } else if (workProgressInput.status) {
    return {
      selectedType: WorkProgressSearchType.Status,
      selectedValue: workProgressInput.status,
    };
  }
};

/**
 * Form validation schema
 */
const validationSchema: Yup.ObjectSchema = Yup.object().shape({
  selectedType: Yup.string()
    .oneOf(Object.values(WorkProgressSearchType))
    .required(),
  selectedValue: Yup.string().ensure(),
});

export default function WorkProgressInput({
  initialValue,
  isFilterRequired,
  onSubmitAction,
}: {
  initialValue: WorkProgressQueryInput;
  isFilterRequired: boolean;
  onSubmitAction: (
    submitData: WorkProgressInputData,
    isFilterAction: boolean
  ) => void;
}) {
  //Initialize form data
  const defaultInitialValues: WorkProgressInputData = {
    searchType: WorkProgressSearchType.WorkNumber,
    searchValue: "",
    filterType: WorkProgressFilterType.Status,
    filterValues: [],
    ...mergeFieldTypes(initialValue),
  };
  const [current, send] = useMachine(
    createWorkProgressInputMachine({
      workProgressInput: defaultInitialValues,
    })
  );

  const {
    workProgressInput: { searchType, searchValue },
    workTypes,
    serverError,
  } = current.context;

  const generateValuesForType = React.useCallback(
    (type: string): string[] => {
      debugger;
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
    debugger;
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

  /**
   * Filter validation schema
   */
  const filterValidationSchema: Yup.ObjectSchema = Yup.object().shape({
    type: Yup.string()
      .oneOf([WorkProgressSearchType.WorkType, WorkProgressSearchType.Status])
      .optional()
      .label("Type"),
    values: Yup.array()
      .of(Yup.string())
      .when("type", {
        is: (value: string) => value === WorkProgressSearchType.WorkType,
        then: Yup.array()
          .of(
            Array.isArray(workTypes)
              ? Yup.string().oneOf(workTypes)
              : Yup.string()
          )
          .required(),
        otherwise: Yup.array()
          .of(Yup.string().oneOf(Object.values(WorkStatus)))
          .required(),
      }),
  });

  return (
    <>
      <div className="mx-auto max-w-screen-xl mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
        <Heading level={3} showBorder={false}>
          Search
        </Heading>
        <Formik
          initialValues={defaultInitialValues}
          validateOnChange={false}
          validateOnBlur={false}
          validateOnMount={false}
          onSubmit={async () => {
            onSubmitAction(current.context.workProgressInput, false);
          }}
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
              {
                <KeyValueViewer
                  keyValueMap={memoSearchInputKeyValues}
                  onChangeKey={onSelectSearchType}
                  onChangeValue={onSelectSearchValue}
                  multiSelectValues={false}
                />
              }
              <div className="sm:flex sm:flex-row  justify-end">
                <BlueButton type="submit" disabled={!searchValue}>
                  Search
                </BlueButton>
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
          <Formik<WorkProgressFilterInput>
            initialValues={{
              filterType: WorkProgressFilterType.Status,
              filterValues: Object.values(WorkStatus),
            }}
            validateOnChange={false}
            validateOnBlur={false}
            validateOnMount={false}
            onSubmit={async (values) => {
              debugger;
              onSubmitAction(current.context.workProgressInput, false);
            }}
          >
            <Form>
              <KeyValueViewer
                keyValueMap={memoFilterInputKeyValues}
                onChangeKey={onSelectFilterType}
                onChangeValue={onSelectFilterValue}
                multiSelectValues={true}
              />
              <div className="flex mt-4 justify-end ">
                <BlueButton type="submit">Filter</BlueButton>
              </div>
            </Form>
          </Formik>
        </div>
      )}
    </>
  );
}
