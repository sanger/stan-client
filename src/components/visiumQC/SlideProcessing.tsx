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
import ScanInput from '../scanInput/ScanInput';
import { FormikErrorMessage } from '../forms';
import { stanCore } from '../../lib/sdk';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

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
  const [initialCosting, setInitialCosting] = React.useState<SlideCosting | undefined>(undefined);

  React.useEffect(() => {
    if (!labware) return;
    async function fetchLabwareCosting() {
      const response = await stanCore.GetLabwareCosting(labware);
      const costing = response.labwareCosting ?? undefined;
      setInitialCosting(costing);
      setFieldValue('costing', costing ?? '');
    }
    fetchLabwareCosting();
  }, [labware, setInitialCosting, setFieldValue]);

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
      costing: values.costing,
      reagentLot: values.reagentLot
    });
  }, [setFieldValue, labware, values.costing, values.reagentLot]);

  React.useEffect(() => {
    if (values.costing) {
      setFieldValue('labwareResult', { ...labwareResult, costing: values.costing });
    }
  }, [labwareResult, setFieldValue, values.costing]);

  React.useEffect(() => {
    if (values.reagentLot) {
      setFieldValue('labwareResult', { ...labwareResult, reagentLot: values.reagentLot });
    }
  }, [labwareResult, setFieldValue, values.reagentLot]);
  return (
    <>
      {labwareResultProps && labware && (
        <Panel key={labware.barcode}>
          <div className={'grid grid-cols-2 bg-gray-100 p-4 gap-x-20'}>
            <div className={'flex flex-col'}>
              <CustomReactSelect
                label={'Slide costings'}
                name={'costing'}
                value={labwareResultProps.costing}
                handleChange={(val) => {
                  const slideCosting =
                    (val as OptionType).label.length === 0
                      ? undefined
                      : ((val as OptionType).label as unknown as SlideCosting);
                  setFieldValue('costing', (val as OptionType).label);
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
                isDisabled={initialCosting !== undefined}
                dataTestId="slide-costing"
                options={objectKeys(SlideCosting).map((key) => {
                  return {
                    label: SlideCosting[key],
                    value: SlideCosting[key]
                  };
                })}
              />
            </div>
            <div className={'flex flex-col'}>
              <ScanInput label={'Reagent LOT number'} name={'reagentLot'} />
              <FormikErrorMessage name={'reagentLot'} />
            </div>
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
