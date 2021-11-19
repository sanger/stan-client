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
import { QCType, VisiumQCData } from "../../pages/VisiumQC";
import { StanCoreContext } from "../../lib/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";
import BlueButton from "../buttons/BlueButton";
import { VisiumQCTypeProps } from "./VisiumQCType";
import { useLabwareContext } from "../labwareScanner/LabwareScanner";
import { useFormikContext } from "formik";

const SlideProcessing = ({ comments, onSave, onError }: VisiumQCTypeProps) => {
  const [labwareResult, setLabwareResult] = useState<CoreLabwareResult>();
  const stanCore = useContext(StanCoreContext);

  const { labwares, removeLabware } = useLabwareContext();
  const { values } = useFormikContext<VisiumQCData>();

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
    setLabwareResult(
      labwares.length > 0 ? buildLabwareResult(labwares[0]) : undefined
    );
  }, [labwares, setLabwareResult]);

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
      {labwareResult && labwares.length > 0 && (
        <Panel key={labwares[0].barcode}>
          <LabwareResult
            initialLabwareResult={labwareResult}
            labware={labwares[0]}
            availableComments={comments ? comments : []}
            onRemoveClick={removeLabware}
            onChange={(labwareResult) => setLabwareResult(labwareResult)}
          />
        </Panel>
      )}

      <div className={"mt-4 flex flex-row items-center justify-end"}>
        <BlueButton
          disabled={labwares.length <= 0}
          onClick={() => {
            alert("Worknumber:" + values.workNumber);
            labwareResult &&
              send({
                type: "SUBMIT_FORM",
                values: {
                  workNumber: values.workNumber,
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
