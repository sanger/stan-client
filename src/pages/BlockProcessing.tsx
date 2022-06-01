import {
  GetTissueBlockProcessingInfoQuery,
  LabwareFieldsFragment,
  PerformTissueBlockMutation,
  TissueBlockRequest,
} from "../types/sdk";
import { useMachine } from "@xstate/react";
import ButtonBar from "../components/ButtonBar";
import AppShell from "../components/AppShell";
import BlueButton from "../components/buttons/BlueButton";
import React from "react";
import { LabwareTypeName, NewLabwareLayout } from "../types/stan";
import labwareScanTableColumns from "../components/dataTable/labwareColumns";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import BlockProcessingLabwarePlan from "../components/blockProcessing/BlockProcessingLabwarePlan";
import { Dictionary, groupBy } from "lodash";
import Heading from "../components/Heading";
import Planner from "../components/planning/Planner";
import createFormMachine from "../lib/machines/form/formMachine";
import { stanCore } from "../lib/sdk";
import WorkNumberSelect from "../components/WorkNumberSelect";
import columns from "../components/dataTable/labwareColumns";
import BlockProcessingSuccess from "../components/blockProcessing/BlockProcessingSuccess";
import Warning from "../components/notifications/Warning";
import { Prompt } from "react-router-dom";
import { useConfirmLeave } from "../lib/hooks";

type BlockProcessingParams = {
  readonly blockProcessingInfo: GetTissueBlockProcessingInfoQuery;
};

/**
 * Used as Formik's values
 */
export type BlockFormValue = {
  sourceBarcode: string;
  labwareType: string;
  replicateNumber: string;
  medium?: string;
  commentId?: number;
  discardSource?: boolean;
  preBarcode?: string;
};
export type BlockFormData = {
  workNumber: string;
  plans: BlockFormValue[];
};

const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.PRE_BARCODED_TUBE,
  LabwareTypeName.PROVIASETTE,
  LabwareTypeName.CASSETTE,
];

