import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import WorkAllocation from '../../../../src/components/workAllocation/WorkAllocation';
import { mockCreateObjectURL } from '../../testUtils/mockCreateObjectURL';
import * as AuthContext from '../../../../src/context/AuthContext';

// Test the presence and order of the Treatment Types header in the
// WorkAllocation table, and the rendering of treatment type pills with
// correct colours in the table rows.

// Use shared URL.createObjectURL mock util for jsdom
mockCreateObjectURL();

// Mock xstate machine: return different shapes depending on machine id so
// WorkAllocation and WorkRow each get the context they expect.
jest.mock('@xstate/react', () => ({
  useMachine: (machine?: any) => {
    // Work row machine expects a single `workWithComment` in context
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
                  { name: 'Fixed frozen', enabled: true },
                  { name: 'Paxgene ', enabled: false }
                ],
                workRequester: { username: 'req' },
                project: { name: 'proj' },
                omeroProject: { name: 'omero' },
                dnapStudy: undefined,
                costCode: { code: 'C1' },
                numBlocks: 1,
                numSlides: 2,
                numOriginalSamples: 3,
                status: 'active',
                priority: '',
                program: { name: 'prog' },
                facultyLead: { name: 'lead' }
              },
              comment: null
            },
            editModeEnabled: false
          },
          matches: (s: string): boolean => false
        },
        jest.fn()
      ];
    }

    // Default: WorkAllocation machine shape (provide at least one workWithComments entry
    // and some availableComments so WorkRow doesn't crash when it reads them)
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
                project: { name: 'proj' },
                omeroProject: { name: 'omero' },
                dnapStudy: undefined,
                costCode: { code: 'C1' },
                numBlocks: 1,
                numSlides: 2,
                numOriginalSamples: 3,
                status: 'active',
                priority: '',
                program: { name: 'prog' },
                facultyLead: { name: 'lead' }
              },
              comment: null
            }
          ],
          workTypes: [],
          workRequesters: [],
          projects: [],
          programs: [{ name: 'prog' }],
          omeroProjects: [],
          costCodes: [],
          availableComments: [{ id: 1, text: 'test' }],
          facultyLeads: [{ name: 'lead' }],
          treatmentTypes: []
        },
        matches: (s: string): boolean => false
      },
      jest.fn()
    ];
  }
}));

// Mock react-router hooks used by the component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ search: '' }),
  useNavigate: () => jest.fn()
}));

// Mock auth to ensure Authenticated renders children
jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
  isAuthenticated: () => true,
  userRoleIncludes: () => true,
  authState: null,
  setAuthState: () => {},
  clearAuthState: () => {},
  logout: () => {}
} as any);

describe('WorkAllocation table headers', () => {
  it('renders a Treatment Types header', async () => {
    render(<WorkAllocation />);
    const table = await screen.findByTestId('work-allocation-table');
    const scoped = within(table);

    // Ensure the header cell (columnheader; th) for Treatment Types is present
    expect(scoped.getByRole('columnheader', { name: 'Treatment Types' })).toBeInTheDocument();
  });

  it('renders Treatment Types header immediately after Work Type header', async () => {
    render(<WorkAllocation />);
    const table = await screen.findByTestId('work-allocation-table');
    const scoped = within(table);
    const headers = scoped.getAllByRole('columnheader').map((h) => (h.textContent || '').trim());
    const workTypeIndex = headers.findIndex((t) => t === 'Work Type');
    const treatmentIndex = headers.findIndex((t) => t === 'Treatment Types');

    expect(workTypeIndex).toBeGreaterThanOrEqual(0); // exists
    expect(treatmentIndex).toBeGreaterThanOrEqual(0); // exists
    expect(treatmentIndex).toBe(workTypeIndex + 1); // next to Work Type
  });

  it('renders treatment type pills for the row with correct colours', async () => {
    render(<WorkAllocation />);
    const table = await screen.findByTestId('work-allocation-table');
    // find the row for our SGP
    const sgpCell = within(table).getByText('SGP-1');
    const row = sgpCell.closest('tr') as HTMLTableRowElement | null;
    expect(row).not.toBeNull();

    // treatment type pills rendered in the treatment cell
    // find pill spans anywhere in the row
    const allSpans = row!.querySelectorAll('span');
    const pillSpans = Array.from(allSpans).filter((p) => {
      const cls = (p.className || '').toString();
      return cls.includes('bg-sdb-300') || cls.includes('bg-sp');
    });
    expect(pillSpans.length).toBe(2);

    // ensure one pill has the blue class and one has the pink class
    const hasBlue = pillSpans.some((p) => (p.className || '').includes('bg-sdb-300'));
    const hasPink = pillSpans.some((p) => (p.className || '').includes('bg-sp'));
    expect(hasBlue).toBe(true);
    expect(hasPink).toBe(true);
  });
});
