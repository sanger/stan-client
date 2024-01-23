import Panel from '../Panel';
import React from 'react';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements, { MeasurementConfigProps, SlotMeasurement } from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { CDNAProps } from './Amplification';

const QPcrResults = ({ labware, slotMeasurements, removeLabware }: CDNAProps) => {
  const { values, setErrors, setTouched, setFieldValue } = useFormikContext<VisiumQCFormData>();

  const memoMeasurementConfig: MeasurementConfigProps[] = React.useMemo(
    () => [
      {
        name: 'Cq value',
        stepIncrement: '.01',
        validateFunction: validateCqMeasurementValue,
        initialMeasurementVal: ''
      }
    ],
    []
  );

  /***
   * When labwares changes, the slotMeasurements has to be initialized accordingly
   */
  React.useEffect(() => {
    setErrors({});
    setTouched({});

    if (!labware) {
      return;
    }
    setFieldValue('barcode', labware.barcode);
    const slotMeasurements: SlotMeasurement[] = labware.slots.filter(isSlotFilled).flatMap((slot) => {
      return memoMeasurementConfig.map((measurement) => {
        return {
          address: slot.address,
          name: measurement.name,
          value: measurement.initialMeasurementVal,
          samples: slot.samples
        };
      });
    });
    setFieldValue('slotMeasurements', slotMeasurements);
  }, [labware, setErrors, setTouched, setFieldValue, memoMeasurementConfig]);

  const handleChangeMeasurement = React.useCallback(
    (measurementName: string, measurementValue: string) => {
      setFieldValue(measurementName, measurementValue, true);
    },
    [setFieldValue]
  );

  const handleChangeAllMeasurements = React.useCallback(
    (measurementName: string, measurementValue: string) => {
      //Reset Errors
      setErrors({});
      setTouched({});
      const measurements = values?.slotMeasurements ? [...values.slotMeasurements] : [];
      measurements
        ?.filter((measurement) => measurement.name === measurementName)
        .forEach((measuerementReq) => {
          measuerementReq.value = measurementValue;
        });
      setFieldValue('slotMeasurements', values.slotMeasurements, true);
    },
    [values, setErrors, setTouched, setFieldValue]
  );

  /***
   * Accept values with two decimal values for cq value
   * @param value
   */
  function validateCqMeasurementValue(value: string) {
    let error;
    if (value === '') {
      error = 'Required';
    } else {
      if (Number(value) < 0) {
        error = 'Positive value required';
      }
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
              <div className={'flex flex-row w-1/2 ml-2 space-x-6'}>
                {memoMeasurementConfig.map((measurement) => (
                  <div className={'flex flex-col'} key={measurement.name}>
                    <label className={'mt-2'}>{measurement.name}</label>
                    <input
                      className={'rounded-md'}
                      type={'number'}
                      data-testid={`all-${measurement.name}`}
                      step={measurement.stepIncrement}
                      onChange={(e: any) => {
                        handleChangeAllMeasurements(measurement.name, e.currentTarget.value);
                      }}
                      min={0}
                    />
                  </div>
                ))}
              </div>
            }

            <div className={'grid grid-cols-11 gap-2 justify-between'}>
              <div className="col-span-6">
                {slotMeasurements && slotMeasurements.length > 0 && (
                  <SlotMeasurements
                    slotMeasurements={slotMeasurements}
                    onChangeField={handleChangeMeasurement}
                    measurementConfig={memoMeasurementConfig}
                  />
                )}
              </div>
              <div className="col-span-5 w-full flex items-center justify-center p-4" data-testid={'labware'}>
                <Labware labware={labware} name={labware.labwareType.name} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
export default QPcrResults;
