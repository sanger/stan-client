import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScanInput from '../../../../src/components/scanInput/ScanInput';
import { Formik } from 'formik';

afterEach(() => {
  cleanup();
});
const FormikProps = {
  onSubmit: () => {},
  initialValues: {}
};
describe('ScanInput', () => {
  describe('Normal Input component', () => {
    describe('On Mount', () => {
      it('displays input component with scan icon', async () => {
        act(() => {
          render(<ScanInput label={'Label'} />);
        });

        const input = (await screen.findByTestId('input')) as HTMLInputElement;
        //Shows the input component
        expect(input).toBeInTheDocument();
        //Displays empty value
        expect(input).toHaveValue('');
        //Show the label
        expect(screen.getByText('Label')).toBeVisible();
      });
    });
    describe('on Entering value', () => {
      it('displays entered value', async () => {
        act(() => {
          render(<ScanInput />);
        });
        const input = (await screen.findByTestId('input')) as HTMLInputElement;
        await waitFor(() => {
          fireEvent.change(input, { target: { value: '123' } });
        });
        expect(input).toHaveValue('123');
      });
    });
  });
  describe('Formik Input component', () => {
    describe('On Mount', () => {
      it('displays input component with scan icon', async () => {
        act(() => {
          render(
            <Formik {...FormikProps}>
              <ScanInput name={'testing'} label={'Label'} />
            </Formik>
          );
        });
        const input = (await screen.findByTestId('formInput')) as HTMLInputElement;
        //Shows the formik input component
        expect(input).toBeInTheDocument();
        //Displays empty value
        expect(input).toHaveValue('');
        //Show the label
        expect(screen.getByText('Label')).toBeVisible();
      });
    });
    describe('on Entering value', () => {
      it('displays entered value', async () => {
        act(() => {
          render(
            <Formik {...FormikProps}>
              <ScanInput name={'testing'} label={'Label'} />
            </Formik>
          );
        });
        const input = (await screen.findByTestId('formInput')) as HTMLInputElement;
        await waitFor(() => {
          fireEvent.change(input, { target: { value: '123' } });
        });
        expect(input).toHaveValue('123');
      });
    });
  });
});
