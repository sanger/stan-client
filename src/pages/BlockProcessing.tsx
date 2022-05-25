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
type BlockFormData = {
  workNumber: string;
  values: BlockFormValue[];
};

const allowedLabwareTypeNames: Array<LabwareTypeName> = [
  LabwareTypeName.TUBE,
  LabwareTypeName.PROVIASETTE,
  LabwareTypeName.CASSETTE,
  LabwareTypeName.PRE_BARCODED_TUBE,
];

export default function BlockProcessing({
  blockProcessingInfo,
}: BlockProcessingParams) {
  const [, send] = useMachine(
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
      deleteAction: (cid: string) => void
    ) => {
      type PlanWithId = {
        cid: string;
        plan: NewLabwareLayout | undefined;
      };
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
        <Form>
          <div className={"flex flex-col py-10 gap-y-20"}>
            {Object.entries(layoutPlanGroupedByType).map(
              ([key, labwarePlans]) => {
                return (
                  <div className={"flex flex-col"}>
                    <Heading className={"mb-8"} level={2}>{`${key}s`}</Heading>
                    {labwarePlans.map((lwPlan) => {
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
                          rowIndex={rowIndx}
                        />
                      );
                    })}
                  </div>
                );
              }
            )}
          </div>
        </Form>
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
      values: Yup.array().of(
        Yup.object().shape({
          sourceBarcode: Yup.string().required(),
          medium: Yup.string().optional(),
          replicateNumber: Yup.string().required(),
          commentId: Yup.number().optional(),
          discardSource: Yup.boolean().optional(),
          preBarcode: Yup.string().optional(),
          labwareType: Yup.string()
            .required()
            .oneOf(allowedLabwareTypes.map((type) => type.name)),
        })
      ),
    });
  }

  const buildTissueBlockRequest = (
    formData: BlockFormData
  ): TissueBlockRequest => {
    return {
      workNumber: formData.workNumber,
      labware: formData.values.map((plan) => ({
        sourceBarcode: plan.sourceBarcode,
        preBarcode: plan.preBarcode,
        commentId: plan.commentId,
        replicate: plan.replicateNumber,
        medium: plan.medium ?? "",
        labwareType: plan.labwareType,
      })),
      discardSourceBarcodes: formData.values
        .filter((plan) => plan.discardSource === true)
        .map((plan) => plan.sourceBarcode),
    };
  };

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
              values: [
                {
                  replicateNumber: "0",
                  sourceBarcode: "",
                  labwareType: LabwareTypeName.TUBE,
                },
              ],
            }}
            validationSchema={buildValidationSchema()}
            onSubmit={async (values) => {
              send({
                type: "SUBMIT_FORM",
                values: buildTissueBlockRequest(values),
              });
            }}
          >
            {({ setFieldValue }) => (
              <Form>
                <div className={"mb-10"}>
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
                <ButtonBar>
                  <BlueButton type="submit">Save</BlueButton>
                </ButtonBar>
              </Form>
            )}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
