import React, { useCallback, useContext, useState } from "react";
import {
  GetStainingQcInfoQuery,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  RecordStainResultMutation,
  ResultRequest,
} from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareResult from "../components/labwareResult/LabwareResult";
import { reload, StanCoreContext } from "../lib/sdk";
import createFormMachine from "../lib/machines/form/formMachine";
import { useMachine } from "@xstate/react";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import BlueButton from "../components/buttons/BlueButton";
import Heading from "../components/Heading";
import Panel from "../components/Panel";
import { useCollection } from "../lib/hooks/useCollection";
import { isSlotFilled } from "../lib/helpers/slotHelper";

type StainingQCProps = {
  info: GetStainingQcInfoQuery;
};

export const TISSUE_COVERAGE_MEASUREMENT_NAME = "Tissue coverage";

export default function StainingQC({ info }: StainingQCProps) {
  const [workNumber, setWorkNumber] = useState<string>("");
  const labwareResults = useCollection<CoreLabwareResult>({
    getKey: (item) => item.barcode,
  });

  const stanCore = useContext(StanCoreContext);

  const [current, send] = useMachine(
    createFormMachine<ResultRequest, RecordStainResultMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();

          /**Omit all measurements for which the tissue coverage is not specified**/
          const newLabwareResults = e.values.labwareResults.map(
            (labwareResult) => {
              const slotMeasurements = labwareResult.slotMeasurements?.filter(
                (sm) =>
                  sm.value !== "" &&
                  sm.name === TISSUE_COVERAGE_MEASUREMENT_NAME
              );
              return slotMeasurements && slotMeasurements.length > 0
                ? { ...labwareResult, slotMeasurements }
                : {
                    sampleResults: labwareResult.sampleResults,
                    barcode: labwareResult.barcode,
                  };
            }
          );
          return stanCore.RecordStainResult({
            request: {
              labwareResults: newLabwareResults,
              workNumber: e.values.workNumber,
              operationType: e.values.operationType,
            },
          });
        },
      },
    })
  );

  const { serverError } = current.context;
  const onAddLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      labwareResults.append(buildLabwareResult(labware));
    },
    [labwareResults]
  );

  const onRemoveLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      labwareResults.remove(labware.barcode);
    },
    [labwareResults]
  );

  const blueButtonDisabled =
    labwareResults.items.length <= 0 || workNumber === "";

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-2">
            <Heading level={2}>SGP Number</Heading>

            <p>Select an SGP number to associate with this operation.</p>

            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={setWorkNumber} />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <Heading level={2}>Slides</Heading>

            <p>Please scan in any slides you wish to QC.</p>

            <LabwareScanner onAdd={onAddLabware} onRemove={onRemoveLabware}>
              {({ labwares, removeLabware }) =>
                labwares.map(
                  (labware) =>
                    labwareResults.getItem(labware.barcode) && (
                      <Panel key={labware.barcode}>
                        <LabwareResult
                          initialLabwareResult={
                            labwareResults.getItem(labware.barcode)!
                          }
                          labware={labware}
                          availableComments={info.comments}
                          onRemoveClick={removeLabware}
                          onChange={(labwareResult) =>
                            labwareResults.update(labwareResult)
                          }
                        />
                      </Panel>
                    )
                )
              }
            </LabwareScanner>
          </div>

          {serverError && (
            <Warning
              message={"Failed to record Staining QC"}
              error={serverError}
            />
          )}

          <div className={"mt-4 flex flex-row items-center justify-end"}>
            <BlueButton
              disabled={blueButtonDisabled}
              onClick={() =>
                send({
                  type: "SUBMIT_FORM",
                  values: {
                    workNumber,
                    labwareResults: labwareResults.items,
                  },
                })
              }
            >
              Save
            </BlueButton>
          </div>
        </div>

        <OperationCompleteModal
          show={current.matches("submitted")}
          message={"Stain QC complete"}
          onReset={reload}
        >
          <p>
            If you wish to start the process again, click the "Reset Form"
            button. Otherwise you can return to the Home screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}

function buildLabwareResult(labware: LabwareFieldsFragment): CoreLabwareResult {
  return {
    barcode: labware.barcode,
    sampleResults: labware.slots.filter(isSlotFilled).map((slot) => ({
      address: slot.address,
      result: PassFail.Pass,
    })),
    slotMeasurements: labware.slots.filter(isSlotFilled).map((slot) => ({
      address: slot.address,
      name: TISSUE_COVERAGE_MEASUREMENT_NAME,
      value: "",
    })),
  };
}
