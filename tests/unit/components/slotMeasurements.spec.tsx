import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SlotMeasurements from '../../../src/components/slotMeasurement/SlotMeasurements';
import { Formik } from 'formik';
import { selectOption } from '../../generic/utilities';
afterEach(() => {
  cleanup();
});
const FormikProps = {
  onSubmit: () => {},
  initialValues: {}
};

const renderSlotMeasurements = (props: any) => {
  return render(
    <Formik {...FormikProps}>
      <SlotMeasurements {...props} />
    </Formik>
  );
};

describe('SlotMeasurements', () => {
  it('renders slot measurements', () => {
    renderSlotMeasurements({
      slotMeasurements: [
        { address: 'A1', name: 'Cost', value: '0' },
        { address: 'A2', name: 'Cost', value: '0' }
      ],
      measurementConfig: [{ name: 'Cost', stepIncrement: '0.01', initialMeasurementVal: '0' }]
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByTestId('Cost-input')).toHaveLength(2);
  });
  it('renders multiple measurements for slots', () => {
    renderSlotMeasurements({
      slotMeasurements: [
        { address: 'A1', name: 'Cost', value: '0' },
        { address: 'A1', name: 'Time', value: '0' },
        { address: 'A2', name: 'Cost', value: '0' },
        { address: 'A2', name: 'Time', value: '0' }
      ],
      measurementConfig: [
        { name: 'Cost', stepIncrement: '0.01', initialMeasurementVal: '0' },
        { name: 'Time', stepIncrement: '0.01', initialMeasurementVal: '0' }
      ]
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByTestId('Cost-input')).toHaveLength(2);
    expect(screen.getAllByTestId('Time-input')).toHaveLength(2);
  });
  it('callback function called when measurement value changes', async () => {
    const handleChangeMeasurement = jest.fn();
    renderSlotMeasurements({
      slotMeasurements: [
        { address: 'A1', name: 'Cost', value: '0' },
        { address: 'A2', name: 'Cost', value: '0' }
      ],
      measurementConfig: [{ name: 'Cost', stepIncrement: '0.01', initialMeasurementVal: '0' }],
      onChangeField: handleChangeMeasurement
    });
    const measurement = screen.getAllByTestId('Cost-input')[0];
    await waitFor(() => {
      fireEvent.change(measurement, { target: { value: '2' } });
    });
    expect(handleChangeMeasurement).toHaveBeenCalled();
  });
  it('calls validation function', async () => {
    const validateValueMock = jest.fn();
    renderSlotMeasurements({
      slotMeasurements: [
        { address: 'A1', name: 'Cost', value: '0' },
        { address: 'A2', name: 'Cost', value: '0' }
      ],
      measurementConfig: [
        { name: 'Cost', stepIncrement: '0.01', validateFunction: validateValueMock, initialMeasurementVal: '0' }
      ],
      onChangeField: jest.fn()
    });
    const measurement = screen.getAllByTestId('Cost-input')[0];
    await waitFor(() => {
      fireEvent.change(measurement, { target: { value: '-1' } });
      fireEvent.blur(measurement);
    });

    expect(validateValueMock).toHaveBeenCalled();
  });
  it('renders comments measurements for slots', () => {
    renderSlotMeasurements({
      slotMeasurements: [
        { address: 'A1', name: 'Cost', value: '0', commentId: 0 },
        { address: 'A2', name: 'Cost', value: '0', commentId: 0 }
      ],
      measurementConfig: [
        { name: 'Cost', stepIncrement: '0.01', initialMeasurementVal: '0' },
        { name: 'Time', stepIncrement: '0.01', initialMeasurementVal: '0' }
      ],
      comments: [
        { id: 0, text: 'Comment 1', enabled: true },
        { id: 1, text: 'Comment 2', enabled: true }
      ]
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    const comments = screen.getByTestId('comments0');
    expect(comments).toBeInTheDocument();
  });
  it('invokes callback when comment changes', async () => {
    const handleChangeComment = jest.fn();
    renderSlotMeasurements({
      slotMeasurements: [{ address: 'A1', name: 'Cost', value: '0', commentId: 0 }],
      measurementConfig: [
        { name: 'Cost', stepIncrement: '0.01', initialMeasurementVal: '0' },
        { name: 'Time', stepIncrement: '0.01', initialMeasurementVal: '0' }
      ],
      comments: [
        { id: 0, text: 'comment 1', enabled: true },
        { id: 1, text: 'comment 2', enabled: true }
      ],
      onChangeField: handleChangeComment
    });
    const comments = screen.getByTestId('comments0');
    expect(comments).toBeInTheDocument();

    await selectOption('comments0', 'comment 2');

    await waitFor(() => {
      expect(screen.getByTestId('comments0')).toHaveTextContent('comment 2');
      expect(handleChangeComment).toHaveBeenCalled();
    });
  });
});
