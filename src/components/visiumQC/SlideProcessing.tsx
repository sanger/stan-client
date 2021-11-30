import React from "react";
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
} from "../../types/sdk";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import Panel from "../Panel";
import LabwareResult from "../labwareResult/LabwareResult";

type SlideProcessingProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFieldsFragment;
  labwareResult: CoreLabwareResult | undefined;
  setLabwareResult: (labwareResults: CoreLabwareResult | undefined) => void;
  removeLabware: (barcode: string) => void;
};
const SlideProcessing = ({
  comments,
  labware,
  labwareResult,
  setLabwareResult,
  removeLabware,
}: SlideProcessingProps) => {
  /***
   * When labwares changes, the labwareResults has to be initialized accordingly
   */

  React.useEffect(() => {
    if (!labware) {
      setLabwareResult(undefined);
      return;
    }
    setLabwareResult({
      barcode: labware.barcode,
      sampleResults: labware.slots.filter(isSlotFilled).map((slot) => ({
        address: slot.address,
        result: PassFail.Pass,
      })),
    });
  }, [setLabwareResult, labware]);

  return (
    <>
      {labwareResult && labware && (
        <Panel key={labware.barcode}>
          <LabwareResult
            initialLabwareResult={labwareResult}
            labware={labware}
            availableComments={comments ? comments : []}
            onRemoveClick={removeLabware}
            onChange={(labwareResult) => setLabwareResult(labwareResult)}
          />
        </Panel>
      )}
    </>
  );
};

export default SlideProcessing;
