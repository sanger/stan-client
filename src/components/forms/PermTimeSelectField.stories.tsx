import React from 'react';

import { Meta } from '@storybook/react';

import PermTimeSelectField from './PermTimeSelectField';
import { Form, Formik } from 'formik';
import WhiteButton from '../buttons/WhiteButton';

export default {
  title: 'Forms/Formik/PermTimeSelectField',
  component: PermTimeSelectField
} as Meta;

export const Primary = () => {
  return (
    <Formik
      onSubmit={async (values: any) => alert(JSON.stringify(values))}
      initialValues={{
        barcode: '',
        selectedAddress: '',
        selectedTime: 0
      }}
    >
      <Form>
        <PermTimeSelectField barcode={'STAN-311'} />
        <WhiteButton type="submit">Submit</WhiteButton>
      </Form>
    </Formik>
  );
};
