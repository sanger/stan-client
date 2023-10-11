import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HistoryUrlParams } from '../../../../src/pages/History';
import History from '../../../../src/components/history/History';
import { LabwareState, UserRole } from '../../../../src/types/sdk';
import { BrowserRouter } from 'react-router-dom';
import { HistoryTableEntry } from '../../../../src/types/stan';
import * as xState from '@xstate/react';
import { spyUser } from '../../../generic/utilities';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
jest.mock('"../../../../src/lib/hooks/useDownload', () => ({
  useDownload: () => ['/download', jest.fn(), '']
}));

const historyTableEntries: HistoryTableEntry[] = [
  {
    eventId: 1,
    date: '01/01/2021',
    sourceBarcode: 'STAN-3111',
    destinationBarcode: 'STAN-123',
    labwareType: 'Slide',
    sampleID: 1,
    donorName: 'Donor 1',
    externalName: 'External 1',
    sectionNumber: 1,
    eventType: 'Event 1',
    biologicalState: 'Tissue',
    labwareState: LabwareState.Active,
    username: 'User 1',
    workNumber: 'SGP1008',
    details: ['A1: Pass', 'Foo:Fail'],
    address: 'A1',
    sectionPosition: '2'
  }
];
function displaysHistoryTable() {
  const tableDiv = screen.getAllByRole('table').at(1);
  const columnHeaders = [
    'Date',
    'Event Type',
    'Work number',
    'User',
    'Source',
    'Destination',
    'Labware Type',
    'Donor ID',
    'External ID',
    'Section Number',
    'Address',
    'Section Position',
    'Biological State',
    'Labware State',
    'Details'
  ];
  expect(tableDiv!.querySelectorAll('tbody td')).toHaveLength(columnHeaders.length);
  tableDiv!.querySelectorAll('tbody th').forEach((header, indx) => {
    expect(header.textContent).toBe(columnHeaders[indx]);
  });
  expect(tableDiv!.querySelectorAll('tbody td')[0].textContent).toBe('01/01/2021');
  expect(tableDiv!.querySelectorAll('tbody td')[1].textContent).toBe('Event 1');
  expect(tableDiv!.querySelectorAll('tbody td')[2].textContent).toBe('SGP1008');
  expect(tableDiv!.querySelectorAll('tbody td')[3].textContent).toBe('User 1');
  expect(tableDiv!.querySelectorAll('tbody td')[4].textContent).toBe('STAN-3111');
  expect(tableDiv!.querySelectorAll('tbody td')[5].textContent).toBe('STAN-123');
  expect(tableDiv!.querySelectorAll('tbody td')[6].textContent).toBe('Slide');
  expect(tableDiv!.querySelectorAll('tbody td')[7].textContent).toBe('Donor 1');
  expect(tableDiv!.querySelectorAll('tbody td')[8].textContent).toBe('External 1');
  expect(tableDiv!.querySelectorAll('tbody td')[9].textContent).toBe('1');
  expect(tableDiv!.querySelectorAll('tbody td')[10].textContent).toBe('A1');
  expect(tableDiv!.querySelectorAll('tbody td')[11].textContent).toBe('2');
  expect(tableDiv!.querySelectorAll('tbody td')[12].textContent).toBe('Tissue');
  expect(tableDiv!.querySelectorAll('tbody td')[13].textContent).toBe('ACTIVE');
  expect(tableDiv!.querySelectorAll('tbody td')[14].textContent).toBe('A1: PassFoo:Fail');
}

