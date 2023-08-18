import Panel from '../Panel';
import { QCType } from '../../pages/VisiumQC';
import React, { useState } from 'react';
import { CommentFieldsFragment, LabwareFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';

const showSlotMeasurementTable = (
  qcType: string,
  measurementName: string,
  slotMeasurements: SlotMeasurementRequest[]
): boolean => {
  return qcType === QCType.VISIUM_CONCENTRATION
    ? slotMeasurements.length > 0 && measurementName.length > 0
    : slotMeasurements.length > 0;
};

type CDNAMeasurementQCProps = {
  qcType: string;
  labware: LabwareFieldsFragment;
  slotMeasurements: SlotMeasurementRequest[] | undefined;
  concentrationComments: CommentFieldsFragment[];
  removeLabware: (barcode: string) => void;
};

const CDNAMeasurementQC = ({
  qcType,
  labware,
  slotMeasurements,
  removeLabware,
  concentrationComments
}: CDNAMeasurementQCProps) => {
  const { setErrors, setTouched, setFieldValue } = useFormikContext();
  const [measurementName, setMeasurementName] = useState(qcType === QCType.CDNA_AMPLIFICATION ? 'Cq value' : '');

  const measurementConfigMemo = React.useMemo(() => {
    setMeasurementName(qcType === QCType.CDNA_AMPLIFICATION ? 'Cq value' : '');
    return {
      stepIncrement: qcType === QCType.CDNA_AMPLIFICATION ? '1' : '.01',
      initialMeasurementVal: qcType === QCType.CDNA_AMPLIFICATION ? '' : '0',
      validateFunction:
        qcType === QCType.CDNA_AMPLIFICATION
          ? validateAmplificationMeasurementValue
          : validateConcentrationMeasurementValue,
      isApplySameValueForAllMeasurements: qcType === QCType.CDNA_AMPLIFICATION,
      isSelectMeasurementName: qcType === QCType.VISIUM_CONCENTRATION,
      concentrationComments: qcType === QCType.CDNA_AMPLIFICATION ? [] : concentrationComments
    };
  }, [qcType, concentrationComments]);

  /***
   * When labwares changes, the slotMeasurements has to be initialized accordingly
   */
  React.useEffect(() => {
    //Reset Errors
    setErrors({});
    setTouched({});

    if (!labware || !qcType) {
      return;
    }
    setFieldValue('barcode', labware.barcode);
    const slotMeasurements: SlotMeasurementRequest[] = labware.slots.filter(isSlotFilled).map((slot) => {
      return {
        address: slot.address,
        name: measurementName,
        value: measurementConfigMemo.initialMeasurementVal
      };
    });
    setFieldValue('slotMeasurements', slotMeasurements);
  }, [
    labware,
    measurementName,
    measurementConfigMemo.initialMeasurementVal,
    qcType,
    setErrors,
    setTouched,
    setFieldValue
  ]);

  const handleChangeMeasurement = React.useCallback(
    (address: string, fieldName: string, measurementValue: string) => {
      setFieldValue(fieldName, measurementValue, true);
    },
    [setFieldValue]
  );

  const handleChangeAllMeasurements = React.useCallback(
    (measurementValue: string) => {
      //Reset Errors
      setErrors({});
      setTouched({});

      if (!slotMeasurements) return;
      slotMeasurements.forEach((measurement) => {
        measurement.value = measurementValue;
      });
      setFieldValue('slotMeasurements', slotMeasurements);
    },
    [slotMeasurements, setErrors, setTouched, setFieldValue]
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

  /***
   * Only accept integer values for cDNA Amplification
   * @param value
   */
  function validateAmplificationMeasurementValue(value: string) {
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
    (barcode) => {
      removeLabware(barcode);
      setMeasurementName('');
    },
    [removeLabware, setMeasurementName]
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
            {measurementConfigMemo.isApplySameValueForAllMeasurements && (
              <div className={'flex flex-row w-1/4 ml-2'}>
                <label className={' mt-2'}>{measurementName}</label>
                <input
                  className={'rounded-md ml-3'}
                  type={'number'}
                  data-testid={'allMeasurementValue'}
                  onChange={(e: any) => {
                    if (!Number.isInteger(Number(e.currentTarget.value))) return;
                    handleChangeAllMeasurements(e.currentTarget.value);
                  }}
                  min={0}
                />
              </div>
            )}
            {measurementConfigMemo.isSelectMeasurementName && (
              <div className={'flex flex-col w-1/4 ml-2'}>
                <label className={'my-3'}>Measurement type</label>
                <CustomReactSelect
                  emptyOption={true}
                  className={'rounded-md'}
                  dataTestId={'measurementType'}
                  handleChange={(val) => setMeasurementName((val as OptionType).label)}
                  options={['cDNA concentration', 'Library concentration'].map((conc) => {
                    return {
                      label: conc,
                      value: conc
                    };
                  })}
                />
              </div>
            )}
            <div className={'flex flex-row mt-8 justify-between'}>
              <div className="flex flex-col w-full " data-testid={'labware'}>
                {slotMeasurements && showSlotMeasurementTable(qcType, measurementName, slotMeasurements) && (
                  <SlotMeasurements
                    slotMeasurements={slotMeasurements}
                    measurementName={measurementName}
                    onChangeMeasurement={handleChangeMeasurement}
                    validateValue={measurementConfigMemo.validateFunction}
                    stepIncrement={measurementConfigMemo.stepIncrement}
                    comments={measurementConfigMemo.concentrationComments}
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
export default CDNAMeasurementQC;
