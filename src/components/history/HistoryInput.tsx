import { useFormikContext } from 'formik';
import React from 'react';
import WorkNumberSelect from '../WorkNumberSelect';
import { HistoryUrlParams } from '../../pages/History';
import FormikInput from '../forms/Input';
import CustomReactSelect from '../forms/CustomReactSelect';

type HistoryInputProps = {
  eventTypes: string[];
};
export default function HistoryInput({ eventTypes }: HistoryInputProps) {
  const { values, setFieldValue } = useFormikContext<HistoryUrlParams>();

  return (
    <div
      className="mx-auto max-w-screen-lg mb-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4 shadow-lg hover:shadow-2xl"
      data-testid={'history-input'}
    >
      <div className={'grid grid-cols-2 gap-x-10 gap-y-6 border border-gray-200 bg-gray-100 p-6 rounded-md'}>
        <div className={'flex flex-col '}>
          <WorkNumberSelect
            label={'SGP/R&D Number'}
            emptyOption={true}
            name={'workNumber'}
            onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)}
            workNumber={values.workNumber}
            multiple={false}
            dataTestId={'workNumber'}
            workNumberType={'ALL'}
          />
        </div>
        <div className={'flex flex-col '}>
          <FormikInput name="barcode" label="Barcode" />
        </div>
        <div className={'flex flex-col '}>
          <FormikInput name="externalName" label="External Name" />
        </div>
        <div className={'flex flex-col '}>
          <FormikInput name="donorName" label="Donor Name" />
        </div>
        <div className={'flex flex-col '}>
          <CustomReactSelect
            name="eventType"
            label="Event Type"
            emptyOption
            options={eventTypes.map((evtType) => ({ label: evtType, value: evtType }))}
            value={values.eventType}
          />
        </div>
      </div>
    </div>
  );
}
