import { useMachine } from "@xstate/react";
import * as Yup from "yup";
import Heading from "../Heading";
import { Form, Formik } from "formik";
import Warning from "../notifications/Warning";
import React from "react";
import createWorkProgressInputMachine from "./workProgressInput.machine";
import BlueButton from "../buttons/BlueButton";
import FormikSelect from "../forms/Select";
import FormikInput from "../forms/Input";
import { FindWorkProgressQueryVariables as WorkProgressQueryInput } from "../../types/sdk";

/**
 * Enum to fill the Type field
 */
export enum WorkProgressInputTypeField {
  WorkNumber = "SGP/R&D Number",
  WorkType = "Work Type",
  Status = "Status",
}

/**
 * Data structure to keep the data associated with this component
 */
export type WorkProgressInputData = {
  types: WorkProgressInputTypeField[];
  values: string[] | undefined;
  selectedType: string;
  selectedValue: string;
};
/**
 * This is to reformat the data in query input to form
 * @param workProgressInput
 */
const mergeFieldTypes = (workProgressInput: WorkProgressQueryInput) => {
  if (workProgressInput.workNumber) {
    return {
      selectedType: WorkProgressInputTypeField.WorkNumber,
      selectedValue: workProgressInput.workNumber,
    };
  } else if (workProgressInput.workType) {
    return {
      selectedType: WorkProgressInputTypeField.WorkType,
      selectedValue: workProgressInput.workType,
    };
  } else if (workProgressInput.status) {
    return {
      selectedType: WorkProgressInputTypeField.Status,
      selectedValue: workProgressInput.status,
    };
  }
};

/**
 * Form validation schema
 */
const validationSchema: Yup.ObjectSchema = Yup.object().shape({
  selectedType: Yup.string()
    .oneOf(Object.values(WorkProgressInputTypeField))
    .required(),
  selectedValue: Yup.string().ensure(),
});

export default function WorkProgressInput({
  initialValue,
  onSubmitAction,
  onInputChange,
}: {
  initialValue: WorkProgressQueryInput;
  onSubmitAction: (
    submitData: WorkProgressInputData,
    workTypes?: string[]
  ) => void;
  onInputChange: () => void;
}) {
  //Initialize form data
  const defaultInitialValues: WorkProgressInputData = {
    types: Object.values(WorkProgressInputTypeField),
    values: [],
    selectedType: WorkProgressInputTypeField.WorkNumber,
    selectedValue: "",
    ...mergeFieldTypes(initialValue),
  };
  const [current, send] = useMachine(
    createWorkProgressInputMachine({
      workProgressInput: defaultInitialValues,
    })
  );

  const {
    workProgressInput: { types, values, selectedType, selectedValue },
    workTypes,
    serverError,
  } = current.context;

  const onFormSubmit = () => {
    onSubmitAction(current.context.workProgressInput, workTypes);
  };

  //Send Events to State machine
  const sendEvents = (eventType: string, value: string) => {
    if (eventType === "VALUE_SELECTION") {
      send({ type: "VALUE_SELECTION", value: value });
      return;
    }
    switch (eventType) {
      case WorkProgressInputTypeField.WorkNumber: {
        send({ type: "WORK_NUMBER_SELECTION" });
        break;
      }
      case WorkProgressInputTypeField.WorkType: {
        send({ type: "WORK_TYPE_SELECTION" });
        break;
      }
      case WorkProgressInputTypeField.Status: {
        send({ type: "STATUS_SELECTION" });
        break;
      }
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
      <Heading level={3} showBorder={false}>
        Search
      </Heading>

      <Formik
        initialValues={defaultInitialValues}
        validationSchema={validationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        validateOnMount={false}
        onSubmit={onFormSubmit}
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
            <div className="space-y-2 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-center md:gap-4">
              <div className="md:flex-grow">
                <FormikSelect
                  label=""
                  name="selectedType"
                  data-testid={"type"}
                  value={selectedType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    onInputChange();
                    sendEvents(e.target.value, "");
                  }}
                >
                  {types.map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </FormikSelect>
              </div>
              <div className="md:flex-grow">
                {selectedType === WorkProgressInputTypeField.WorkNumber ? (
                  <FormikInput
                    name="selectedValue"
                    label=""
                    data-testid={"valueInput"}
                    value={selectedValue}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      onInputChange();
                      sendEvents("VALUE_SELECTION", e.target.value);
                    }}
                  />
                ) : (
                  <FormikSelect
                    label=""
                    name="selectedValue"
                    data-testid={"valueSelect"}
                    value={selectedValue ? selectedValue : ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      onInputChange();
                      sendEvents("VALUE_SELECTION", e.target.value);
                    }}
                  >
                    {values ? (
                      values.map((val) => (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      ))
                    ) : (
                      <></>
                    )}
                  </FormikSelect>
                )}
              </div>
              <div className="sm:flex sm:flex-row justify-end">
                <BlueButton type="submit" disabled={!selectedValue}>
                  Search
                </BlueButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
