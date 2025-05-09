import React from 'react';
import {
  CommentFieldsFragment,
  LabwareFlaggedFieldsFragment,
  LabwareResult as CoreLabwareResult,
  PassFail,
  SlideCosting
} from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import Panel from '../Panel';
import LabwareResult from '../labwareResult/LabwareResult';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { slideCostingOptions } from '../../lib/helpers';
import ScanInput from '../scanInput/ScanInput';
import { FormikErrorMessage, selectOptionValues } from '../forms';
import { stanCore } from '../../lib/sdk';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

type SlideProcessingProps = {
  comments: CommentFieldsFragment[];
  labware: LabwareFlaggedFieldsFragment[];
  labwaresResultsProps: CoreLabwareResult[] | undefined;
  removeLabware: (barcode: string) => void;
  cleanedOutAddress?: Map<number, string[]>;
};
const SlideProcessing = ({
  comments,
  labware,
  labwaresResultsProps,
  removeLabware,
  cleanedOutAddress
}: SlideProcessingProps) => {
  const { setFieldValue, values } = useFormikContext<VisiumQCFormData>();
  /***
   * When labwares changes, the labwareResults has to be initialized accordingly
   */
  const [labwaresResults, setLabwaresResults] = React.useState<CoreLabwareResult[] | undefined>(labwaresResultsProps);
  const [initialCosting, setInitialCosting] = React.useState<SlideCosting | undefined>(undefined);

  React.useEffect(() => {
    if (labware.length === 0 || initialCosting) return;
    async function fetchLabwareCosting() {
      const response = await stanCore.GetLabwareCosting(labware[labware.length - 1]);
      const costing = response.labwareCosting ?? undefined;
      setInitialCosting(costing);
      setFieldValue('costing', costing);
    }
    fetchLabwareCosting();
  }, [labware, setFieldValue, initialCosting]);

  React.useEffect(() => {
    if (labware.length === 0) {
      setFieldValue('labwareResult', undefined);
      return;
    }
    setFieldValue(
      'labwareResult',
      labware.map((lw) => ({
        barcode: lw.barcode,
        costing: values.costing,
        reagentLot: values.reagentLot,
        sampleResults: lw.slots.filter(isSlotFilled).map((slot) => ({
          address: slot.address,
          result: PassFail.Pass
        }))
      }))
    );
  }, [setFieldValue, labware, values.costing, values.reagentLot]);

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
      {labwaresResultsProps && labware.length > 0 && labwaresResultsProps.length === labware.length && (
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
                  options={selectOptionValues(slideCostingOptions, 'label', 'value')}
                />
              </div>
              <div className={'flex flex-col'}>
                <ScanInput label={'Reagent LOT number'} name={'reagentLot'} />
                <FormikErrorMessage name={'reagentLot'} />
              </div>
            </div>
          </Panel>
          {labware.map((lw, index) => {
            return (
              <div className="pt-4" key={lw.barcode}>
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
                    cleanedOutAddresses={cleanedOutAddress?.get(lw.id)}
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
