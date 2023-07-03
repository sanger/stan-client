import React, { useEffect, useMemo } from 'react';
import DataLoader from '../dataLoader/DataLoader';
import { stanCore } from '../../lib/sdk';
import Labware from '../labware/Labware';
import RadioGroup, { RadioButton } from './RadioGroup';
import { FindPermDataQuery, VisiumAnalysisRequest } from '../../types/sdk';
import { useFormikContext } from 'formik';
import { mapify } from '../../lib/helpers';
import Warning from '../notifications/Warning';

type PermSelectFieldProps = {
  /**
   * Barcode of the labware to select a perm time from
   */
  barcode: string;
};

/**
 * Formik input for allowing a user to select the best perm time for a slide.
 */
export default function PermTimeSelectField({ barcode }: PermSelectFieldProps) {
  return (
    <DataLoader loader={() => stanCore.FindPermData({ barcode })}>
      {(data) => <PermTimeSelectFieldInner data={data} />}
    </DataLoader>
  );
}

type PermSelectFieldInnerProps = {
  data: FindPermDataQuery;
};

function PermTimeSelectFieldInner({ data }: PermSelectFieldInnerProps) {
  const { setFieldValue, values } = useFormikContext<VisiumAnalysisRequest>();
  const addressPermDataMap = useMemo(() => {
    return mapify(data.visiumPermData.addressPermData, 'address');
  }, [data]);

  const initialSelectedAddress = data.visiumPermData.addressPermData.find((apd) => apd.selected)?.address;

  /**
   * If there's an initial selected address, make sure it's already selected in the form
   */
  useEffect(() => {
    if (initialSelectedAddress) {
      setFieldValue('selectedAddress', initialSelectedAddress);
    }
  }, [initialSelectedAddress, setFieldValue]);

  /**
   * When a new slot is selected, set the selected time for that slot
   */
  useEffect(() => {
    setFieldValue('selectedTime', addressPermDataMap.get(values.selectedAddress)?.seconds);
  }, [data, values.selectedAddress, setFieldValue, addressPermDataMap]);

  return (
    <>
      <RadioGroup name={'selectedAddress'} label={''}>
        <Labware
          labware={data.visiumPermData.labware}
          slotBuilder={(slot) => {
            const addressPermData = addressPermDataMap.get(slot.address);
            if (!addressPermData || !addressPermData.seconds) return null;
            const name = `${Math.floor(addressPermData.seconds / 60)} minutes`;
            return <RadioButton name={name} value={addressPermData.address} />;
          }}
        />

        {/* Display a warning if a slide already has a selected perm time, and a new one has been chosen */}
        {values.selectedAddress !== '' && initialSelectedAddress && values.selectedAddress !== initialSelectedAddress && (
          <div className="mt-2">
            <Warning message={'Warning'}>The selected perm time is being changed for this slide</Warning>
          </div>
        )}
      </RadioGroup>
    </>
  );
}
