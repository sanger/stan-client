import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisLabware from '../../../../src/components/analysisLabware/analysisLabware';
import { optionsShouldHaveLength, selectOption, shouldHaveOption } from '../../../generic/utilities';
import React from 'react';

const renderAnalysisLabware = (props: any) => {
  return render(
    <div>
      <AnalysisLabware {...props} />
    </div>
  );
};

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
      barcodes: ['STAN-123', 'STAN-456'],
      comments: ['This is a comment', 'This is another comment'],
      equipments: [
        { id: 1, name: 'Equipment 1' },
        { id: 2, name: 'Equipment 2' }
      ],
      analysisLabwares: [],
      onChangeLabwareData: jest.fn(),
      onChangeEquipment: jest.fn()
    });
  });
  afterEach(() => {
    cleanup();
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
  it('renders analysis table when analysis type "RIN" is selected ', () => {
    waitFor(async () => {
      await selectOption('analysisType', 'RIN');
      expect(screen.getByRole('table')).toBeVisible();
      expect(screen.getByText('RIN VALUE')).toBeVisible();
      expect(screen.getByTestId('measurementType')).not.toHaveValue('Range');
    });
  });
  it('renders analysis table when analysis type "DV200" is selected ', () => {
    waitFor(async () => {
      await selectOption('analysisType', 'DV200');
      expect(screen.getByRole('table')).toBeVisible();
      expect(screen.getByText('DV200 VALUE')).toBeVisible();
      await shouldHaveOption('measurementType', 'Range');
      await optionsShouldHaveLength('measurementType', 2);
    });
  });
  describe("when 'Range' is selected in measurement type", () => {
    it('should display two text fields for measurement value', () => {
      waitFor(async () => {
        await selectOption('analysisType', 'DV200');
        await selectOption('measurementType', 'Range');
        expect(screen.getByText('Upper bound:')).toBeVisible();
        expect(screen.getByText('Lower bound:')).toBeVisible();
      });
    });
  });
  describe("when 'N/A' is selected in mesaurement type", () => {
    it('should disable the text field in table', () => {
      waitFor(async () => {
        await selectOption('analysisType', 'DV200');
        await selectOption('measurementType', 'N/A');
        expect(screen.getByTestId('measurementValue')).toBeDisabled();
      });
    });
  });
  describe('when a comment is selected for all labwares', () => {
    it('should display the selected comment in comment column of table', () => {
      waitFor(async () => {
        await selectOption('analysisType', 'DV200');
        await selectOption('measurementType', 'N/A');
        await selectOption('comment', 'This is a comment');
        const tables = screen.getAllByRole('table');
        expect(tables).toHaveLength(2);
        expect(tables[1]).toHaveTextContent('This is a comment');
      });
    });
  });
});
