import React from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import BlueButton from '../components/buttons/BlueButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { safeParseQueryString, stringify } from '../lib/helpers';
import HistoryComponent from '../components/history/History';
import Heading from '../components/Heading';
import ExternalIDFieldSearchInfo from '../components/info/ExternalFieldInfo';
import Information from '../components/notifications/Information';
import * as Yup from 'yup';
import HistoryInput from '../components/history/HistoryInput';
import { stanCore } from '../lib/sdk';

/**
 * Data structure to keep the data associated with this component
 */
export type HistoryUrlParams = {
  workNumber?: string;
  barcode?: string;
  donorName?: string;
  externalName?: string;
  sampleId?: string;
  eventType?: string;
};

/**
 * Form validation schema
 */
export const historySearchSchema = () => {
  return Yup.object().shape({
    workNumber: Yup.string(),
    barcode: Yup.string(),
    donorName: Yup.string(),
    externalName: Yup.string(),
    eventType: Yup.string()
  });
};

export default function History() {
  const [eventTypes, setEventTypes] = React.useState<string[]>([]);

  const location = useLocation();
  const historyProps = safeParseQueryString<HistoryUrlParams>({
    query: location.search,
    schema: historySearchSchema()
  });

  const defaultInitialValues: HistoryUrlParams = {
    workNumber: undefined,
    barcode: undefined,
    donorName: undefined,
    externalName: undefined,
    eventType: undefined
  };

  React.useEffect(() => {
    const fetchEventTypes = async () => {
      const ret = await stanCore.GetEventTypes();
      setEventTypes(ret.eventTypes);
    };
    fetchEventTypes();
  }, [setEventTypes]);

  // If the URL parameters don't parse to valid HistoryProps use the default values
  const initialValues = historyProps ?? defaultInitialValues;
  const navigate = useNavigate();
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
            <Formik<HistoryUrlParams>
              initialValues={initialValues}
              onSubmit={async (values) => {
                navigate(`/history?${stringify(values)}`);
              }}
            >
              <Form>
                <HistoryInput eventTypes={eventTypes} />
                <div className="flex flex-row items-center justify-end space-x-4 mt-6">
                  <BlueButton type="submit">Search</BlueButton>
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
