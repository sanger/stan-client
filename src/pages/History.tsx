import React from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import FormikInput from '../components/forms/Input';
import FormikSelect from '../components/forms/Select';
import BlueButton from '../components/buttons/BlueButton';
import { useLocation } from 'react-router-dom';
import { objectKeys, safeParseQueryString, stringify } from '../lib/helpers';
import HistoryComponent, { historyDisplayValues } from '../components/history/History';
import { history } from '../lib/sdk';
import { HistoryProps, historySchema } from '../types/stan';
import Heading from '../components/Heading';
import ExternalIDFieldSearchInfo from '../components/info/ExternalFieldInfo';
import Information from '../components/notifications/Information';

export default function History() {
  const location = useLocation();
  const historyProps = safeParseQueryString<HistoryProps>({
    query: location.search,
    schema: historySchema
  });
  // If the URL parameters don't parse to valid HistoryProps use the default values
  const initialValues = historyProps ?? defaultInitialValues;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>History</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <div className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
            <div className={'flex flex-row space-x-2'}>
              <Heading level={3} showBorder={false}>
                Search
              </Heading>
              <Information title={'External ID'}>
                <ExternalIDFieldSearchInfo />
              </Information>
            </div>
            <Formik<HistoryProps>
              initialValues={initialValues}
              onSubmit={async (values) => {
                history.replace(`/history?${stringify(values)}`);
              }}
            >
              <Form>
                <div className="md:flex md:flex-row md:justify-center md:items-center md:gap-4">
                  <div className="md:flex-grow">
                    <FormikInput name="value" label="" />
                  </div>
                  <div className="md:flex-grow">
                    <FormikSelect label="" name="kind">
                      {objectKeys(historyDisplayValues)
                        .filter((selectValue) => selectValue !== 'sampleId')
                        .sort()
                        .map((selectValue) => (
                          <option value={selectValue} key={selectValue}>
                            {historyDisplayValues[selectValue]}
                          </option>
                        ))}
                    </FormikSelect>
                  </div>

                  <div className="flex flex-row items-center justify-end space-x-4 mt-6">
                    <BlueButton type="submit">Search</BlueButton>
                  </div>
                </div>
              </Form>
            </Formik>
          </div>

          {historyProps && <HistoryComponent {...historyProps} />}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

/**
 * Initial values for the form if they're not provided from the URL
 */
const defaultInitialValues: HistoryProps = {
  kind: 'labwareBarcode',
  value: ''
};
