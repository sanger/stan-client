import Panel from '../Panel';
import { QCType } from '../../pages/VisiumQC';
import React, { useState } from 'react';
import { CommentFieldsFragment, LabwareFieldsFragment, SlotMeasurementRequest } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';

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
  const [measurementName, setMeasurementName] = useState(
    qcType === QCType.CDNA_AMPLIFICATION ? 'Cq value' : 'cDNA concentration'
  );

  const measurementConfigMemo = React.useMemo(() => {
    setMeasurementName(qcType === QCType.CDNA_AMPLIFICATION ? 'Cq value' : 'cDNA concentration');
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

  return (
    <div className="max-w-screen-xl mx-auto">
      {labware && (
        <div className={'flex flex-col mt-2'}>
          <Panel>
            <div className="flex flex-row items-center justify-end">
              {<RemoveButton data-testid={'remove'} onClick={() => removeLabware(labware.barcode)} />}
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
                <select
                  className={'rounded-md'}
                  value={measurementName}
                  data-testid={'measurementType'}
                  onChange={(e) => setMeasurementName(e.currentTarget.value)}
                >
                  <option value={'cDNA concentration'} key={'cDNAconcentrationOpt'}>
                    cDNA concentration
                  </option>
                  <option value={'Library concentration'} key={'LibraryconcentrationOpt'}>
                    Library concentration
                  </option>
                </select>
              </div>
            )}
            <div className={'flex flex-row mt-8 justify-between'}>
              {slotMeasurements && slotMeasurements.length > 0 && (
                <SlotMeasurements
                  slotMeasurements={slotMeasurements}
                  measurementName={measurementName}
                  onChangeMeasurement={handleChangeMeasurement}
                  validateValue={measurementConfigMemo.validateFunction}
                  stepIncrement={measurementConfigMemo.stepIncrement}
                  comments={measurementConfigMemo.concentrationComments}
                />
              )}
              <div className="flex flex-col" data-testid={'labware'}>
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
