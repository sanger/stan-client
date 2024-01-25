import Panel from '../Panel';
import React from 'react';
import { AddressString, LabwareFlaggedFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements, { MeasurementConfigProps, SlotMeasurement } from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { stanCore } from '../../lib/sdk';
import Warning from '../notifications/Warning';

export type CDNAProps = {
  labware: LabwareFlaggedFieldsFragment;
  slotMeasurements: SlotMeasurementRequest[] | undefined;
  removeLabware: (barcode: string) => void;
};

const fetchCqMeasurements = async (barcode: string): Promise<Array<AddressString>> => {
  const response = await stanCore.FindMeasurementByBarcodeAndName({
    barcode: barcode,
    measurementName: 'Cq value'
  });
  return response.measurementValueFromLabwareOrParent;
};

const Amplification = ({ labware, removeLabware }: CDNAProps) => {
  const { values, setErrors, setTouched, setFieldValue, errors, setFieldError } = useFormikContext<VisiumQCFormData>();

  const memoMeasurementConfig: MeasurementConfigProps[] = React.useMemo(
    () => [
      {
        name: 'Cq value',
        readOnly: true
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
    fetchCqMeasurements(labware.barcode).then((measurementValues) => {
      if (measurementValues.length === 0) {
        setFieldValue('slotMeasurements', [], false);
        setFieldError('barcode', 'No Cq values associated with the labware slots');
        return;
      }
      const slotMeasurements: SlotMeasurement[] = [];
      labware.slots.filter(isSlotFilled).forEach((slot) => {
        slotMeasurements.push(
          ...[
            {
              address: slot.address,
              name: 'Cq value',
              value:
                measurementValues.find((measurementValue) => measurementValue.address === slot.address)?.string ?? '',
              samples: slot.samples
            },
            {
              address: slot.address,
              name: 'Cycles',
              value: '',
              samples: slot.samples
            }
          ]
        );
      });
      setFieldValue('slotMeasurements', slotMeasurements);
    });
  }, [labware, setErrors, setTouched, setFieldValue, memoMeasurementConfig, setFieldError]);

  const handleChangeMeasurement = React.useCallback(
    (measurementName: string, measurementValue: string) => {
      setFieldValue(measurementName, measurementValue, true);
    },
    [setFieldValue]
  );

  const handleChangeAllMeasurements = React.useCallback(
    (measurementValue: string) => {
      //Reset Errors
      setErrors({});
      setTouched({});
      const measurements = values?.slotMeasurements ? [...values.slotMeasurements] : [];
      measurements
        ?.filter((measurement) => measurement.name === 'Cycles')
        .forEach((measuerementReq) => {
          measuerementReq.value = measurementValue;
        });
      setFieldValue('slotMeasurements', values.slotMeasurements, true);
    },
    [values, setErrors, setTouched, setFieldValue]
  );

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
          {errors?.barcode && <Warning className={'mt-4'} message={errors.barcode} />}
          <Panel>
            <div className="flex flex-row justify-end">
              {
                <RemoveButton
                  data-testid={'remove'}
                  onClick={() => {
                    onRemoveLabware(labware.barcode);
                  }}
                />
              }
            </div>
            {!errors?.barcode && (
              <div className={'flex flex-row w-1/2 mb-2'}>
                <div className={'flex flex-col'}>
                  <label>Cycles</label>
                  <input
                    className={'rounded-md'}
                    type={'number'}
                    data-testid={`all-Cycles`}
                    step={1}
                    onChange={(e: any) => {
                      handleChangeAllMeasurements(e.currentTarget.value);
                    }}
                    min={0}
                  />
                </div>
              </div>
            )}
            <div className={'grid grid-cols-11 gap-2 justify-between'}>
              <div className="col-span-6">
                {values.slotMeasurements && values.slotMeasurements.length > 0 && (
                  <SlotMeasurements
                    slotMeasurements={values.slotMeasurements}
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
export default Amplification;
