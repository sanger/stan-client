import Panel from '../Panel';
import React, { useState } from 'react';
import { CommentFieldsFragment, LabwareFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements, { MeasurementConfigProps } from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { VisiumQCFormData } from '../../pages/VisiumQC';

export type CDNAConcentrationProps = {
  labware: LabwareFieldsFragment;
  slotMeasurements: SlotMeasurementRequest[] | undefined;
  concentrationComments: CommentFieldsFragment[];
  removeLabware: (barcode: string) => void;
};

const CDNAConcentration = ({
  labware,
  slotMeasurements,
  removeLabware,
  concentrationComments
}: CDNAConcentrationProps) => {
  const { setErrors, setTouched, setFieldValue } = useFormikContext<VisiumQCFormData>();
  const [measurementName, setMeasurementName] = useState('');
  const measurementConfig: MeasurementConfigProps[] = React.useMemo(
    () =>
      ['cDNA concentration', 'Library concentration'].map((measurementName) => {
        return {
          name: measurementName,
          stepIncrement: '.01',
          initialMeasurementVal: '0',
          validateFunction: validateConcentrationMeasurementValue
        };
      }),
    []
  );

  const selectedMeasurement = React.useMemo(() => {
    return measurementConfig.find((measurement) => measurement.name === measurementName);
  }, [measurementName, measurementConfig]);

  /***
   * When labwares changes, the slotMeasurements has to be initialized accordingly
   */
  React.useEffect(() => {
    //Reset Errors
    setErrors({});
    setTouched({});
    if (!labware) {
      return;
    }
    setFieldValue('barcode', labware.barcode);
    let slotMeasurements: SlotMeasurementRequest[] = [];
    if (measurementName.length > 0) {
      slotMeasurements = labware.slots.filter(isSlotFilled).map((slot) => {
        return {
          address: slot.address,
          name: measurementName,
          value: '0'
        };
      });
      setFieldValue('slotMeasurements', slotMeasurements);
    }
  }, [labware, measurementName, setErrors, setTouched, setFieldValue]);

  const handleChangeField = React.useCallback(
    (fieldName: string, value: string) => {
      setFieldValue(fieldName, value, true);
    },
    [setFieldValue]
  );

  /***
   *  Only acceptable 0 and decimal numbers of format ###.## Visium concentration
   * @param value
   */
  function validateConcentrationMeasurementValue(value: string) {
    let error;
    if (value === '') {
      error = 'Required';
    } else if (Number(value) < 0) {
      error = 'Positive value required';
    }
    return error;
  }
  const onRemoveLabware = React.useCallback(
    (barcode: string) => {
      removeLabware(barcode);
    },
    [removeLabware]
  );

  return (
    <div className="max-w-screen-xl mx-auto">
      {labware && (
        <div className={'flex flex-col mt-2'}>
          <Panel>
            <div className="flex flex-row items-center justify-end">
              {
                <RemoveButton
                  data-testid={'remove'}
                  onClick={() => {
                    onRemoveLabware(labware.barcode);
                  }}
                />
              }
            </div>

            {
              <div className={'flex flex-col w-1/4 ml-2'}>
                <label className={'my-3'}>Measurement type</label>
                <CustomReactSelect
                  emptyOption={true}
                  className={'rounded-md'}
                  dataTestId={'measurementType'}
                  handleChange={(val) => setMeasurementName((val as OptionType).label)}
                  options={measurementConfig.map((measurement) => {
                    return {
                      label: measurement.name,
                      value: measurement.name
                    };
                  })}
                />
              </div>
            }
            <div className={'flex flex-row mt-8 justify-between'}>
              <div className="flex flex-col w-full">
                {slotMeasurements && slotMeasurements.length > 0 && measurementName.length > 0 && (
                  <SlotMeasurements
                    slotMeasurements={slotMeasurements}
                    onChangeField={handleChangeField}
                    measurementConfig={measurementConfig.filter(
                      (measurement) => measurement.name === selectedMeasurement?.name
                    )}
                    comments={concentrationComments}
                  />
                )}
              </div>
              <div className="flex flex-col w-full items-end justify-center p-4" data-testid={'labware'}>
                <Labware labware={labware} name={labware.labwareType.name} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
export default CDNAConcentration;