describe('When no search data is returned', () => {
  beforeEach(() => {
    const props: HistoryUrlParams = { workNumber: 'SGP1008' };
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'found',
        context: {
          historyProps: props,
          history: [],
          serverError: undefined
        },
        matches: jest.fn((val) => val === 'found')
      },
      jest.fn()
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });

  it('displays no history table when no history data is returned', () => {
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
  it('displays no results found warning', () => {
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
  it('should not display download button', () => {
    expect(screen.queryByTestId('download-button')).not.toBeInTheDocument();
  });
});
describe('When search data is returned', () => {
  const props: HistoryUrlParams = { workNumber: 'SGP1008' };
  beforeEach(() => {
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'found',
        context: {
          historyProps: props,
          history: historyTableEntries,
          serverError: undefined
        },
        matches: jest.fn((val) => val === 'found')
      },
      jest.fn()
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });
  describe('when authenticated user is performing search', () => {
    beforeEach(() => {
      spyUser('testuser', UserRole.Admin);
    });
    it('displays history table when history data is returned', () => {
      expect(screen.getAllByRole('table')).toHaveLength(2);
      displaysHistoryTable();
    });
    it('should  display download button', () => {
      expect(screen.getByTestId('download-button')).toBeInTheDocument();
    });
    it('displays styled link for source barcode', () => {
      expect(screen.getByTestId('source-barcode-link')).toBeInTheDocument();
    });
    it('goes to labware barcode page when source barcode is clicked', () => {
      act(() => {
        screen.getByTestId('source-barcode-link').click();
      });
      expect(global.window.location.pathname).toContain('/labware/STAN-3111');
    });
    it('displays styled link for destination barcode', () => {
      expect(screen.getByTestId('destination-barcode-link')).toBeInTheDocument();
    });
    it('goes to labware barcode page when destination barcode is clicked', () => {
      act(() => {
        screen.getByTestId('destination-barcode-link').click();
      });
      expect(global.window.location.pathname).toContain('/labware/STAN-123');
    });
    it('displays Files Uploaded section when history data is returned', () => {
      expect(screen.getByText('Files Uploaded')).toBeInTheDocument();
      expect(screen.getByText('Files for SGP1008')).toBeInTheDocument();
    });
    it('goes to file manager when Files for SGP1008 is clicked', () => {
      act(() => {
        screen.getByTestId('styled-link-SGP1008').click();
      });
      expect(global.window.location.pathname).toContain('/file_manager');
    });
    it('should not display the release download link in details column', () => {
      expect(screen.queryByTestId('release-download-link')).not.toBeInTheDocument();
    });
  });
  describe('when non-authenticated user is performing search', () => {
    beforeEach(() => {
      spyUser('testuser', UserRole.Normal, false);
    });
    it('displays history table when history data is returned', () => {
      expect(screen.getAllByRole('table')).toHaveLength(2);
      displaysHistoryTable();
    });
    it('displays Files Uploaded section when history data is returned', () => {
      expect(screen.getByText('Files Uploaded')).toBeInTheDocument();
      expect(screen.getByText('Files for SGP1008')).toBeInTheDocument();
    });
    it('goes to file manager when Files for SGP1008 is clicked', () => {
      act(() => {
        screen.getByTestId('styled-link-SGP1008').click();
      });
      expect(global.window.location.pathname).toContain('/file_viewer');
    });
  });
});

describe('when barcode search  is performed', () => {
  const props: HistoryUrlParams = { barcode: 'STAN-3111' };
  beforeEach(() => {
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'found',
        context: {
          historyProps: props,
          history: historyTableEntries,
          serverError: undefined
        },
        matches: jest.fn((val) => val === 'found')
      },
      jest.fn()
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });
  it('highlights the searched barcode in the table', () => {
    const tableDiv = screen.getAllByRole('table').at(1);
    tableDiv!.querySelectorAll('tbody td').forEach((td) => {
      if (td.textContent === 'STAN-3111') {
        //check if td contains a span with class highlight
        const elem = td.querySelector('a');
        expect(elem).toBeInTheDocument();
        expect(elem).toHaveClass(
          'bg-yellow-400 text-sp-600 hover:text-sp-700 font-semibold hover:underline text-base tracking-wide'
        );
      }
    });
  });
});
describe('when there are mutiple history entries with SGP numbers duplicated', () => {
  const props: HistoryUrlParams = { workNumber: 'SGP1008' };
  beforeEach(() => {
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'found',
        context: {
          historyProps: props,
          history: [
            { ...historyTableEntries[0] },
            { ...historyTableEntries[0] },
            { ...historyTableEntries[0], workNumber: 'SGP1009' }
          ],
          serverError: undefined
        },
        matches: jest.fn((val) => val === 'found')
      },
      jest.fn()
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });
  it('should display file download for SGP1008', () => {
    expect(screen.getAllByTestId('styled-link-SGP1008')).toHaveLength(1);
    expect(screen.getByTestId('styled-link-SGP1009')).toBeInTheDocument();
  });
});
describe('when release event is present', () => {
  const props: HistoryUrlParams = { workNumber: 'SGP1008' };
  beforeEach(() => {
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'found',
        context: {
          historyProps: props,
          history: [{ ...historyTableEntries[0], eventType: 'Release' }],
          serverError: undefined
        },
        matches: jest.fn((val) => val === 'found')
      },
      jest.fn()
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });
  it('should  display the release download link in details column', () => {
    expect(screen.getByText('Release')).toBeInTheDocument();
    expect(screen.getByTestId('release-download-link')).toBeInTheDocument();
  });
});
describe("when there's an error", () => {
  const sendFunction = jest.fn();
  beforeEach(() => {
    const props: HistoryUrlParams = { workNumber: 'SGP1008' };
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'error',
        context: {
          historyProps: props,
          history: historyTableEntries,
          serverError: {
            response: {
              status: 500,
              errors: [
                {
                  message: 'Exception while fetching data (/history) : An error occured'
                }
              ]
            }
          }
        },
        matches: jest.fn((val) => val === 'error')
      },
      sendFunction
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });
  it('displays error message', () => {
    expect(screen.getByText('History Search Error')).toBeInTheDocument();
    expect(screen.getByText('An error occured')).toBeInTheDocument();
  });
  it('displaya retry button', () => {
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
  it('sends retry event when retry button is clicked', () => {
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);
    expect(sendFunction).toHaveBeenCalled();
  });
});

describe('when search is in progress', () => {
  const sendFunction = jest.fn();
  beforeEach(() => {
    const props: HistoryUrlParams = { workNumber: 'SGP1008' };
    jest.spyOn(xState, 'useMachine').mockReturnValue([
      {
        value: 'searching',
        context: {
          historyProps: props,
          history: [],
          serverError: undefined
        },
        matches: jest.fn((val) => val === 'searching')
      },
      sendFunction
    ] as any);
    act(() => {
      render(
        <BrowserRouter>
          <History {...props} />
        </BrowserRouter>
      );
    });
  });
  it('displays spinner to show loading', () => {
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