export default function BlockProcessing({
  blockProcessingInfo,
}: BlockProcessingParams) {
  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const [shouldConfirm] = useConfirmLeave(true);

  const [current, send] = useMachine(
    createFormMachine<
      TissueBlockRequest,
      PerformTissueBlockMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.PerformTissueBlock({
            request: e.values,
          });
        },
      },
    })
  );

  const { submissionResult, serverError } = current.context;

  debugger;
  /**
   * Limit the labware types the user can Section on to.
   */
  const allowedLabwareTypes = blockProcessingInfo.labwareTypes.filter((lw) =>
    allowedLabwareTypeNames.includes(lw.name as LabwareTypeName)
  );

  const buildPlanLayouts = React.useCallback(
    (
      plans: Map<string, NewLabwareLayout>,
      sourceLabware: LabwareFieldsFragment[],
      sampleColors: Map<number, string>,
      deleteAction: (cid: string) => void,
      confirmAction?: (cid: string, plan: undefined) => void,
      labwareAddType?: string,
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
      return Object.keys(layoutPlanGroupedByType).length > 0 ? (
        <div className={"flex flex-col py-10 gap-y-20"}>
          {allowedLabwareTypeNames.map((labwareType) => {
            const labwarePlans = layoutPlanGroupedByType[labwareType];
            return (
              labwarePlans && (
                <div
                  className={"flex flex-col"}
                  data-testid={`divSection-${labwareType}`}
                  key={labwareType}
                >
                  <Heading
                    className={"mb-8"}
                    level={2}
                  >{`${labwareType.toString()}s`}</Heading>
                  {labwarePlans.map((lwPlan, indx) => {
                    rowIndx++;
                    return (
                      <BlockProcessingLabwarePlan
                        key={lwPlan.cid}
                        cid={lwPlan.cid}
                        blockProcessInfo={blockProcessingInfo}
                        outputLabware={lwPlan.plan!}
                        sourceLabware={sourceLabware}
                        sampleColors={sampleColors}
                        onDelete={deleteAction}
                        rowIndex={rowIndx - 1}
                        ref={
                          labwareType === labwareAddType &&
                          indx === labwarePlans.length - 1
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
      );
    },
    [blockProcessingInfo]
  );

  /**
   * Builds a yup validator for the labware plan form
   */
  function buildValidationSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      workNumber: Yup.string().required(),
      plans: Yup.array()
        .of(
          Yup.object().shape({
            sourceBarcode: Yup.string().required().min(1),
            medium: Yup.string()
              .required("Medium is a required field.")
              .oneOf(blockProcessingInfo.mediums.map((medium) => medium.name)),
            replicateNumber: Yup.string().required(),
            commentId: Yup.number().optional(),
            discardSource: Yup.boolean().optional(),
            labwareType: Yup.string()
              .required()
              .oneOf(allowedLabwareTypes.map((type) => type.name)),
            preBarcode: Yup.string().when("labwareType", {
              is: (value: string) =>
                value === LabwareTypeName.PRE_BARCODED_TUBE,
              then: Yup.string()
                .required("Barcode is a required field.")
                .matches(
                  /[a-zA-Z]{2}\d{8}/,
                  "Barcode should be in the format with two letters followed by 8 numbers"
                ),
            }),
          })
        )
        .required()
        .min(1),
    });
  }

  const buildTissueBlockRequest = (
    formData: BlockFormData
  ): TissueBlockRequest => {
    return {
      workNumber: formData.workNumber,
      labware: formData.plans.map((plan) => ({
        sourceBarcode: plan.sourceBarcode,
        preBarcode: plan.preBarcode,
        commentId: plan.commentId,
        replicate: plan.replicateNumber,
        medium: plan.medium ?? "",
        labwareType: plan.labwareType,
      })),
      discardSourceBarcodes: formData.plans
        .filter((plan) => plan.discardSource === true)
        .map((plan) => plan.sourceBarcode),
    };
  };

  if (current.matches("submitted") && submissionResult) {
    return (
      <BlockProcessingSuccess
        labware={submissionResult.performTissueBlock.labware}
        columns={[
          columns.barcode(),
          columns.donorId(),
          columns.tissueType(),
          columns.spatialLocation(),
        ]}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Block Processing</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <Formik<BlockFormData>
            initialValues={{
              workNumber: "",
              plans: [],
            }}
            validationSchema={buildValidationSchema()}
            onSubmit={async (values) => {
              send({
                type: "SUBMIT_FORM",
                values: buildTissueBlockRequest(values),
              });
            }}
          >
            {({ setFieldValue, isValid, values }) => (
              <Form>
                <div className={"space-y-10"}>
                  <div>
                    <Heading level={3}>SGP Number</Heading>
                    <p className="mt-2">
                      Please select an SGP number to associate with block
                      processing.
                    </p>
                    <div className="mt-4 md:w-1/2">
                      <WorkNumberSelect
                        onWorkNumberChange={(workNumber) => {
                          setFieldValue("workNumber", workNumber);
                        }}
                      />
                    </div>
                  </div>
                  <Planner<undefined>
                    operationType={"Section"}
                    allowedLabwareTypes={allowedLabwareTypes}
                    onPlanChanged={() => {}}
                    buildPlanLayouts={buildPlanLayouts}
                    columns={[
                      labwareScanTableColumns.barcode(),
                      labwareScanTableColumns.donorId(),
                      labwareScanTableColumns.tissueType(),
                      labwareScanTableColumns.spatialLocation(),
                      labwareScanTableColumns.replicate(),
                    ]}
                    multiplePlanCreationRequired={true}
                  />
                  {serverError && (
                    <Warning
                      message={"Failed to perform Block Processing"}
                      error={serverError}
                    />
                  )}
                  {values.plans.length > 0 && (
                    <div className={"sm:flex mt-4 sm:flex-row justify-end"}>
                      <ButtonBar>
                        <BlueButton disabled={!isValid} type={"submit"}>
                          Save
                        </BlueButton>
                      </ButtonBar>
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>

      <Prompt
        when={shouldConfirm}
        message={"You have unsaved changes. Are you sure you want to leave?"}
      />
    </AppShell>
  );
}
