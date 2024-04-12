import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import { CellSegmentation } from '../../../../src/pages/CellSegmentation';
import { getCurrentDateTime } from '../../../../src/types/stan';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLoaderData: () => [
    { id: 1, text: 'Comment 1' },
    { id: 2, text: 'Comment 2' },
    { id: 2, text: 'Comment 3' }
  ]
}));

const mockedScannedLabware = createFlaggedLabware('STAN-1111');

afterEach(() => {
  cleanup();
});
jest.mock('../../../../src/components/labwareScanner/LabwareScanner', () => ({
  __esModule: true,
  default: function MockLabwareScanner({ children }: { children: (props: any) => React.ReactNode }) {
    return <div data-testid="input">{children({ labwares: [mockedScannedLabware], removeLabware: jest.fn() })}</div>;
  }
}));

describe('Cell Segmentation', () => {
  describe('Cell segmentation page is loaded correctly', () => {
    it('renders page the page without clutching', () => {
      render(
        <BrowserRouter>
          <CellSegmentation />
        </BrowserRouter>
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cell Segmentation');
      expect(screen.getByTestId('input')).toBeVisible();
    });
  });
  describe('when a labware is scanned', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <CellSegmentation
            initialFormValues={{
              cellSegmentation: [
                {
                  labware: mockedScannedLabware,
                  performed: getCurrentDateTime(),
                  costing: '',
                  comments: [],
                  workNumber: ''
                }
              ],
              workNumberAll: '',
              performedAll: getCurrentDateTime(),
              costingAll: '',
              commentsAll: []
            }}
          />
        </BrowserRouter>
      );
    });
    it('renders labware details', () => {
      expect(screen.getAllByRole('table')).toHaveLength(2);
    });
    it('renders apply to all div', () => {
      expect(screen.getByTestId('apply-to-all-div')).toBeVisible();
    });
    it('renders cell segmentation user entries table', () => {
      expect(screen.getByTestId('cell-segmentation-values')).toBeVisible();
    });
  });
});
