import * as Formik from 'formik';
import { cleanup, render } from '@testing-library/react';
import MetricsReader from '../../../../src/components/xeniumMetrics/MetricsReader';
import { SampleMetricData, XeniumMetricsForm } from '../../../../src/pages/XeniumMetrics';
import { LabwareFlaggedFieldsFragment } from '../../../../src/types/sdk';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';
import { describe } from '@jest/globals';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});
const renderMetricReader = (sampleMetricData: SampleMetricData[]) => {
  const labware: LabwareFlaggedFieldsFragment = createFlaggedLabware('STAN-3123');
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext');
  const getFieldMetaMock = (): XeniumMetricsForm => {
    return {
      runName: 'Run 1',
      runNames: ['Run 1', 'Run 2'],
      workNumber: 'SGP-1008',
      labware,
      sampleMetricData
    };
  };
  useFormikContextMock.mockReturnValue({
    getFieldMeta: getFieldMetaMock,
    setFieldValue: jest.fn(),
    setValues: jest.fn(),
    values: getFieldMetaMock()
  } as unknown as any);

  return render(<MetricsReader rowIndex={0} />);
};
describe('metricsReader', () => {
  describe('on first load', () => {
    const sampleMetricData: SampleMetricData[] = [
      { externalIdAddress: [{ externalId: 'id1', address: 'A1' }], roi: 'top left', metrics: [] }
    ];
    it('enables the select file button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('file-input')).toBeEnabled();
    });
    it('disables the upload button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('upload-btn')).toBeDisabled();
    });
  });
  describe('when the user selects a file', () => {
    const sampleMetricData: SampleMetricData[] = [
      {
        externalIdAddress: [{ externalId: 'id1', address: 'A1' }],
        roi: 'top left',
        metrics: [],
        file: new File([''], 'test.csv')
      }
    ];

    it('keeps the select file button enabled', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('file-input')).toBeEnabled();
    });
    it('enables the upload button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('upload-btn')).toBeEnabled();
    });
    it('displays the name of the uploaded file', () => {
      const { getByText } = renderMetricReader(sampleMetricData);
      expect(getByText('test.csv')).toBeVisible();
    });
    it('displays the remove file button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('failIcon')).toBeVisible();
    });
  });

  describe('when the user uploads a file', () => {
    const sampleMetricData: SampleMetricData[] = [
      {
        externalIdAddress: [{ externalId: 'id1', address: 'A1' }],
        roi: 'top left',
        metrics: [{ name: 'metric1', value: '1' }],
        file: new File([''], 'test.csv'),
        uploadResult: {
          error: undefined,
          success: true,
          file: new File([''], 'test.csv')
        }
      }
    ];

    it('keeps the select file button enabled', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('file-input')).toBeEnabled();
    });
    it('disables the upload button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('upload-btn')).toBeDisabled();
    });
    it('displays the name of the uploaded file', () => {
      const { getByText } = renderMetricReader(sampleMetricData);
      expect(getByText('test.csv')).toBeVisible();
    });
    it('displays a green check a success feedback to the user', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('passIcon')).toBeVisible();
    });
    it('displays the remove file button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('failIcon')).toBeVisible();
    });
  });
  describe('when the user uploads another file', () => {
    const sampleMetricData: SampleMetricData[] = [
      {
        externalIdAddress: [{ externalId: 'id1', address: 'A1' }],
        roi: 'top left',
        metrics: [{ name: 'metric1', value: '1' }],
        file: new File([''], 'test2.csv'),
        uploadResult: {
          error: undefined,
          success: true,
          file: new File([''], 'test2.csv')
        }
      }
    ];

    it('replaces the old file by the new one', () => {
      const { getByText } = renderMetricReader(sampleMetricData);
      expect(getByText('test2.csv')).toBeVisible();
    });
  });
  describe('when the user removes the uploaded file', () => {
    const sampleMetricData: SampleMetricData[] = [
      {
        externalIdAddress: [{ externalId: 'id1', address: 'A1' }],
        roi: 'top left',
        metrics: []
      }
    ];

    it('keeps the select file button enabled', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('file-input')).toBeEnabled();
    });
    it('disables the upload button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('upload-btn')).toBeDisabled();
    });
    it('removes the name of the previously uploaded file', () => {
      const { queryByText } = renderMetricReader(sampleMetricData);
      expect(queryByText('test.csv')).not.toBeInTheDocument();
    });
  });
  describe('when the user selects a file thar is not in CSV format', () => {
    const sampleMetricData: SampleMetricData[] = [
      {
        externalIdAddress: [{ externalId: 'id1', address: 'A1' }],
        roi: 'top left',
        metrics: [],
        uploadResult: {
          error: new Error('File type not supported. Please upload a CSV file.'),
          success: false,
          file: new File([''], 'test.pdf', { type: 'application/pdf' })
        }
      }
    ];

    it('displays error message', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('error-div')).toBeVisible();
    });
    it('disables the upload button', () => {
      const { getByTestId } = renderMetricReader(sampleMetricData);
      expect(getByTestId('upload-btn')).toBeDisabled();
    });
  });
});
