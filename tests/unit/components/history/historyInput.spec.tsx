import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import HistoryInput from '../../../../src/components/history/HistoryInput';
import { optionsShouldHaveLength, shouldDisplayValue } from '../../../generic/utilities';
import React from 'react';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
jest.mock('"../../../../src/lib/hooks/useDownload', () => ({
  useDownload: () => ['/download', jest.fn(), '']
}));

jest.mock('../../../../src/components/WorkNumberSelect', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onConfirmed }) => {
      return (
        <select data-testid="workNumber">
          <option value="SGP1008">SGP1008</option>
          <option value="SGP1009">SGP1009</option>
        </select>
      );
    })
  };
});

const initialFormValues = {};
const inputProps = { eventTypes: ['Section', 'Stain'] };
describe('History Input', () => {
  describe('When an empty prop is given', () => {
    beforeEach(() => {
      render(
        <Formik initialValues={initialFormValues} onSubmit={() => {}}>
          <HistoryInput {...inputProps} />
        </Formik>
      );
    });

    it('displays all input fields', () => {
      expect(screen.getByTestId('history-input')).toBeInTheDocument();
      expect(screen.getByTestId('workNumber')).toBeInTheDocument();
      expect(screen.getByTestId('barcode')).toBeInTheDocument();
      expect(screen.getByTestId('external-name')).toBeInTheDocument();
      expect(screen.getByTestId('donor-name')).toBeInTheDocument();
      expect(screen.getByTestId('event-type')).toBeInTheDocument();
    });
    it('displays event types as ptions in dropdown', () => {
      optionsShouldHaveLength('event-type', 2);
    });
    it('should display all input fields as empty', () => {
      expect(screen.getByTestId('barcode')).toHaveTextContent('');
      expect(screen.getByTestId('external-name')).toHaveTextContent('');
      expect(screen.getByTestId('donor-name')).toHaveTextContent('');
      // expect(screen.getByTestId('event-type')).toHaveValue('');
    });
  });
  describe('when a Formik Context has valid initial values', () => {
    it('displays values in all input fields', () => {
      const initialFormValues = {
        barcode: 'STAN-3111',
        externalName: 'EXT1',
        donorName: 'Donor1',
        workNumber: 'SGP1008',
        eventType: 'Section'
      };
      render(
        <Formik initialValues={initialFormValues} onSubmit={() => {}}>
          <HistoryInput {...inputProps} />
        </Formik>
      );
      expect(screen.getByTestId('barcode')).toHaveValue('STAN-3111');
      expect(screen.getByTestId('external-name')).toHaveValue('EXT1');
      expect(screen.getByTestId('donor-name')).toHaveValue('Donor1');
      shouldDisplayValue('event-type', 'Section');
    });
  });
  describe('when a Formik Context has values for some fields', () => {
    it('displays barcode and donor name in the input fields', () => {
      const initialFormValues = { barcode: 'STAN-3111', donorName: 'Donor1' };
      render(
        <Formik initialValues={initialFormValues} onSubmit={() => {}}>
          <HistoryInput {...inputProps} />
        </Formik>
      );
      expect(screen.getByTestId('barcode')).toHaveValue('STAN-3111');
      expect(screen.getByTestId('donor-name')).toHaveValue('Donor1');
      expect(screen.getByTestId('external-name')).toHaveValue('');
    });
  });
  describe('when a invalid value given for event type', () => {
    it('should not select event type', () => {
      const initialFormValues = { eventType: 'Invalid', barcode: 'STAN-3111', donorName: 'Donor1' };
      render(
        <Formik initialValues={initialFormValues} onSubmit={() => {}}>
          <HistoryInput {...inputProps} />
        </Formik>
      );
      expect(screen.getByTestId('barcode')).toHaveValue('STAN-3111');
      expect(screen.getByTestId('donor-name')).toHaveValue('Donor1');
      expect(screen.getByTestId('external-name')).toHaveValue('');
      expect(screen.getByTestId('event-type')).not.toHaveValue('Invalid');
    });
  });
});
