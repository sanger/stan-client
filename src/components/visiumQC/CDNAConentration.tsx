import Panel from '../Panel';
import React, { useState } from 'react';
import { CommentFieldsFragment, LabwareFlaggedFieldsFragment } from '../../types/sdk';
import Labware from '../labware/Labware';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import RemoveButton from '../buttons/RemoveButton';
import SlotMeasurements, { MeasurementConfigProps } from '../slotMeasurement/SlotMeasurements';
import { useFormikContext } from 'formik';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { VisiumQCFormData } from '../../pages/VisiumQC';

export type SlotMeasurementRequestForm = {
  address: string;
  name: string;
  value: string;
  commentId?: number;
  sizeRangeId?: number;
};
export type CDNAConcentrationProps = {
  labware: LabwareFlaggedFieldsFragment;
  slotMeasurements: SlotMeasurementRequestForm[] | undefined;
  concentrationComments: CommentFieldsFragment[];
  removeLabware: (barcode: string) => void;
  cleanedOutAddress?: string[];
  libraryConcentrationSizeRange: CommentFieldsFragment[];
};

enum MeasurementTypes {
  cDNAConcentration = 'cDNA concentration',
  LibraryConcentration = 'Library concentration'
}

const measurements: MeasurementConfigProps[] = [
  {
    measurementType: [MeasurementTypes.cDNAConcentration],
    name: 'CDNA CONCENTRATION',
    unit: 'pg/\u00B5l',
    stepIncrement: '.01',
    initialMeasurementVal: '0'
  },
  {
    measurementType: [MeasurementTypes.LibraryConcentration],
    name: `LIBRARY CONCENTRATION`,
    unit: 'pg/\u00B5l',
    stepIncrement: '.01',
    initialMeasurementVal: '0'
  },
  {
    measurementType: [MeasurementTypes.cDNAConcentration, MeasurementTypes.LibraryConcentration],
    name: 'AVERAGE SIZE',
    unit: 'bp',
    stepIncrement: '1',
    initialMeasurementVal: '0'
  },
  {
    measurementType: [MeasurementTypes.LibraryConcentration],
    name: 'MAIN PEAK SIZE',
    unit: 'bp',
    stepIncrement: '1',
    initialMeasurementVal: '0'
  }
];

const CDNAConcentration = ({
  labware,
  slotMeasurements,
  removeLabware,
  concentrationComments,
  cleanedOutAddress,
  libraryConcentrationSizeRange
}: CDNAConcentrationProps) => {
  const { setErrors, setTouched, setFieldValue } = useFormikContext<VisiumQCFormData>();
  const [measurementName, setMeasurementName] = useState('');

  const memoMeasurementConfig: MeasurementConfigProps[] = React.useMemo(() => {
    return measurements.filter((measurement) => measurement.measurementType.includes(measurementName));
  }, [measurementName]);

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
    let slotMeasurements: SlotMeasurementRequestForm[] = [];
    labware.slots.filter(isSlotFilled).forEach((slot) => {
      memoMeasurementConfig.forEach((measurement) => {
        slotMeasurements.push({
          address: slot.address,
          name: measurement.name,
          value: '0',
          commentId: undefined,
          sizeRangeId: undefined
        });
      });
    });
    setFieldValue('slotMeasurements', slotMeasurements);
  }, [labware, measurementName, setErrors, setTouched, setFieldValue, memoMeasurementConfig]);

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
                  handleChange={async (val) => {
                    setMeasurementName((val as OptionType).label);
                    await setFieldValue('slotMeasurements', []);
                  }}
                  options={[
                    { label: MeasurementTypes.cDNAConcentration, value: MeasurementTypes.cDNAConcentration },
                    { label: MeasurementTypes.LibraryConcentration, value: MeasurementTypes.LibraryConcentration }
                  ]}
                />
              </div>
            }
            <div className={'flex flex-row mt-8 justify-between'}>
              <div className="flex flex-col w-full">
                {slotMeasurements && slotMeasurements.length > 0 && measurementName.length > 0 && (
                  <SlotMeasurements
                    slotMeasurements={slotMeasurements}
                    measurementConfig={memoMeasurementConfig}
                    comments={concentrationComments}
                    libraryConcentrationSizeRange={libraryConcentrationSizeRange}
                  />
                )}
              </div>
              <div className="flex flex-col w-full items-end justify-center p-4" data-testid={'labware'}>
                <Labware labware={labware} name={labware.labwareType.name} cleanedOutAddresses={cleanedOutAddress} />
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
export default CDNAConcentration;
