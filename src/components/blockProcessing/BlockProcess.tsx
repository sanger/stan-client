import {
  GetTissueBlockProcessingInfoQuery,
  LabwareFieldsFragment,
  LabwareType,
  PlanMutation,
} from "../../types/sdk";
import { useMachine } from "@xstate/react";
import { createBlockProcessingMachine } from "../../components/blockProcessing/blockProcessing.machine";
import ButtonBar from "../../components/ButtonBar";
import AppShell from "../../components/AppShell";
import BlueButton from "../../components/buttons/BlueButton";
import React from "react";
import { NewLabwareLayout } from "../../types/stan";
import PlannerNew from "../../components/planning/Planner_New";
import labwareScanTableColumns from "../../components/dataTable/labwareColumns";
import * as Yup from "yup";
import { Formik } from "formik";
import BlockLabwarePlan from "./BlockLabwarePlan";

type BlockProcessingParams = {
  readonly blockProcessingInfo: GetTissueBlockProcessingInfoQuery;
  readonly allowedLabwareTypes: LabwareType[];
};

/**
 * Used as Formik's values
 */
export type BlockFormValue = {
  sourceBarcode: string;
  medium?: string;
  replicateNumber: string;
  comment?: string;
  discardSource?: boolean;
  preBarcode?: string;
};
type BlockFormData = {
  values: BlockFormValue[];
};

export default function BlockProcess({
  blockProcessingInfo,
  allowedLabwareTypes,
}: BlockProcessingParams) {
  const [current, send] = useMachine(createBlockProcessingMachine());

  const buildLabwarePlans = React.useCallback(
    (
      plans: Map<string, NewLabwareLayout>,
      onDelete: (cid: string) => void,
      onComplete: (cid: string, plan: PlanMutation) => void,
      sampleColors: Map<number, string>,
      operationType: string,
      sourceLabware: LabwareFieldsFragment[]
    ) => {
      return Array.from(plans.entries()).map(([cid, newLabwareLayout], i) => (
        <BlockLabwarePlan
          blockFormValue={buildInitialValues().values[0]}
          blockProcessInfo={blockProcessingInfo}
          outputLabware={newLabwareLayout}
          sourceLabware={sourceLabware}
          sampleColors={sampleColors}
          operationType={operationType}
        />
      ));
    },
    []
  );

  /**
   * The initial values for the labware plan form
   */
  function buildInitialValues(): BlockFormData {
    let formValues: BlockFormData = {
      values: [
        {
          replicateNumber: "0",
          sourceBarcode: "",
        },
      ],
    };
    return formValues;
  }

  /**
   * Builds a yup validator for the labware plan form
   * @param labwareType the labware type of the labware plan
   */
  function buildValidationSchema(): Yup.ObjectSchema {
    return Yup.object().shape({
      values: Yup.array().of(
        Yup.object().shape({
          sourceBarcode: Yup.string().required(),
          medium: Yup.string().optional(),
          replicateNumber: Yup.string().required(),
          comment: Yup.string().optional(),
          discardSource: Yup.boolean().optional(),
          preBarcode: Yup.string().optional(),
        })
      ),
    });
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Block Processing</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="my-4 mx-auto max-w-screen-xl space-y-16">
          <Formik<BlockFormData>
            initialValues={buildInitialValues()}
            validationSchema={buildValidationSchema()}
            onSubmit={async (values) => {}}
          >
            <PlannerNew<PlanMutation>
              operationType={"Section"}
              allowedLabwareTypes={allowedLabwareTypes}
              onPlanChanged={() => {}}
              buildPlans={buildLabwarePlans}
              columns={[
                labwareScanTableColumns.barcode(),
                labwareScanTableColumns.donorId(),
                labwareScanTableColumns.tissueType(),
                labwareScanTableColumns.spatialLocation(),
                labwareScanTableColumns.replicate(),
              ]}
              multiplePlansRequired={false}
            />
          </Formik>
        </div>
      </AppShell.Main>
      <ButtonBar>
        <BlueButton onClick={() => {}}>Save</BlueButton>
      </ButtonBar>
    </AppShell>
  );
}
