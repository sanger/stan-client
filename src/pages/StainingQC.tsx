import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  GetStainingQcInfoQuery,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  RecordStainResultMutation,
  ResultRequest,
} from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import LabwareResult from "../components/labwareResult/LabwareResult";
import { pick } from "lodash";
import { reload, StanCoreContext } from "../lib/sdk";
import createFormMachine from "../lib/machines/form/formMachine";
import { useMachine } from "@xstate/react";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import BlueButton from "../components/buttons/BlueButton";
import Heading from "../components/Heading";
import Panel from "../components/Panel";

type StainingQCProps = {
  info: GetStainingQcInfoQuery;
};

export default function StainingQC({ info }: StainingQCProps) {
  const [workNumber, setWorkNumber] = useState<string | undefined>();
  const [labwares, setLabwares] = useState<Array<LabwareFieldsFragment>>([]);
  const [labwareResults, setLabwareResults] = useState<{
    [key: string]: CoreLabwareResult;
  }>({});
  const stanCore = useContext(StanCoreContext);

  const [current, send] = useMachine(
    createFormMachine<ResultRequest, RecordStainResultMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordStainResult({
            request: e.values,
          });
        },
      },
    })
  );

  const { serverError } = current.context;

  /**
   * Update labwareResults whenever labwares changes (e.g. labware may have been deleted)
   */

  useEffect(() => {
    const labwareBarcodes = labwares.map((lw) => lw.barcode);
    setLabwareResults((labwareResults) => {
      return pick(labwareResults, labwareBarcodes);
    });
  }, [labwares]);

  /**
   * Callback to handle when one of the LabwareResult components changes.
   * Will replace single LabwareResult in list, leaving others untouched.
   */
  const handleLabwareResultChange = useCallback(
    (labwareResult: CoreLabwareResult) => {
      setLabwareResults((labwareResults) => {
        return {
          ...labwareResults,
          ...{ [labwareResult.barcode]: labwareResult },
        };
      });
    },
    []
  );

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Staining QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-2">
            <Heading level={2}>SGP Number</Heading>

            <p>
              You may optionally select an SGP number to associate with this
              operation.
            </p>

            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={setWorkNumber} />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <Heading level={2}>Slides</Heading>

            <p>Please scan in any slides you wish to QC.</p>

            <LabwareScanner onChange={setLabwares}>
              {({ labwares, removeLabware }) =>
                labwares.map((labware) => (
                  <Panel key={labware.barcode}>
                    <LabwareResult
                      labware={labware}
                      availableComments={info.comments}
                      onRemoveClick={removeLabware}
                      onChange={handleLabwareResultChange}
                    />
                  </Panel>
                ))
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
              disabled={labwares.length <= 0}
              onClick={() =>
                send({
                  type: "SUBMIT_FORM",
                  values: {
                    workNumber,
                    labwareResults: Object.values(labwareResults),
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
