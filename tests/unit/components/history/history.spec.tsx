import { act, cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistoryUrlParams } from '../../../../src/pages/History';
import History from '../../../../src/components/history/History';
import { HistoryEntry } from '../../../../src/types/sdk';
import { stanCore } from '../../../../src/lib/sdk';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
jest.mock('"../../../../src/lib/hooks/useDownload', () => ({
  useDownload: () => ['', jest.fn(), '']
}));
const entries: Array<HistoryEntry> = [
  {
    __typename: 'HistoryEntry',
    destinationLabwareId: 1,
    sourceLabwareId: 1,
    eventId: 1,
    sampleId: 1,
    time: new Date().toISOString(),
    type: 'Event 1',
    username: 'user1',
    details: ['Taste: Great', 'Monkey: Foo'],
    workNumber: 'SGP1008',
    address: 'A1',
    region: 'Bottom right'
  }
];
function displayTable() {
  expect(screen.queryByTestId('history-table')).toBeInTheDocument();
  const tableDiv = screen.getByRole('table');
  const { getAllByRole } = within(tableDiv);
  expect(getAllByRole('tr')).toHaveLength(1);
}

describe('History', () => {
  it('displays error when called with no url params', async () => {
    const props: HistoryUrlParams = {};
    act(() => {
      render(<History {...props} />);
    });
    waitFor(() => {
      expect(screen.queryByTestId('history-table')).not.toBeInTheDocument();
    });
  });
  it('displays table when called with workNumber', async () => {
    jest.mock('../../../../src/lib/sdk', () => ({
      stanCore: {
        FindHistoryQuery: jest.fn().mockResolvedValue({
          history: entries
        })
      }
    }));
    const props: HistoryUrlParams = { workNumber: 'SGP1008' };
    act(() => {
      render(<History {...props} />);
    });
    waitFor(() => {
      displayTable();
    });
  });
  it('displays table when called with workNumber', async () => {
    jest.mock('../../../../src/lib/sdk', () => ({
      stanCore: {
        FindHistoryQuery: jest.fn().mockResolvedValue({
          history: entries
        })
      }
    }));
    const props: HistoryUrlParams = { workNumber: 'SGP1008' };
    act(() => {
      render(<History {...props} />);
    });
    waitFor(() => {
      displayTable();
    });
  });
});
