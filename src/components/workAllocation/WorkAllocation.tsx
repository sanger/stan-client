import React, { useEffect, useMemo } from "react";
import Heading from "../Heading";
import { Form, Formik } from "formik";
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
import { WorkStatus } from "../../types/sdk";
import { objectKeys, safeParseQueryString, stringify } from "../../lib/helpers";
import { useLocation } from "react-router-dom";
import { history } from "../../lib/sdk";

const initialValues: WorkAllocationFormValues = {
  workType: "",
  costCode: "",
  project: "",
  isRnD: false,
  numSlides: undefined,
  numBlocks: undefined,
};
export const MAX_NUM_BLOCKANDSLIDES = 200;

/**
 * Possible URL search params for the page e.g. /sgp?status[]=active&status[]=completed
 */
export type WorkAllocationUrlParams = {
  status: WorkStatus[];
};

/**
 * Schema to validate the deserialized URL search params
 */
const urlParamsSchema = Yup.object().shape({
  status: Yup.array()
    .of(Yup.string().oneOf(Object.values(WorkStatus)))
    .required(),
});

export default function WorkAllocation() {
  const location = useLocation();

  /**
   * The deserialized URL search params
   */
  const urlParams = useMemo(() => {
    return (
      safeParseQueryString<WorkAllocationUrlParams>({
        query: location.search,
        schema: urlParamsSchema,
      }) ?? { status: [WorkStatus.Active] }
    );
  }, [location.search]);

  const [current, send] = useMachine(
    createWorkAllocationMachine({ urlParams })
  );

  /**
   * When the URL search params change, send an event to the machine
   */
  useEffect(() => {
    send({ type: "UPDATE_URL_PARAMS", urlParams });
  }, [send, urlParams]);

  const {
    projects,
    costCodes,
    workWithComments,
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
    numBlocks: Yup.number().max(MAX_NUM_BLOCKANDSLIDES),
    numSlides: Yup.number()
      .max(MAX_NUM_BLOCKANDSLIDES)
      .when("numBlocks", (numBlocks: any, schema: any) => {
        if (!numBlocks) {
          return schema.required("Number of blocks or slides required");
        }
        return schema;
      }),
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
            <div className="space-y-2 md:grid md:grid-cols-3 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-start md:gap-4">
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

              <div className="md:flex-grow">
                <FormikInput
                  label={"Number of blocks"}
                  name={"numBlocks"}
                  type={"number"}
                  maxLength={MAX_NUM_BLOCKANDSLIDES}
                  min={0}
                />
              </div>
              <div className="md:flex-grow">
                <FormikInput
                  label={"Number of slides"}
                  name={"numSlides"}
                  type={"number"}
                  maxLength={MAX_NUM_BLOCKANDSLIDES}
                  min={0}
                />
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

      <div className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
        <Heading level={3} showBorder={false}>
          Filter SGP Numbers
        </Heading>

        <Formik<WorkAllocationUrlParams>
          initialValues={urlParams}
          onSubmit={async (values) => {
            history.push({
              pathname: "/sgp",
              search: stringify(values),
            });
          }}
        >
          <Form>
            <div className="space-y-2 md:grid md:grid-cols-3 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-start md:gap-4">
              <div className="md:flex-grow">
                <FormikSelect label="Status" name="status" multiple={true}>
                  {objectKeys(WorkStatus).map((workStatus) => (
                    <option key={workStatus} value={WorkStatus[workStatus]}>
                      {workStatus}
                    </option>
                  ))}
                </FormikSelect>
              </div>
            </div>
            <div className="sm:flex sm:flex-row mt-4 justify-end space-x-4">
              <BlueButton disabled={current.matches("loading")} type="submit">
                Search
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
                <TableHeader>Priority</TableHeader>
                <TableHeader>SGP Number</TableHeader>
                <TableHeader>Work Type</TableHeader>
                <TableHeader>Project</TableHeader>
                <TableHeader>Cost Code</TableHeader>
                <TableHeader>Number of Blocks</TableHeader>
                <TableHeader>Number of Slides</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader />
              </tr>
            </TableHead>
            <TableBody>
              {workWithComments.map((workWithComment) => (
                <WorkRow
                  initialWork={workWithComment}
                  availableComments={availableComments}
                  key={workWithComment.work.workNumber}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
