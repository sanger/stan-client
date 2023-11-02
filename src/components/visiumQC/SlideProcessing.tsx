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
  labwares: LabwareFieldsFragment[];
  labwaresResultsProps: CoreLabwareResult[] | undefined;
  removeLabware: (barcode: string) => void;
};
const SlideProcessing = ({ comments, labwares, labwaresResultsProps, removeLabware }: SlideProcessingProps) => {
  const { setFieldValue, values } = useFormikContext<VisiumQCFormData>();
  /***
   * When labwares changes, the labwareResults has to be initialized accordingly
   */
  const [labwaresResults, setLabwaresResults] = React.useState<CoreLabwareResult[] | undefined>(labwaresResultsProps);
  const [initialCosting, setInitialCosting] = React.useState<SlideCosting | undefined>(undefined);

  React.useEffect(() => {
    if (labwares.length === 0 || initialCosting) return;
    async function fetchLabwareCosting() {
      const response = await stanCore.GetLabwareCosting(labwares[labwares.length - 1]);
      const costing = response.labwareCosting ?? undefined;
      setInitialCosting(costing);
      setFieldValue('costing', costing);
    }
    fetchLabwareCosting();
  }, [labwares, setFieldValue, initialCosting]);

  React.useEffect(() => {
    if (labwares.length === 0) {
      setFieldValue('labwareResult', undefined);
      return;
    }
    setFieldValue(
      'labwareResult',
      labwares.map((lw) => ({
        barcode: lw.barcode,
        costing: values.costing,
        reagentLot: values.reagentLot,
        sampleResults: lw.slots.filter(isSlotFilled).map((slot) => ({
          address: slot.address,
          result: PassFail.Pass
        }))
      }))
    );
  }, [setFieldValue, labwares, values.costing, values.reagentLot]);

  React.useEffect(() => {
    if (values.costing || values.reagentLot) {
      setFieldValue(
        'labwareResult',
        labwaresResults?.map((lr) => {
          return {
            ...lr,
            costing: values.costing,
            reagentLot: values.reagentLot
          };
        })
      );
    }
  }, [setFieldValue, values.costing, values.reagentLot, labwaresResults]);

  return (
    <>
      {labwaresResultsProps && labwares.length > 0 && labwaresResultsProps.length === labwares.length && (
        <div>
          <Panel>
            <div className={'grid grid-cols-2 bg-gray-100 p-4 gap-x-20'}>
              <div className={'flex flex-col'}>
                <CustomReactSelect
                  label={'Slide costings'}
                  name={'costing'}
                  value={values.costing}
                  handleChange={(val) => {
                    setFieldValue('costing', (val as OptionType).label);
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
          </Panel>
          {labwares.map((lw, index) => {
            return (
              <div className="pt-4">
                <Panel key={lw.barcode}>
                  <LabwareResult
                    key={lw.barcode}
                    initialLabwareResult={labwaresResultsProps[index]}
                    labware={lw}
                    availableComments={comments ? comments : []}
                    onRemoveClick={removeLabware}
                    onChange={(lr) => {
                      const updatedItem: CoreLabwareResult = {
                        ...lr,
                        costing: values.costing,
                        reagentLot: values.reagentLot
                      };
                      labwaresResultsProps[index] = updatedItem;
                      setLabwaresResults((prev) => {
                        if (!prev) return [updatedItem];
                        prev[index] = updatedItem;
                        return prev;
                      });
                    }}
                  />
                </Panel>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SlideProcessing;
