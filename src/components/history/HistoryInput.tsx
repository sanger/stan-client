import { useFormikContext } from 'formik';
import React from 'react';
import WorkNumberSelect from '../WorkNumberSelect';
import { HistoryUrlParams } from '../../pages/History';
import FormikInput from '../forms/Input';
import CustomReactSelect from '../forms/CustomReactSelect';
import ExternalIDFieldSearchInfo from '../info/ExternalFieldInfo';

type HistoryInputProps = {
  eventTypes: string[];
};
export default function HistoryInput({ eventTypes }: HistoryInputProps) {
  const { values, setFieldValue } = useFormikContext<HistoryUrlParams>();

  return (
    <div
      className="mx-auto max-w-screen-lg mb-6 border-gray-200 bg-gray-100 rounded-md space-y-4"
      data-testid={'history-input'}
    >
      <div className={'grid grid-cols-2 gap-x-10 gap-y-6 bg-gray-100 rounded-md'}>
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
          <FormikInput name="barcode" label="Barcode" data-testid={'barcode'} />
        </div>
        <div className={'flex flex-col '}>
          <FormikInput
            name="externalName"
            label="External Name"
            data-testid={'external-name'}
            info={<ExternalIDFieldSearchInfo />}
          />
        </div>
        <div className={'flex flex-col '}>
          <FormikInput
            name="donorName"
            label="Donor Name"
            data-testid={'donor-name'}
            info={
              <div className={'flex flex-col whitespace-pre-wrap space-x-2 space-y-2'}>
                <p className={'font-medium'}>
                  The donor field supports search by multiple donors using comma separated values.
                </p>
                <p className={'italic text-gray-600'}>
                  E.g. to search for blocks with multiple donor names you can use{' '}
                  <span className={'text-blue-600'}>
                    <code>Donor1</code>
                  </span>
                  ,
                  <span className={'text-blue-600'}>
                    <code>Donor2</code>
                  </span>
                </p>
              </div>
            }
          />
        </div>
        <div className={'flex flex-col '}>
          <CustomReactSelect
            name="eventType"
            label="Event Type"
            emptyOption
            dataTestId={'event-type'}
            options={eventTypes.sort().map((evtType) => ({ label: evtType, value: evtType }))}
            value={values.eventType}
          />
        </div>
      </div>
    </div>
  );
}
