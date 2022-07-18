import {
  GetPotProcessingInfoQuery,
  LabwareFieldsFragment,
  PerformTissuePotMutation,
  PotProcessingRequest,
} from "../../../types/sdk";
import { useMachine } from "@xstate/react";
import ButtonBar from "../../ButtonBar";
import BlueButton from "../../buttons/BlueButton";
import React from "react";
import { LabwareTypeName, NewLabwareLayout } from "../../../types/stan";
import labwareScanTableColumns from "../../dataTable/labwareColumns";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import { Dictionary, groupBy } from "lodash";
import Heading from "../../Heading";
import Planner from "../../planning/Planner";
import createFormMachine from "../../../lib/machines/form/formMachine";
import { stanCore } from "../../../lib/sdk";
import WorkNumberSelect from "../../WorkNumberSelect";
import Warning from "../../notifications/Warning";
import variants from "../../../lib/motionVariants";
import { motion } from "framer-motion";
import { optionValues } from "../../forms";
import FormikInput from "../../forms/Input";
import PotProcessingLabwarePlan from "./PotProcessingLabwarePlan";
import ProcessingSuccess from "../ProcessingSuccess";
import columns from "../../dataTable/labwareColumns";
import { Prompt } from "react-router-dom";
import { useConfirmLeave } from "../../../lib/hooks";

/**
 * Used as Formik's values
 */
export type PotFormValue = {
  labwareType: string;
  commentId?: number;
  fixative: string;
};
export type PotFormData = {
  workNumber: string;
  sourceBarcode: string;
  discardSource: boolean;
  plans: PotFormValue[];
};

const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.POT,
  LabwareTypeName.FETAL_WASTE_CONTAINER,
];

type PotProcessingParams = {
  readonly processingInfo: GetPotProcessingInfoQuery;
};

