import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import WorkAllocation from '../../../../src/components/workAllocation/WorkAllocation';
import { mockCreateObjectURL } from '../../testUtils/mockCreateObjectURL';

// Test the Treatment Types field in the WorkAllocation form, including
// enabled/disabled options, selecting/unselecting options, displaying
// selected options as chips in the UI, and submitting the form with the
// selected treatment types to see the success message.

// Use shared URL.createObjectURL mock util for jsdom
mockCreateObjectURL();

// Mock URL.createObjectURL for jsdom environment
mockCreateObjectURL();

// Mock dependencies as needed (e.g., xstate, react-router, etc.)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ search: '' }),
  useNavigate: () => jest.fn()
}));

// Mock t
jest.mock('../../../../src/lib/sdk', () => ({
  stanCore: {
    AddProject: jest.fn(),
    AddCostCode: jest.fn(),
    AddOmeroProject: jest.fn(),
    GetDnapStudy: jest.fn()
  }
}));

// Mock context data for the machine
const mockContext = {
  projects: [{ name: 'Project A' }],
  programs: [{ name: 'Program A' }],
  omeroProjects: [{ name: 'Omero 1' }],
  costCodes: [{ code: 'CC1' }],
  workWithComments: [],
  workTypes: [{ name: 'Type A' }],
  workRequesters: [{ username: 'user1' }],
  availableComments: [],
  facultyLeads: [{ name: 'Lead A' }],
  requestError: undefined,
  // Success message is tested in workAllocation.machine.spec.ts
  successMessage:
    "Assigned SGP345 (Xenium v1, treatment types Fresh frozen, FFPE - 1 blocks and 2 slides and 1 original samples) to project (cost code description) Adenoids in Otitis Media, Omero project AA_ASD, DNAP study name 'NanoSeq on 5FU-treated oesphageal epithelioids', program CellGen and faculty lead Adams Group using cost code S2648 with the work requester ab70",
  allocatedWorkNumber: 'SGP345',
  treatmentTypes: [
    { name: 'Fresh frozen', enabled: true },
    { name: 'FFPE', enabled: true },
    { name: 'Fixed frozen', enabled: true },
    { name: 'Paxgene', enabled: true },
    { name: 'Mixed', enabled: true },
    { name: 'Enabled treatment', enabled: true },
    { name: 'Disabled treatment', enabled: false }
  ]
};

jest.mock('@xstate/react', () => ({
  useMachine: () => [{ context: mockContext, matches: () => false }, jest.fn()]
}));

// Helper to select option in react-select
async function selectTreatmentType(label: string) {
  const selectDiv = screen.getByTestId('treatmentTypes');
  const input = selectDiv.querySelector('input');
  if (!input) throw new Error('Treatment Types input not found');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  await waitFor(() => within(selectDiv).getByText(label));
  fireEvent.click(within(selectDiv).getByText(label));
}

// Helper to fill the required form fields shared across tests
async function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Work Type'), { target: { value: 'Type A' } });
  fireEvent.change(screen.getByLabelText('Work Requester'), { target: { value: 'user1' } });
  fireEvent.change(screen.getByLabelText('Project (cost code description)'), { target: { value: 'Project A' } });
  fireEvent.change(screen.getByLabelText('Program'), { target: { value: 'Program A' } });
  fireEvent.change(screen.getByLabelText('Cost Code'), { target: { value: 'CC1' } });
  fireEvent.change(screen.getByLabelText('Faculty lead'), { target: { value: 'Lead A' } });
}

describe('WorkAllocation - Treatment Types', () => {
  it('shows enabled treatment options and hides disabled options in dropdown', async () => {
    render(<WorkAllocation />);

    const selectDiv = screen.getByTestId('treatmentTypes');
    const input = selectDiv.querySelector('input');
    if (!input) throw new Error('Treatment Types input not found');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(within(selectDiv).getByText('Enabled treatment')).toBeInTheDocument();
      expect(within(selectDiv).queryByText('Disabled treatment')).not.toBeInTheDocument();
    });
  });

  it('allows selecting treatment types and displays selected chips', async () => {
    render(<WorkAllocation />);

    // Select required fields
    await fillRequiredFields();

    // Select treatment types
    await selectTreatmentType('FFPE');
    await selectTreatmentType('Fresh frozen');

    // Assert both selected treatment types have a remove button because they are selected
    await waitFor(() => {
      expect(screen.getByLabelText('Remove FFPE')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Fresh frozen')).toBeInTheDocument();
    });
  });

  it('shows success UI after submitting the form', async () => {
    render(<WorkAllocation />);

    // Select required fields
    await fillRequiredFields();

    // Select treatment types
    await selectTreatmentType('FFPE');
    await selectTreatmentType('Fresh frozen');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('success')).toBeInTheDocument();

      // Assert that success message is displayed
      const successSection = screen.getByTestId('success');
      expect(successSection).toHaveTextContent(/Assigned/i);
      expect(successSection).toHaveTextContent(/treatment types Fresh frozen, FFPE/i);

      // Assert that reminder message is displayed
      expect(screen.queryByTestId('reminder-div')).toBeInTheDocument();
    });
  });

  it('allows unselecting a treatment type', async () => {
    render(<WorkAllocation />);

    // fill required fields and select two treatment types
    await fillRequiredFields();
    await selectTreatmentType('FFPE');
    await selectTreatmentType('Fresh frozen');

    // ensure both selected
    await waitFor(() => {
      expect(screen.getByLabelText('Remove FFPE')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Fresh frozen')).toBeInTheDocument();
    });

    // unselect FFPE (click the remove button (X) on the FFPE)
    fireEvent.click(screen.getByLabelText('Remove FFPE'));

    // FFPE should be removed, Fresh frozen should remain
    await waitFor(() => {
      expect(screen.queryByLabelText('Remove FFPE')).not.toBeInTheDocument(); // not selected
      expect(screen.getByLabelText('Remove Fresh frozen')).toBeInTheDocument(); // still selected
    });
  });
});
