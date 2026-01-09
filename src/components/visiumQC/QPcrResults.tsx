import Panel from '../Panel';
import React from 'react';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements, { MeasurementConfigProps, SlotMeasurement } from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { CDNAProps } from './Amplification';
import { Input } from '../forms/Input';

const QPcrResults = ({ labware, slotMeasurements, removeLabware, cleanedOutAddress, comments }: CDNAProps) => {
  const { values, setErrors, setTouched, setFieldValue } = useFormikContext<VisiumQCFormData>();

  const memoMeasurementConfig: MeasurementConfigProps[] = React.useMemo(
    () => [
      {
        measurementType: ['Cq value'],
        name: 'CQ VALUE',
        stepIncrement: '.01',
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
      return {
        address: slot.address,
        name: 'Cq value',
        value: '',
        samples: slot.samples
      };
    });
    setFieldValue('slotMeasurements', slotMeasurements);
  }, [labware, setErrors, setTouched, setFieldValue, memoMeasurementConfig]);

  const handleChangeAllMeasurements = React.useCallback(
    async (measurementValue: string) => {
      //Reset Errors
      setErrors({});
      await setTouched({});
      const measurements = values?.slotMeasurements ? [...values.slotMeasurements] : [];
      measurements.forEach((measuerementReq) => {
        measuerementReq.value = measurementValue;
      });
      await setFieldValue('slotMeasurements', measurements, true);
    },
    [values, setErrors, setTouched, setFieldValue]
  );

  const onRemoveLabware = React.useCallback(
    (barcode: string) => {
      if (removeLabware) removeLabware(barcode);
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
            <div className={'flex flex-row w-1/2 ml-2 space-x-6'}>
              <div className={'grid grid-cols-2 gap-1'}>
                <label className={'mt-2'}>Cq value</label>
                <Input
                  type={'number'}
                  data-testid="all-Cq value"
                  step="0.1"
                  onChange={async (e: any) => {
                    await handleChangeAllMeasurements(e.currentTarget.value);
                  }}
                  min={0}
                />
              </div>
            </div>

            <div className={'grid grid-cols-11 gap-2 justify-between'}>
              <div className="col-span-6">
                {slotMeasurements && slotMeasurements.length > 0 && (
                  <SlotMeasurements
                    slotMeasurements={slotMeasurements}
                    measurementConfig={memoMeasurementConfig}
                    comments={comments}
                  />
                )}
              </div>
              <div className="col-span-5 w-full flex p-4" data-testid={'labware'}>
                <Labware labware={labware} name={labware.labwareType.name} cleanedOutAddresses={cleanedOutAddress} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
export default QPcrResults;
