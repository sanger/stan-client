import React, { useContext, useEffect } from "react";
import {
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  RecordStainResultMutation,
  ResultRequest,
} from "../../types/sdk";
import { useCollection } from "../../lib/hooks/useCollection";
import LabwareResult from "../labwareResult/LabwareResult";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import Panel from "../Panel";
import { VisiumQCTypeProps } from "../../pages/VisiumQC";
import { StanCoreContext } from "../../lib/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";

const SlideProcessing = ({
  workNumber,
  labwares,
  removeLabware,
  comments,
  recordResult,
}: VisiumQCTypeProps) => {
  const labwareResults = useCollection<CoreLabwareResult>({
    getKey: (item) => item.barcode,
  });

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

  useEffect(() => {
    debugger;
    if (recordResult) {
      send({
        type: "SUBMIT_FORM",
        values: {
          workNumber,
          labwareResults: labwareResults.items,
        },
      });
    }
  }, [recordResult]);

  useEffect(() => {
    labwares.map((labware) => {
      labwareResults.append(buildLabwareResult(labware));
    });
  }, [labwares]);

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
      {labwares.map(
        (labware) =>
          labwareResults.getItem(labware.barcode) && (
            <Panel key={labware.barcode}>
              <LabwareResult
                initialLabwareResult={
                  labwareResults.getItem(labwares[0].barcode)!
                }
                labware={labware}
                availableComments={comments}
                onRemoveClick={removeLabware}
                onChange={(labwareResult) =>
                  labwareResults.update(labwareResult)
                }
              />
            </Panel>
          )
      )}
    </>
  );
};

export default SlideProcessing;
