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
import { QCType } from "../../pages/VisiumQC";
import { StanCoreContext } from "../../lib/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";
import BlueButton from "../buttons/BlueButton";
import { VisiumQCTypeProps } from "./VisiumQCType";

const SlideProcessing = ({
  workNumber,
  labware,
  removeLabware,
  comments,
  onSave,
  onError,
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
      onSave();
    }
    if (serverError) {
      onError(serverError);
    }
  }, [current, serverError, onSave, onError]);

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

      <div className={"mt-4 flex flex-row items-center justify-end"}>
        <BlueButton
          disabled={!labware}
          onClick={() => {
            labwareResult &&
              send({
                type: "SUBMIT_FORM",
                values: {
                  workNumber,
                  labwareResults: [labwareResult],
                  operationType: QCType.SLIDE_PROCESSING,
                },
              });
          }}
        >
          Save
        </BlueButton>
      </div>
    </>
  );
};

export default SlideProcessing;
