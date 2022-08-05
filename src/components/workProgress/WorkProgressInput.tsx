import * as Yup from 'yup';
import Heading from '../Heading';
import { Form, Formik } from 'formik';
import React from 'react';
import BlueButton from '../buttons/BlueButton';
import { WorkStatus } from '../../types/sdk';
import { KeyValueSelector } from '../KeyValueSelector';
import { WorkProgressUrlParams } from '../../pages/WorkProgress';
import { history } from '../../lib/sdk';
import { stringify } from '../../lib/helpers';

/**
 * Enum to fill the Search Type field
 */
export enum WorkProgressSearchType {
  WorkNumber = 'SGP/R&D Number',
  WorkType = 'Work Type',
  Status = 'Status'
}

/**
 * Form validation schema
 */
export const workProgressSearchSchema = (workTypes: string[]) => {
  return Yup.object().shape({
    searchType: Yup.string().oneOf(Object.values(WorkProgressSearchType)).required(),
    searchValues: Yup.array()
      .of(Yup.string().required())
      .when('searchType', {
        is: (value: string) => value === WorkProgressSearchType.WorkType,
        then: Yup.array().of(Yup.string().oneOf(workTypes).required())
      })
      .when('searchType', {
        is: (value: string) => value === WorkProgressSearchType.Status,
        then: Yup.array().of(Yup.string().oneOf(Object.values(WorkStatus)).required())
      })
  });
};

type WorkProgressInputParams = {
  /**
   * Ssearch type and Search values (representation of url structure)
   */
  urlParams: WorkProgressUrlParams;
  /**
   * All Work types available
   */
  workTypes: string[];
};

export default function WorkProgressInput({ urlParams, workTypes }: WorkProgressInputParams) {
  const generateValuesForType = React.useCallback(
    (type: WorkProgressSearchType): string[] => {
      switch (type) {
        case WorkProgressSearchType.WorkNumber:
          return [];
        case WorkProgressSearchType.WorkType:
          return workTypes ?? [];
        case WorkProgressSearchType.Status:
          return Object.values(WorkStatus);
        default:
          return [];
      }
    },
    [workTypes]
  );

  /***Get key-value data for search **/
  const getSearchInputKeyValues = () => {
    const map = new Map<string, string[]>();
    Object.values(WorkProgressSearchType).forEach((key) => {
      map.set(key, generateValuesForType(key));
    });
    return map;
  };

  return (
    <div
      className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4"
      data-testid={'search'}
    >
      <Heading level={3} showBorder={false}>
        Search
      </Heading>
      <Formik
        initialValues={urlParams}
        validateOnChange={true}
        validateOnBlur={false}
        validateOnMount={false}
        onSubmit={async (values) => {
          history.push({
            pathname: '/',
            search: stringify({
              searchType: values.searchType,
              searchValues: values.searchValues
            })
          });
        }}
        validationSchema={workProgressSearchSchema(workTypes)}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className={' flex flex-row md:flex-grow'}>
              <KeyValueSelector
                keyValueMap={getSearchInputKeyValues()}
                onChangeKey={(selectedKey, values: string[]) => {
                  setFieldValue('searchType', selectedKey, false);
                  setFieldValue('searchValues', values);
                }}
                onChangeValue={(selectedValue) => {
                  setFieldValue('searchValues', selectedValue);
                }}
                multiSelectValues={true}
                schemaNameKey={'searchType'}
                schemaNameValue={'searchValues'}
                selected={{
                  key: values.searchType,
                  value: values.searchValues ?? []
                }}
              />
              <div className="flex flex-row items-center justify-end space-x-4 mt-6">
                <BlueButton type="submit" disabled={!values.searchValues || values.searchValues.length <= 0}>
                  Search
                </BlueButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
