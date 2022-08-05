import React from 'react';
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail
} from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import Panel from '../Panel';
import LabwareResult from '../labwareResult/LabwareResult';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';

type SlideProcessingProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFieldsFragment;
  labwareResult: CoreLabwareResult | undefined;
  removeLabware: (barcode: string) => void;
};
const SlideProcessing = ({ comments, labware, labwareResult, removeLabware }: SlideProcessingProps) => {
  const { setFieldValue } = useFormikContext<VisiumQCFormData>();
  /***
   * When labwares changes, the labwareResults has to be initialized accordingly
   */

  const [labwareResultTest, setLabwareResult] = React.useState<CoreLabwareResult | undefined>(labwareResult);

  React.useEffect(() => {
    if (!labware) {
      setFieldValue('labwareResult', undefined);
      return;
    }
    setFieldValue('labwareResult', {
      barcode: labware.barcode,
      sampleResults: labware.slots.filter(isSlotFilled).map((slot) => ({
        address: slot.address,
        result: PassFail.Pass
      }))
    });
  }, [setFieldValue, labware]);

  React.useEffect(() => {
    setFieldValue('labwareResult', labwareResultTest);
  }, [labwareResultTest, setFieldValue]);

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
