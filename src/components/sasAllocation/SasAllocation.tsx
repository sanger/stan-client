import React from "react";
import Heading from "../Heading";
import { Formik, Form } from "formik";
import FormikInput from "../forms/Input";
import FormikSelect from "../forms/Select";
import BlueButton from "../buttons/BlueButton";
import createSasAllocationMachine, {
  SasAllocationFormValues,
} from "./sasAllocation.machine";
import { useMachine } from "@xstate/react";
import { optionValues } from "../forms";
import LoadingSpinner from "../icons/LoadingSpinner";
import Table, { TableBody, TableHead, TableHeader } from "../Table";
import Success from "../notifications/Success";
import Warning from "../notifications/Warning";
import * as Yup from "yup";
import SasRow from "./SasRow";

const initialValues: SasAllocationFormValues = {
  costCode: "",
  project: "",
  isRnD: false,
};

export default function SasAllocation() {
  const [current, send] = useMachine(createSasAllocationMachine());

  const {
    projects,
    costCodes,
    sasNumbers,
    availableComments,
    requestError,
    successMessage,
  } = current.context;

  /**
   * Form validation schema
   */
  const validationSchema: Yup.ObjectSchema = Yup.object().shape({
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
          <Warning message={"SAS Request Error"} error={requestError} />
        )}

        <Heading level={3} showBorder={false}>
          Allocate a new SAS number
        </Heading>

        <Formik<SasAllocationFormValues>
          initialValues={initialValues}
          onSubmit={async (values) => {
            send({ type: "ALLOCATE_SAS", values });
          }}
          validationSchema={validationSchema}
        >
          <Form>
            <div className="space-y-2 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-start md:gap-4">
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
          <Table data-testid="sas-allocation-table">
            <TableHead>
              <tr>
                <TableHeader>SAS Number</TableHeader>
                <TableHeader>Project</TableHeader>
                <TableHeader>Cost Code</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader />
              </tr>
            </TableHead>
            <TableBody>
              {sasNumbers.map((sasNumber) => (
                <SasRow
                  initialSasNumber={sasNumber}
                  availableComments={availableComments}
                  key={sasNumber.sasNumber}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
