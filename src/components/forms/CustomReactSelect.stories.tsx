import React from 'react';

import { Meta } from '@storybook/react';
import { Form, Formik } from 'formik';
import CustomReactSelect from './CustomReactSelect';

export default {
  title: 'Forms/Formik/CustomReactSelect',
  component: CustomReactSelect
} as Meta;

export const Primary = () => {
  return (
    <Formik
      onSubmit={async (values: any) => alert(JSON.stringify(values))}
      initialValues={{
        workTypes: ['Work type 2', 'Work type 1']
      }}
    >
      {({ values }) => (
        <Form>
          <CustomReactSelect
            name="workTypes"
            options={[
              { label: 'Work type 1', value: 'workType1' },
              { label: 'Work type 2', value: 'workType2' },
              { label: 'Work type 3', value: 'workType3' },
              { label: 'Work type 4', value: 'workType4' }
            ]}
            value={values.workTypes}
            isMulti={true}
          />
        </Form>
      )}
    </Formik>
  );
};
