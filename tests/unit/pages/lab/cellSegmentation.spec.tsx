import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import { CellSegmentation, CellSegmentationFormProps } from '../../../../src/pages/CellSegmentation';
import { getCurrentDateTime } from '../../../../src/types/stan';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';
import { selectFocusBlur, selectOption, shouldDisplayValue } from '../../../generic/utilities';
import userEvent from '@testing-library/user-event';

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLoaderData: () => [
    { id: 1, text: 'Comment 1' },
    { id: 2, text: 'Comment 2' },
    { id: 2, text: 'Comment 3' }
  ]
}));

const mockedScannedLabware = createFlaggedLabware('STAN-1111');

const mockedCellSegmentationValues: CellSegmentationFormProps = {
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
};

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
  describe('Apply all', () => {
    describe('when set a cost for all value', () => {
      beforeEach(() => {
        render(
          <BrowserRouter>
            <CellSegmentation initialFormValues={mockedCellSegmentationValues} />
          </BrowserRouter>
        );
      });
      it('updates the cell segmentation costing value', async () => {
        await waitFor(async () => {
          await selectOption('costingAll', 'SGP');
          shouldDisplayValue('cellSegmentation.0.costing', 'SGP');
        });
      });
    });
    describe('when set a work number value for all', () => {
      beforeEach(() => {
        render(
          <BrowserRouter>
            <CellSegmentation initialFormValues={mockedCellSegmentationValues} />
          </BrowserRouter>
        );
      });
      it('updates the cell segmentation costing value', async () => {
        await waitFor(async () => {
          await selectOption('workNumberAll', 'SGP1008');
          shouldDisplayValue('cellSegmentation.0.workNumber', 'SGP1008');
        });
      });
    });
    describe('when set a comment for all', () => {
      beforeEach(() => {
        render(
          <BrowserRouter>
            <CellSegmentation initialFormValues={mockedCellSegmentationValues} />
          </BrowserRouter>
        );
      });
      it('updates the cell segmentation costing value', async () => {
        await waitFor(async () => {
          await selectOption('commentsAll', 'Comment 1');
          shouldDisplayValue('cellSegmentation.0.comments', 'Comment 1');
        });
      });
    });

    describe('when updating performed for all', () => {
      beforeEach(() => {
        render(
          <BrowserRouter>
            <CellSegmentation initialFormValues={mockedCellSegmentationValues} />
          </BrowserRouter>
        );
      });
      it('updates the cell segmentation costing value', async () => {
        await waitFor(async () => {
          await userEvent.clear(screen.getByTestId('performedAll'));
          await userEvent.type(screen.getByTestId('performedAll'), '2024-04-04T12:33');
          expect(screen.getByTestId('cellSegmentation.0.performed')).toHaveValue('2024-04-04T12:33');
        });
      });
    });
  });
  describe('Validation', () => {
    describe('when no values are entered', () => {
      beforeEach(() => {
        render(
          <BrowserRouter>
            <CellSegmentation initialFormValues={mockedCellSegmentationValues} />
          </BrowserRouter>
        );
      });
      it('disables the save button', async () => {
        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Save' })).toBeVisible(); // should be disabled,
          // the test is failing with disabled here, this is related to a known bug with formik validateOnMount api
        });
      });
    });
    describe('when work number is missing', () => {
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
      it('disables the save button', async () => {
        await waitFor(async () => {
          await selectOption('cellSegmentation.0.costing', 'SGP');
          await selectOption('cellSegmentation.0.comments', 'Comment 1');
          expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        });
      });
    });
    describe('when costing is missing', () => {
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
      it('disables the save button and display error', async () => {
        await waitFor(async () => {
          await selectFocusBlur('cellSegmentation.0.costing');
          expect(screen.getByText('Costing is required')).toBeVisible();
        });
      });
    });
    describe('when performed is missing', () => {
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
      it('disables the save button and display error', async () => {
        await waitFor(async () => {
          await userEvent.clear(screen.getByTestId('cellSegmentation.0.performed'));
          await userEvent.tab();
          expect(screen.getByText('Performed time is required')).toBeVisible();
        });
      });
    });
    describe('when no comment is selected', () => {
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
      it('disables the save button and display error', async () => {
        await waitFor(async () => {
          await selectFocusBlur('cellSegmentation.0.comments');
          expect(screen.getByText('Comment is required')).toBeVisible();
        });
      });
    });
    describe('when all values are entered', () => {
      beforeEach(() => {
        render(
          <BrowserRouter>
            <CellSegmentation
              initialFormValues={{
                cellSegmentation: [
                  {
                    labware: mockedScannedLabware,
                    performed: getCurrentDateTime(),
                    costing: 'SGP',
                    comments: ['1', '2'],
                    workNumber: 'SGP1008'
                  }
                ],
                workNumberAll: 'SGP1008',
                performedAll: getCurrentDateTime(),
                costingAll: 'SGP',
                commentsAll: ['1', '2']
              }}
            />
          </BrowserRouter>
        );
      });
      it('enables the save button', async () => {
        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
        });
      });
    });
  });
});
