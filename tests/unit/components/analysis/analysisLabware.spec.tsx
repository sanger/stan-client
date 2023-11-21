import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisLabware from '../../../../src/components/analysisLabware/analysisLabware';
import { selectOption } from '../../../generic/utilities';
import React from 'react';

const renderAnalysisLabware = (props: any) => {
  return render(
    <div>
      <AnalysisLabware {...props} />
    </div>
  );
};

afterEach(() => {
  cleanup();
});

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
describe('AnalysisLabware', () => {
  beforeEach(() => {
    renderAnalysisLabware({
      barcodes: ['STAN-123'],
      comments: [
        { text: 'This is a comment', id: 1 },
        { text: 'This is another comment', id: 2 }
      ],
      equipments: [
        { id: 1, name: 'Equipment 1' },
        { id: 2, name: 'Equipment 2' }
      ],
      analysisLabwares: [
        {
          barcode: 'STAN-123',
          measurements: [{ name: 'DV200', value: '' }],
          workNumber: 'SGP1008'
        }
      ],
      onChangeLabwareData: jest.fn(),
      onChangeEquipment: jest.fn()
    });
  });

  it('renders Analysis options without the analysis table', () => {
    expect(screen.getByTestId('equipmentId')).toBeVisible();
    expect(screen.getByTestId('analysisType')).toBeVisible();
    expect(screen.getByTestId('comment')).toBeVisible();
    expect(screen.getByTestId('workNumber')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders with equipment select option empty ', () => {
    expect(screen.getByTestId('equipmentId')).not.toHaveValue();
  });
  it('renders with analysis type select option empty ', () => {
    expect(screen.getByTestId('analysisType')).not.toHaveValue();
  });
  it('renders analysis table when analysis type "RIN" is selected ', async () => {
    act(() => {
      selectOption('analysisType', 'RIN');
    });
    await waitFor(async () => {
      expect(screen.getByRole('table')).toBeVisible();
      expect(screen.getByText('RIN Value')).toBeVisible();
      expect(screen.getByTestId('measurementType')).not.toHaveValue();
    });
  });
  it('renders analysis table when analysis type "DV200" is selected ', async () => {
    act(() => {
      selectOption('analysisType', 'DV200');
    });
    await waitFor(async () => {
      expect(screen.getByRole('table')).toBeVisible();
      expect(screen.getByText('DV200 Value')).toBeVisible();
      expect(screen.getByTestId('measurementType')).not.toHaveValue();
    });
  });
  describe("when 'Range' is selected in measurement type", () => {
    it('should display two text fields for measurement value', async () => {
      act(() => {
        selectOption('analysisType', 'DV200').then(() => {
          selectOption('measurementType', 'Range');
        });
      });
      await waitFor(async () => {
        expect(screen.getByText('Upper bound:')).toBeVisible();
        expect(screen.getByText('Lower bound:')).toBeVisible();
      });
    });
  });
  describe("when 'N/A' is selected in measurement type", () => {
    it('should disable the text field in table', async () => {
      act(() => {
        selectOption('analysisType', 'DV200').then(() => {
          selectOption('measurementType', 'N/A');
        });
      });
      await waitFor(async () => {
        expect(screen.getByTestId('measurementValue')).toBeDisabled();
      });
    });
  });
  describe('when a comment is selected for all labware', () => {
    it('should display the selected comment in comment column of table', async () => {
      act(() => {
        selectOption('analysisType', 'DV200').then(() => {
          selectOption('comment', 'This is a comment');
        });
      });
      await waitFor(async () => {
        expect(screen.getByRole('table').querySelectorAll('tbody td')[4]).toHaveTextContent('This is a comment');
      });
    });
  });
});
