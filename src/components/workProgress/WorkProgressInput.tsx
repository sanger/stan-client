import { useMachine } from "@xstate/react";
import * as Yup from "yup";
import Heading from "../Heading";
import { Form, Formik } from "formik";
import Warning from "../notifications/Warning";
import React from "react";
import FormikSelect from "../forms/Select";
import createWorkProgressInputMachine from "./workProgressInput.machine";
import BlueButton from "../buttons/BlueButton";
import FormikInput from "../forms/Input";

export enum WorkProgressInputTypeField {
  WorkNumber = "SGP/R&D Number",
  WorkType = "Work Type",
  Status = "Status",
}

export type WorkProgressInputData = {
  types: WorkProgressInputTypeField[];
  values: string[] | undefined;
  selectedType: string;
  selectedValue: string;
};

const defaultInitialValues: WorkProgressInputData = {
  types: Object.values(WorkProgressInputTypeField),
  values: [],
  selectedType: WorkProgressInputTypeField.WorkNumber,
  selectedValue: "",
};

export default function WorkProgressInput({
  onSubmitAction,
}: {
  onSubmitAction: (workProgressInputData: WorkProgressInputData) => void;
}) {
  const [current, send] = useMachine(
    createWorkProgressInputMachine({
      workProgressInput: defaultInitialValues,
    })
  );
  const {
    types,
    values,
    selectedType,
    selectedValue,
  } = current.context.workProgressInput;
  /**
   * Form validation schema
   */
  const validationSchema: Yup.ObjectSchema = Yup.object().shape({
    type: Yup.string().ensure(),
    value: Yup.string().ensure(),
  });
  const onFormSubmit = () => {
    onSubmitAction(current.context.workProgressInput);
  };

  const sendEvents = (eventType: string, value?: string) => {
    if (eventType === "VALUE_SELECTION" && value) {
      send({ type: "VALUE_SELECTION", value: value });
      return;
    }
    debugger;
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
            <div className="space-y-2 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-center md:gap-4">
              <div className="md:flex-grow">
                <FormikSelect
                  label=""
                  name="type"
                  value={selectedType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue(
                      "searchType",
                      e.target.value === ""
                        ? undefined
                        : sendEvents(e.target.value)
                    );
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
                    name="workNumber"
                    label=""
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue(
                        "searchValue",
                        e.target.value === ""
                          ? undefined
                          : sendEvents("VALUE_SELECTION", e.target.value)
                      );
                    }}
                  />
                ) : (
                  <FormikSelect
                    label=""
                    name="value"
                    value={selectedValue ? selectedValue : ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue(
                        "searchValue",
                        e.target.value === ""
                          ? undefined
                          : sendEvents("VALUE_SELECTION", e.target.value)
                      );
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
                <BlueButton type="submit">Search</BlueButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
