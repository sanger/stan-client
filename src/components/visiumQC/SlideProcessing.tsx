import React, { useContext, useEffect, useState } from "react";
import {
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  RecordVisiumQcMutation,
  ResultRequest,
} from "../../types/sdk";
import LabwareResult from "../labwareResult/LabwareResult";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import Panel from "../Panel";
import { QCType, VisiumQCTypeProps } from "../../pages/VisiumQC";
import { StanCoreContext } from "../../lib/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";

const SlideProcessing = ({
  workNumber,
  labware,
  removeLabware,
  comments,
  saveResult,
  notifySaveStatus,
}: VisiumQCTypeProps) => {
  const [labwareResult, setLabwareResult] = useState<CoreLabwareResult>();
  const stanCore = useContext(StanCoreContext);

  const [current, send] = useMachine(
    createFormMachine<ResultRequest, RecordVisiumQcMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordVisiumQC({
            request: e.values,
          });
        },
      },
    })
  );
  const { serverError } = current.context;

  /***
   * recordResult indicate whether the user has clicked the submit button.
   * Call the SUBMIT_FORM event
   */
  useEffect(() => {
    if (saveResult && labwareResult) {
      send({
        type: "SUBMIT_FORM",
        values: {
          workNumber,
          labwareResults: [labwareResult],
          operationType: QCType.SLIDE_PROCESSING,
        },
      });
    }
  }, [saveResult, labwareResult, send, workNumber]);

  /***
   * When labwares changes ,the labwareResults has to be updated accordingly
   */
  useEffect(() => {
    setLabwareResult(labware ? buildLabwareResult(labware) : undefined);
  }, [labware, setLabwareResult]);

  /***
   * Save(/Recording) operation completed.
   * Notify the parent component with the outcome of Save operation
   */
  useEffect(() => {
    if (current.matches("submitted")) {
      notifySaveStatus({ status: "Success" });
    }
    if (serverError) {
      notifySaveStatus({ status: "Fail", error: serverError });
    }
  }, [current, serverError, notifySaveStatus]);

  function buildLabwareResult(
    labware: LabwareFieldsFragment
  ): CoreLabwareResult {
    return {
      barcode: labware.barcode,
      sampleResults: labware.slots.filter(isSlotFilled).map((slot) => ({
        address: slot.address,
        result: PassFail.Pass,
      })),
    };
  }

  return (
    <>
      {labwareResult && labware && (
        <Panel key={labware.barcode}>
          <LabwareResult
            initialLabwareResult={labwareResult}
            labware={labware}
            availableComments={comments}
            onRemoveClick={removeLabware}
            onChange={(labwareResult) => setLabwareResult(labwareResult)}
          />
        </Panel>
      )}
    </>
  );
};

export default SlideProcessing;
