import React from 'react';
import {
  CommentFieldsFragment,
  LabwareFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  SlideCosting
} from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import Panel from '../Panel';
import LabwareResult from '../labwareResult/LabwareResult';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { objectKeys } from '../../lib/helpers';
import FormikSelect from '../forms/Select';

type SlideProcessingProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFieldsFragment;
  labwareResultProps: CoreLabwareResult | undefined;
  removeLabware: (barcode: string) => void;
};
const SlideProcessing = ({ comments, labware, labwareResultProps, removeLabware }: SlideProcessingProps) => {
  const { setFieldValue, values } = useFormikContext<VisiumQCFormData>();
  /***
   * When labwares changes, the labwareResults has to be initialized accordingly
   */
  const [labwareResult, setLabwareResult] = React.useState<CoreLabwareResult | undefined>(labwareResultProps);

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
      })),
      costing: values.costing
    });
  }, [setFieldValue, labware, values.costing]);

  React.useEffect(() => {
    if (values.costing) {
      setFieldValue('labwareResult', { ...labwareResult, costing: values.costing });
    }
  }, [labwareResult, setFieldValue, values.costing]);

  return (
    <>
      {labwareResultProps && labware && (
        <Panel key={labware.barcode}>
          <div className={'w-1/2'}>
            <FormikSelect
              label={'Slide costings'}
              name={'costing'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const slideCosting =
                  e.currentTarget.value.length === 0 ? undefined : (e.currentTarget.value as unknown as SlideCosting);
                setFieldValue('costing', e.currentTarget.value);
                setLabwareResult(
                  labwareResult
                    ? {
                        ...labwareResult,
                        costing: slideCosting
                      }
                    : {
                        barcode: labware.barcode,
                        sampleResults: labwareResultProps.sampleResults,
                        costing: slideCosting
                      }
                );
              }}
              emptyOption={true}
              data-testid="slide-costing"
            >
              {objectKeys(SlideCosting).map((key) => (
                <option key={key} value={SlideCosting[key]}>
                  {SlideCosting[key]}
                </option>
              ))}
            </FormikSelect>
          </div>
          <LabwareResult
            initialLabwareResult={labwareResultProps}
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
