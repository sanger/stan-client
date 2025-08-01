import Panel from '../Panel';
import React from 'react';
import { AddressString, LabwareFlaggedFieldsFragment, SlotCopyContent } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements, { MeasurementConfigProps, SlotMeasurement } from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import { VisiumQCFormData } from '../../pages/VisiumQC';
import { stanCore } from '../../lib/sdk';
import Warning from '../notifications/Warning';
import { groupBy } from 'lodash';

export type CDNAProps = {
  labware: LabwareFlaggedFieldsFragment;
  slotMeasurements?: SlotMeasurement[];
  removeLabware?: (barcode: string) => void;
  className?: string;
  slotCopyContent?: SlotCopyContent[];
  cleanedOutAddress?: string[];
};

const fetchCqMeasurementsByBarcode = async (barcode: string): Promise<Array<AddressString>> => {
  const response = await stanCore.FindMeasurementByBarcodeAndName({
    barcode: barcode,
    measurementName: 'Cq value'
  });
  return response.measurementValueFromLabwareOrParent;
};

/* Building the Cq values for different samples transferred from different labware */
const fetchCqMeasurementsBySlotCopyContent = async (
  slotCopyContent: Array<SlotCopyContent>
): Promise<AddressString[]> => {
  const slotCopyContentByBarcode = groupBy(slotCopyContent, 'sourceBarcode');
  const addresses: AddressString[] = [];

  // Fetch measurements for each barcode concurrently
  await Promise.all(
    Object.keys(slotCopyContentByBarcode).map(async (barcode) => {
      const measurementValues = await fetchCqMeasurementsByBarcode(barcode);

      slotCopyContentByBarcode[barcode].forEach((slotCopy) => {
        const mv = measurementValues.find((measurementValue) => measurementValue.address === slotCopy.sourceAddress);
        if (mv) {
          addresses.push({
            address: slotCopy.destinationAddress,
            string: mv.string
          });
        }
      });
    })
  );
  return addresses;
};

const Amplification = ({
  labware,
  removeLabware,
  className,
  slotCopyContent,
  slotMeasurements: initSlotMeasurements,
  cleanedOutAddress
}: CDNAProps) => {
  const { values, setErrors, setTouched, setFieldValue, errors, setFieldError } = useFormikContext<VisiumQCFormData>();

  const memoMeasurementConfig: MeasurementConfigProps[] = React.useMemo(
    () => [
      {
        measurementType: ['Amplification'],
        name: 'CQ VALUE',
        readOnly: true
      },
      {
        measurementType: ['Amplification'],
        name: 'CYCLES',
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
    const fetchCqMeasurements = async (): Promise<Array<AddressString>> => {
      return slotCopyContent
        ? fetchCqMeasurementsBySlotCopyContent(slotCopyContent)
        : fetchCqMeasurementsByBarcode(labware.barcode);
    };
    //Reset Errors
    setErrors({});
    setTouched({});

    if (!labware) {
      return;
    }
    setFieldValue('barcode', labware.barcode);

    if (initSlotMeasurements) {
      setFieldValue('slotMeasurements', initSlotMeasurements);
      return;
    }

    fetchCqMeasurements().then((measurementValues) => {
      if (measurementValues.length === 0) {
        setFieldValue('slotMeasurements', []);
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
  }, [
    labware,
    setErrors,
    setTouched,
    setFieldValue,
    memoMeasurementConfig,
    setFieldError,
    slotCopyContent,
    initSlotMeasurements
  ]);

  const handleChangeMeasurement = React.useCallback(
    (measurementName: string, measurementValue: string) => {
      setFieldValue(measurementName, measurementValue, true);
    },
    [setFieldValue]
  );

  const handleChangeAllMeasurements = React.useCallback(
    async (measurementValue: string) => {
      //Reset Errors
      setErrors({});
      await setTouched({});
      const measurements = values.slotMeasurements ?? [];
      measurements
        ?.filter((measurement) => measurement.name === 'Cycles')
        .forEach((measuerementReq) => {
          measuerementReq.value = measurementValue;
        });
      await setFieldValue('slotMeasurements', measurements, true);
    },
    [setErrors, setTouched, setFieldValue, values.slotMeasurements]
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
      if (removeLabware) removeLabware(barcode);
    },
    [removeLabware]
  );

  return (
    <div className={className ? className : 'max-w-screen-xl mx-auto'}>
      {labware && (
        <div className={'flex flex-col mt-2'}>
          {errors?.barcode && <Warning className={'mt-4'} message={errors.barcode} />}
          <Panel>
            <div className="flex flex-row justify-end">
              {removeLabware && (
                <RemoveButton
                  data-testid={'remove'}
                  onClick={() => {
                    onRemoveLabware(labware.barcode);
                  }}
                />
              )}
            </div>
            {values.slotMeasurements &&
              (values.slotMeasurements.length === 0 ||
                values.slotMeasurements?.some(
                  (measurement) => measurement.name === 'Cq value' && measurement.value === ''
                )) && <Warning className={'mt-4'} message={'No Cq values associated with the labware slots'} />}
            {values.slotMeasurements && values.slotMeasurements.length > 0 && (
              <div className={'flex flex-row w-1/2 mb-2'}>
                <div className={'flex flex-col'}>
                  <label>Cycles</label>
                  <input
                    className={'rounded-md'}
                    type={'number'}
                    data-testid={`all-Cycles`}
                    step={1}
                    onChange={async (e: any) => {
                      await handleChangeAllMeasurements(e.currentTarget.value);
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
                <Labware labware={labware} name={labware.labwareType.name} cleanedOutAddresses={cleanedOutAddress} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
export default Amplification;