export default function PotProcessing({ processingInfo }: PotProcessingParams) {
  const [current, send] = useMachine(
    createFormMachine<
      PotProcessingRequest,
      PerformTissuePotMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.PerformTissuePot({
            request: e.values,
          });
        },
      },
    })
  );

  const [selectedLabwareType, setSelectedLabwareType] = React.useState<string>(
    LabwareTypeName.POT
  );
  const [numLabware, setNumLabware] = React.useState<number>(1);
  const [selectedFixative, setSelectedFixative] = React.useState<string>("");
  const { submissionResult, serverError } = current.context;
  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const [shouldConfirm] = useConfirmLeave(true);

  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = React.useMemo(
    () =>
      processingInfo
        ? processingInfo.labwareTypes.filter((lw) =>
            allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
          )
        : [],
    [processingInfo]
  );

  /**
   * Display all plans created
   */
  const buildPlanLayouts = React.useCallback(
    (
      plans: Map<string, NewLabwareLayout>,
      sourceLabware: LabwareFieldsFragment[],
      sampleColors: Map<number, string>,
      deleteAction: (cid: string) => void,
      confirmAction?: (cid: string, plan: undefined) => void,
      scrollRef?: React.MutableRefObject<HTMLDivElement | null>
    ) => {
      type PlanWithId = {
        cid: string;
        plan: NewLabwareLayout | undefined;
      };
      //Group by labware type
      const planWithKeys: PlanWithId[] = Array.from(plans.keys()).map((k) => {
        return {
          cid: k,
          plan: plans.get(k),
        };
      });
      const layoutPlanGroupedByType: Dictionary<PlanWithId[]> = groupBy(
        planWithKeys,
        (planWithKey) => planWithKey.plan!.labwareType.name
      );

      let rowIndx: number = 0;
      return (
        <>
          {sourceLabware.length > 0 && plans.size > 0 && (
            <div className={"py-10"}>
              <Heading level={3} className={"mb-8"}>{`Discard Source`}</Heading>
              <FormikInput
                label={"Discard?  "}
                name={`discardSource`}
                type={"checkbox"}
                className={"p-3 space-x-4"}
              />
            </div>
          )}
          {Object.keys(layoutPlanGroupedByType).length > 0 ? (
            <div className={"flex flex-col py-10 gap-y-20"}>
              {allowedLabwareTypeNames.map((labwareType) => {
                const labwarePlans = layoutPlanGroupedByType[labwareType];
                return (
                  labwarePlans && (
                    <div
                      className={"flex flex-col"}
                      data-testid={`divSection-${labwareType.replace(
                        /\s+/g,
                        ""
                      )}`}
                      key={labwareType}
                    >
                      <Heading
                        className={"mb-8"}
                        level={2}
                      >{`${labwareType.toString()}s`}</Heading>
                      {labwarePlans.map((lwPlan, indx) => {
                        rowIndx++;
                        return (
                          <PotProcessingLabwarePlan
                            key={lwPlan.cid}
                            cid={lwPlan.cid}
                            potProcessInfo={processingInfo!}
                            outputLabware={lwPlan.plan!}
                            sourceLabware={sourceLabware}
                            sampleColors={sampleColors}
                            onDelete={deleteAction}
                            rowIndex={rowIndx - 1}
                            fixative={selectedFixative}
                            ref={
                              labwareType === selectedLabwareType &&
                              indx === labwarePlans.length - numLabware
                                ? scrollRef
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                  )
                );
              })}
            </div>
          ) : (
            <></>
          )}
        </>
      );
    },
    [processingInfo, selectedLabwareType, numLabware, selectedFixative]
  );

  /**
   * Display settings panel to add labware
   */
  const buildPlanCreationSettings = React.useCallback(() => {
    return (
      <div
        className={`mt-4 grid ${
          selectedLabwareType === LabwareTypeName.POT
            ? "grid-cols-3"
            : "grid-cols-2"
        } gap-x-4 gap-y-1 text-center text-sm`}
      >
        <div className="text-gray-500">Labware type</div>
        {selectedLabwareType === LabwareTypeName.POT && (
          <div className="text-gray-500">Fixative</div>
        )}
        <div className="text-gray-500">Number of labware</div>
        <select
          className="mt-1 block  py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100"
          onChange={(e) => setSelectedLabwareType(e.currentTarget.value)}
          data-testid={"labwareType"}
          value={selectedLabwareType}
        >
          {optionValues(allowedLabwareTypes, "name", "name")}
        </select>
        {selectedLabwareType === LabwareTypeName.POT && (
          <select
            className="mt-1 block  py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100"
            onChange={(e) => setSelectedFixative(e.currentTarget.value)}
            data-testid={"fixative"}
            value={selectedFixative}
          >
            {optionValues(processingInfo.fixatives, "name", "name")}
          </select>
        )}
        <input
          type="number"
          className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100"
          onChange={(e) => setNumLabware(Number(e.currentTarget.value))}
          value={numLabware}
          data-testid={"numLabware"}
          min={1}
        />
      </div>
    );
  }, [
    selectedLabwareType,
    setSelectedLabwareType,
    numLabware,
    setNumLabware,
    selectedFixative,
    setSelectedFixative,
    processingInfo.fixatives,
    allowedLabwareTypes,
  ]);

  /**
   * Builds a yup validator for the labware plan form
   */
  function buildValidationSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      workNumber: Yup.string().required(),
      sourceBarcode: Yup.string().required(),
      discardSource: Yup.boolean().optional(),
      plans: Yup.array()
        .of(
          Yup.object().shape({
            fixative: Yup.string().when("labwareType", {
              is: (value: string) => value === LabwareTypeName.POT,
              then: Yup.string()
                .required("Fixative is a required field")
                .oneOf(
                  processingInfo!.fixatives.map((fixative) => fixative.name)
                ),
            }),
            commentId: Yup.number().optional(),
            labwareType: Yup.string()
              .required()
              .oneOf(allowedLabwareTypes.map((type) => type.name)),
          })
        )
        .required()
        .min(1),
    });
  }

  /**Reformat the form data as mutation input**/
  const buildTissuePotRequest = (
    formData: PotFormData
  ): PotProcessingRequest => {
    return {
      sourceBarcode: formData.sourceBarcode,
      workNumber: formData.workNumber,
      sourceDiscarded: formData.discardSource,
      destinations: formData.plans.map((plan) => ({
        labwareType: plan.labwareType,
        commentId: plan.commentId,
        fixative: plan.fixative,
      })),
    };
  };

  /**Save operation performed, so display the success page**/
  if (current.matches("submitted") && submissionResult) {
    return (
      <ProcessingSuccess
        labware={submissionResult.performPotProcessing.labware}
        columns={[
          columns.barcode(),
          columns.donorId(),
          columns.tissueType(),
          columns.spatialLocation(),
        ]}
        successMessage={"Pot processing complete"}
      />
    );
  }

  const isEnableSubmit = (value: PotFormData) => {
    if (!value.sourceBarcode || value.sourceBarcode.length <= 0) return false;
    if (!value.workNumber || value.workNumber.length <= 0) return false;
    if (value.plans.length <= 0) return false;
    return (
      value.plans.filter(
        (val) =>
          val.labwareType === LabwareTypeName.POT &&
          (!val.fixative || val.fixative.length === 0)
      ).length === 0
    );
  };

  return (
    <>
      <motion.div
        variants={variants.fadeInParent}
        initial={"hidden"}
        animate={"visible"}
        exit={"hidden"}
        className="my-4 mx-auto max-w-screen-xl space-y-16"
      >
        {processingInfo && (
          <Formik<PotFormData>
            initialValues={{
              workNumber: "",
              sourceBarcode: "",
              discardSource: false,
              plans: [],
            }}
            onSubmit={async (values) => {
              send({
                type: "SUBMIT_FORM",
                values: buildTissuePotRequest(values),
              });
            }}
            validationSchema={buildValidationSchema()}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <motion.div
                  variants={variants.fadeInWithLift}
                  className="space-y-10"
                >
                  <motion.div variants={variants.fadeInWithLift}>
                    <Heading level={3}>SGP Number</Heading>
                    <p className="mt-2">
                      Please select an SGP number to associate with block
                      processing.
                    </p>
                    <motion.div
                      variants={variants.fadeInWithLift}
                      className="mt-4 md:w-1/2"
                    >
                      <WorkNumberSelect
                        onWorkNumberChange={(workNumber) => {
                          setFieldValue("workNumber", workNumber);
                        }}
                      />
                    </motion.div>
                  </motion.div>

                  <Planner<undefined>
                    selectedLabwareType={allowedLabwareTypes.find(
                      (lt) => lt.name === selectedLabwareType
                    )}
                    numPlansToCreate={numLabware}
                    onPlanChanged={() => {}}
                    buildPlanLayouts={buildPlanLayouts}
                    columns={[
                      labwareScanTableColumns.barcode(),
                      labwareScanTableColumns.donorId(),
                      labwareScanTableColumns.tissueType(),
                      labwareScanTableColumns.spatialLocation(),
                    ]}
                    buildPlanCreationSettings={buildPlanCreationSettings}
                    singleSourceAllowed={true}
                  />

                  {serverError && (
                    <Warning
                      message={"Failed to perform Pot Processing"}
                      error={serverError}
                    />
                  )}
                  {values.plans.length > 0 && (
                    <motion.div
                      variants={variants.fadeInWithLift}
                      className={"sm:flex mt-4 sm:flex-row justify-end"}
                    >
                      <ButtonBar>
                        <BlueButton
                          disabled={!isEnableSubmit(values)}
                          type={"submit"}
                        >
                          Save
                        </BlueButton>
                      </ButtonBar>
                    </motion.div>
                  )}
                </motion.div>
              </Form>
            )}
          </Formik>
        )}
      </motion.div>
      <Prompt
        when={shouldConfirm}
        message={"You have unsaved changes. Are you sure you want to leave?"}
      />
    </>
  );
}