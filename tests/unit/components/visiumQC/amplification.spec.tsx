import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Formik } from 'formik';
import { slideFactory } from '../../../../src/lib/factories/labwareFactory';
import { LabwareFlaggedFieldsFragment } from '../../../../src/types/sdk';
import { enableMapSet } from 'immer';
import Amplification, { CDNAProps } from '../../../../src/components/visiumQC/Amplification';
import { NewFlaggedLabwareLayout } from '../../../../src/types/stan';
afterEach(() => {
  cleanup();
});
beforeEach(() => {
  enableMapSet();
});
const FormikProps = {
  onSubmit: () => {},
  initialValues: {}
};

const renderAmplification = (props?: CDNAProps) => {
  const inputLabware = slideFactory.build() as NewFlaggedLabwareLayout;
  const labware: LabwareFlaggedFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };
  const initialProps = props ?? {
    slotMeasurements: [
      { address: 'A1', name: 'Cost', value: '0' },
      { address: 'A2', name: 'Cost', value: '0' }
    ],
    labware: labware,
    removeLabware: jest.fn()
  };
  return render(
    <Formik {...FormikProps}>
      <Amplification {...initialProps} />
    </Formik>
  );
};

describe('Amplification', () => {
  it('renders Amplification', async () => {
    renderAmplification();
    await waitFor(() => {
      //Displays labware
      expect(screen.getByTestId('labware')).toBeInTheDocument();
      //Should not display table
      expect(screen.queryByRole('table')).toBeInTheDocument();
      expect(screen.getAllByTestId('Cq value-input')).toHaveLength(2);
      expect(screen.getAllByTestId('Cycles-input')).toHaveLength(2);
    });
  });
  it('invokes remove function when labware is removed', async () => {
    const inputLabware = slideFactory.build() as NewFlaggedLabwareLayout;
    const labware: LabwareFlaggedFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };
    const removeFunction = jest.fn();
    const initialProps = {
      slotMeasurements: [
        { address: 'A1', name: 'Cost', value: '0' },
        { address: 'A2', name: 'Cost', value: '0' }
      ],
      labware: labware,
      removeLabware: removeFunction
    };
    renderAmplification(initialProps);
    await waitFor(() => {
      const removeButton = screen.getByTestId('remove');
      fireEvent.click(removeButton);
    });
    expect(removeFunction).toHaveBeenCalled();
  });
});
