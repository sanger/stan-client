import * as Yup from 'yup';
import Heading from '../Heading';
import { Form, Formik } from 'formik';
import React from 'react';
import BlueButton from '../buttons/BlueButton';
import { WorkStatus } from '../../types/sdk';
import { WorkProgressUrlParams } from '../../pages/WorkProgress';
import { history } from '../../lib/sdk';
import { stringify } from '../../lib/helpers';
import { useLocation } from 'react-router-dom';
import { statusSort } from '../../types/stan';
import WorkNumberSelect from '../WorkNumberSelect';
import { MultiSelect } from '../multiSelect/MultiSelect';

/**
 * Form validation schema
 */
export const workProgressSearchSchema = (workTypes: string[], programs?: string[]) => {
  return Yup.object().shape({
    workNumber: Yup.string(),
    workTypes: Yup.array().of(Yup.string().oneOf(workTypes)),
    programs: Yup.array().of(Yup.string().oneOf(programs ?? [])),
    statuses: Yup.array().of(Yup.string().oneOf(Object.values(WorkStatus)))
  });
};

type WorkProgressInputParams = {
  /**
   * Search type and Search values (representation of url structure)
   */
  urlParams: WorkProgressUrlParams;
  /**
   * All Work types available
   */
  workTypes: string[];
  /**
   * All programs available
   */
  programs?: string[];
};

export default function WorkProgressInput({ urlParams, workTypes, programs }: WorkProgressInputParams) {
  const location = useLocation();
  const sortedStatues = Object.values(WorkStatus).sort((a, b) => statusSort(a, b));

  return (
    <div
      className="mx-auto max-w-screen-lg mb-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4"
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
            pathname: location.pathname,
            search: stringify({
              workNumber: values.workNumber,
              statuses: values.statuses,
              programs: values.programs,
              workTypes: values.workTypes
            })
          });
        }}
        validationSchema={workProgressSearchSchema(workTypes, programs)}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className={'grid grid-cols-2 gap-x-10 gap-y-6 border border-gray-200 bg-gray-100 p-6 rounded-md'}>
              <div className={'flex flex-col '}>
                SGP Number
                <WorkNumberSelect
                  label={'SGP/R&D Number'}
                  emptyOption={true}
                  onWorkNumberChange={(workNumber) => setFieldValue('workNumber', workNumber)}
                  workNumber={values.workNumber}
                />
              </div>
              {programs && (
                <div className={'flex flex-col'}>
                  Program
                  <MultiSelect
                    selectedOptionDisplayPosition={'BOTTOM'}
                    options={programs.map((program) => {
                      return {
                        value: program,
                        key: program,
                        label: program
                      };
                    })}
                    notifySelection={(val) => setFieldValue('programs', val)}
                    selectedValueProp={values.programs}
                    data-testid={'select_program'}
                  />
                </div>
              )}
              {workTypes && (
                <div className={'flex flex-col'}>
                  Work type
                  <MultiSelect
                    selectedOptionDisplayPosition={'BOTTOM'}
                    options={workTypes.sort().map((workType) => {
                      return {
                        value: workType,
                        key: workType,
                        label: workType
                      };
                    })}
                    notifySelection={(val) => setFieldValue('workTypes', val)}
                    selectedValueProp={values.workTypes}
                    data-testid={'select_workType'}
                  />
                </div>
              )}
              {sortedStatues && (
                <div className={'flex flex-col'}>
                  Status
                  <MultiSelect
                    selectedOptionDisplayPosition={'BOTTOM'}
                    options={sortedStatues.map((status) => {
                      return {
                        value: status,
                        key: status,
                        label: status
                      };
                    })}
                    notifySelection={(val) => setFieldValue('statuses', val)}
                    selectedValueProp={values.statuses}
                    data-testid={'select_status'}
                  />
                </div>
              )}
            </div>
            <div className={'flex flex-row md:flex-grow items-center justify-end space-x-4 mt-6'}>
              <BlueButton
                type="submit"
                disabled={
                  !values.workNumber &&
                  (!values.workTypes || values.workTypes.length === 0) &&
                  (!values.programs || values.programs.length === 0) &&
                  (!values.statuses || values.statuses.length === 0)
                }
              >
                Search
              </BlueButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
