import { cleanup, fireEvent, render } from '@testing-library/react';
import FormikInput from '../../../../src/components/forms/Input';
import React, { FC } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

type FormikType = {
  numberField: number;
};

const MockFormikInput: FC = () => {
  const formik = useFormik<FormikType>({
    initialValues: {
      numberField: 2
    },
    onSubmit: jest.fn()
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <FormikInput label="number field" type="number" name="numberField" />
      </Form>
    </FormikProvider>
  );
};

describe('Formik Input', () => {
  test('scroll wheel does not change value', () => {
    const { getByLabelText } = render(<MockFormikInput />);
    const numberInput = getByLabelText('number field');
    expect(numberInput).toHaveValue(2);

    fireEvent.scroll(numberInput, { target: { scrollTop: 200 } });

    expect(numberInput).toHaveValue(2);
  });
});
