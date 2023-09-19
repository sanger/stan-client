import Panel from '../Panel';
import React from 'react';
import { LabwareFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';

export type AmplificationProps = {
  labware: LabwareFieldsFragment;
  slotMeasurements: SlotMeasurementRequest[] | undefined;
  removeLabware: (barcode: string) => void;
};

const Amplification = ({ labware, slotMeasurements, removeLabware }: AmplificationProps) => {
  const { values, setErrors, setTouched, setFieldValue } = useFormikContext<VisiumQCFormData>();

  const measurements = React.useMemo(
    () => [
      {
        name: 'Cq value',
        stepIncrement: '.01',
        validateFunction: validateCqMeasurementValue,
        initialMeasurementVal: ''
      },
      {
        name: 'Cycles',
        stepIncrement: '1',
        validateFunction: validateCyclesMeasurementValue,
        initialMeasurementVal: ''
      }
    ],
    []
  );

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
    const slotMeasurements: SlotMeasurementRequest[] = labware.slots.filter(isSlotFilled).flatMap((slot) => {
      return measurements.map((measurement) => {
        return {
          address: slot.address,
          name: measurement.name,
          value: measurement.initialMeasurementVal
        };
      });
    });
    setFieldValue('slotMeasurements', slotMeasurements);
  }, [labware, setErrors, setTouched, setFieldValue, measurements]);

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

  /***
   * Only accept integer values for cDNA Amplification
   * @param value
   */
  function validateCyclesMeasurementValue(value: string) {
    let error;
    if (value === '') {
      error = 'Required';
    } else {
      if (Number(value) < 0) {
        error = 'Positive value required';
      }
      if (!Number.isInteger(Number(value))) {
        error = 'Integer value required';
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
                {measurements.map((measurement) => (
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

            <div className={'flex flex-row mt-8 justify-between'}>
              <div className="flex flex-col w-full">
                {slotMeasurements && slotMeasurements.length > 0 && (
                  <SlotMeasurements
                    slotMeasurements={slotMeasurements}
                    onChangeField={handleChangeMeasurement}
                    measurements={measurements.map((measurement) => {
                      return {
                        name: measurement.name,
                        stepIncrement: measurement.stepIncrement,
                        validateValue: measurement.validateFunction
                      };
                    })}
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
export default Amplification;
