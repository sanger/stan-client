import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkAllocation from '../../../../src/components/workAllocation/WorkAllocation';

// Test Records for SGP management spreadsheet download data.

// capture object passed to useDownload
let capturedDownloadData: any = null;

afterEach(() => {
  capturedDownloadData = null;
  jest.clearAllMocks();
});

jest.mock('@xstate/react', () => ({
  useMachine: (machine?: any) => {
    // WorkRow machine expects a single `workWithComment` in context
    if (machine && machine.id === 'workRowMachine') {
      return [
        {
          _nodes: [],
          context: {
            workWithComment: {
              work: {
                workNumber: 'SGP-1',
                workType: { name: 'Work Type' },
                treatmentTypes: [
                  { name: 'Type A', enabled: true },
                  { name: 'Type B', enabled: false }
                ],
                workRequester: { username: 'req' },
                project: { name: 'proj' }
              },
              comment: null
            },
            editModeEnabled: false
          },
          matches: (_: string): boolean => false
        },
        jest.fn(),
        jest.fn()
      ];
    }

    // Default: WorkAllocation machine shape
    return [
      {
        context: {
          workWithComments: [
            {
              work: {
                workNumber: 'SGP-1',
                workType: { name: 'Work Type' },
                treatmentTypes: [
                  { name: 'Type A', enabled: true },
                  { name: 'Type B', enabled: false }
                ],
                workRequester: { username: 'req' },
                project: { name: 'proj' }
              },
              comment: null
            }
          ],
          workTypes: [],
          workRequesters: [],
          projects: [],
          programs: [],
          omeroProjects: [],
          costCodes: [],
          availableComments: [{ id: 1, text: 'test' }],
          facultyLeads: [],
          treatmentTypes: []
        },
        matches: (_: string): boolean => false
      },
      jest.fn()
    ];
  }
}));

// mock react-router hooks used by the component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ search: '' }),
  useNavigate: () => jest.fn()
}));

// stub WorkRow so we don't render its internals in this test
jest.mock('../../../../src/components/workAllocation/WorkRow', () => () => {
  const React = require('react');
  return React.createElement('tr', { 'data-testid': 'mock-work-row' });
});

// mock auth to ensure Authenticated renders children
jest.mock('../../../../src/context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: () => true, userRoleIncludes: () => true })
}));

// mock useDownload to capture the passed downloadData
jest.mock('../../../../src/lib/hooks/useDownload', () => ({
  useDownload: (downloadData: any) => {
    capturedDownloadData = downloadData;
    return { downloadURL: 'mock-url', extension: '.xlsx', requestDownload: jest.fn() };
  }
}));

describe('WorkAllocation spreadsheet downloadData', () => {
  it('builds entries with joined treatment type names', async () => {
    render(<WorkAllocation />);

    // wait for table to render to ensure useDownload was called
    await screen.findByTestId('work-allocation-table');

    expect(capturedDownloadData).not.toBeNull();
    const { columnData, entries } = capturedDownloadData;
    const colIndex = columnData.columnNames.findIndex((n: string) => n === 'Treatment Types');
    expect(colIndex).toBeGreaterThanOrEqual(0);
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0][colIndex]).toBe('Type A, Type B');
  });

  it('renders Treatment Types header immediately after Work Type header', async () => {
    render(<WorkAllocation />);
    const table = await screen.findByTestId('work-allocation-table');
    const headers = Array.from(table.querySelectorAll('th')).map((h) => (h.textContent || '').trim());
    const workTypeIndex = headers.findIndex((t) => t === 'Work Type');
    const treatmentIndex = headers.findIndex((t) => t === 'Treatment Types');

    expect(workTypeIndex).toBeGreaterThanOrEqual(0); // exists
    expect(treatmentIndex).toBeGreaterThanOrEqual(0); // exists
    expect(treatmentIndex).toBe(workTypeIndex + 1); // next to Work Type
  });
});
