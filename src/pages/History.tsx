import React from "react";
import AppShell from "../components/AppShell";
import { Form, Formik } from "formik";
import FormikInput from "../components/forms/Input";
import FormikSelect from "../components/forms/Select";
import BlueButton from "../components/buttons/BlueButton";
import { useLocation } from "react-router-dom";
import { objectKeys, safeParseQueryString, stringify } from "../lib/helpers";
import HistoryComponent, {
  historyDisplayValues,
} from "../components/history/History";
import { history } from "../lib/sdk";
import { HistoryProps, historySchema, isHistoryProps } from "../types/stan";
import Heading from "../components/Heading";

export default function History() {
  const location = useLocation();
  const historyProps = safeParseQueryString(
    location.search,
    isHistoryProps,
    castSearchProps
  );
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
            <Heading level={3} showBorder={false}>
              Search
            </Heading>
            <Formik<HistoryProps>
              initialValues={initialValues}
              onSubmit={async (values) => {
                history.replace(`/history?${stringify(values)}`);
              }}
            >
              <Form>
                <div className="space-y-2 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-center md:gap-4">
                  <div className="md:flex-grow">
                    <FormikInput name="value" label="" />
                  </div>

                  <div className="md:flex-grow">
                    <FormikSelect label="" name="kind">
                      {objectKeys(historyDisplayValues).map((selectValue) => (
                        <option value={selectValue} key={selectValue}>
                          {historyDisplayValues[selectValue]}
                        </option>
                      ))}
                    </FormikSelect>
                  </div>

                  <div className="sm:flex sm:flex-row justify-end">
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
  kind: "labwareBarcode",
  value: "",
};

/**
 * Attempt to cast {@code val} to {@link HistoryProps} using its schema.
 * If it fails to do so (e.g. due to URL params being malformed), returns {@code val}
 * @param val the value to try and cast to {@link HistoryProps}
 */
function castSearchProps(val: any) {
  try {
    return historySchema.cast(val);
  } catch (e) {
    return val;
  }
}
