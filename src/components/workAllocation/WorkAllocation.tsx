import React from "react";
import Heading from "../Heading";
import { Formik, Form } from "formik";
import FormikInput from "../forms/Input";
import FormikSelect from "../forms/Select";
import BlueButton from "../buttons/BlueButton";
import createWorkAllocationMachine, {
  WorkAllocationFormValues,
} from "./workAllocation.machine";
import { useMachine } from "@xstate/react";
import { optionValues } from "../forms";
import LoadingSpinner from "../icons/LoadingSpinner";
import Table, { TableBody, TableHead, TableHeader } from "../Table";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import * as Yup from "yup";
import WorkRow from "./WorkRow";

const initialValues: WorkAllocationFormValues = {
  workType: "",
  costCode: "",
  project: "",
  isRnD: false,
};

export default function WorkAllocation() {
  const [current, send] = useMachine(createWorkAllocationMachine());

  const {
    projects,
    costCodes,
    works,
    workTypes,
    availableComments,
    requestError,
    successMessage,
  } = current.context;

  /**
   * Form validation schema
   */
  const validationSchema: Yup.ObjectSchema = Yup.object().shape({
    workType: Yup.string()
      .oneOf(workTypes.map((wt) => wt.name))
      .required()
      .label("Work Type"),
    project: Yup.string()
      .oneOf(projects.map((p) => p.name))
      .required()
      .label("Project"),
    costCode: Yup.string()
      .oneOf(costCodes.map((cc) => cc.code))
      .required()
      .label("Cost Code"),
    isRnD: Yup.boolean().required(),
  });

  return (
    <div>
      <div className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
        {successMessage && <Success message={successMessage} />}
        {requestError && (
          <Warning message={"SGP Request Error"} error={requestError} />
        )}

        <Heading level={3} showBorder={false}>
          Allocate a new SGP number
        </Heading>

        <Formik<WorkAllocationFormValues>
          initialValues={initialValues}
          onSubmit={async (values) => {
            send({ type: "ALLOCATE_WORK", values });
          }}
          validationSchema={validationSchema}
        >
          <Form>
            <div className="space-y-2 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-start md:gap-4">
              <div className="md:flex-grow">
                <FormikSelect
                  label="Work Type"
                  name="workType"
                  emptyOption={true}
                >
                  {optionValues(workTypes, "name", "name")}
                </FormikSelect>
              </div>

              <div className="md:flex-grow">
                <FormikSelect label="Project" name="project" emptyOption={true}>
                  {optionValues(projects, "name", "name")}
                </FormikSelect>
              </div>

              <div className="md:flex-grow">
                <FormikSelect
                  label="Cost Code"
                  name="costCode"
                  emptyOption={true}
                >
                  {optionValues(costCodes, "code", "code")}
                </FormikSelect>
              </div>
            </div>

            <div className="sm:flex sm:flex-row mt-4 justify-end space-x-4">
              <FormikInput label={"R&D?"} name={"isRnD"} type={"checkbox"} />
              <BlueButton
                disabled={current.matches("allocating")}
                type="submit"
              >
                Submit
              </BlueButton>
            </div>
          </Form>
        </Formik>
      </div>

      <div className="mx-auto max-w-screen-xl">
        {current.matches("loading") ? (
          <div className="flex flex-row items-center justify-around">
            <LoadingSpinner />
          </div>
        ) : (
          <Table data-testid="work-allocation-table">
            <TableHead>
              <tr>
                <TableHeader>SGP Number</TableHeader>
                <TableHeader>Work Type</TableHeader>
                <TableHeader>Project</TableHeader>
                <TableHeader>Cost Code</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader />
              </tr>
            </TableHead>
            <TableBody>
              {works.map((work) => (
                <WorkRow
                  initialWork={work}
                  availableComments={availableComments}
                  key={work.workNumber}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
