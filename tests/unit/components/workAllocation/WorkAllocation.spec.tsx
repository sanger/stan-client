import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import WorkAllocation from '../../../../src/components/workAllocation/WorkAllocation';
import { mockCreateObjectURL } from '../../testUtils/mockCreateObjectURL';

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
  successMessage:
    "Assigned SGP345 (Xenium v1 - 1 blocks and 2 slides and 1 original samples) to project (cost code description) Adenoids in Otitis Media, Omero project AA_ASD, DNAP study name 'NanoSeq on 5FU-treated oesphageal epithelioids', program CellGen and faculty lead Adams Group using cost code S2648 with the work requester ab70, treatment types: Fresh frozen, FFPE",
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
  await waitFor(() => screen.getByText(label));
  fireEvent.click(screen.getByText(label));
}

describe('WorkAllocation - Treatment Types', () => {
  it('does not show disabled treatment types in the dropdown', async () => {
    render(<WorkAllocation />);

    // Open the treatment types dropdown
    const selectDiv = screen.getByTestId('treatmentTypes');
    const input = selectDiv.querySelector('input');
    if (!input) throw new Error('Treatment Types input not found');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Assert that Enabled treatment is shown and Disabled treatment is not shown
    await waitFor(() => {
      expect(screen.queryByText('Enabled treatment')).toBeInTheDocument();
      expect(screen.queryByText('Disabled treatment')).not.toBeInTheDocument();
    });
  });

  it('allows selecting treatment types and displays selected chips', async () => {
    render(<WorkAllocation />);

    // Select required fields
    fireEvent.change(screen.getByLabelText('Work Type'), { target: { value: 'Type A' } });
    fireEvent.change(screen.getByLabelText('Work Requester'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByLabelText('Project (cost code description)'), { target: { value: 'Project A' } });
    fireEvent.change(screen.getByLabelText('Program'), { target: { value: 'Program A' } });
    fireEvent.change(screen.getByLabelText('Cost Code'), { target: { value: 'CC1' } });
    fireEvent.change(screen.getByLabelText('Faculty lead'), { target: { value: 'Lead A' } });

    // Select treatment types
    await selectTreatmentType('FFPE');
    await selectTreatmentType('Fresh frozen');

    // Assert both selected treatment types have a remove button
    await waitFor(() => {
      expect(screen.getByLabelText('Remove FFPE')).toBeInTheDocument();
      expect(screen.getByLabelText('Remove Fresh frozen')).toBeInTheDocument();
    });
  });

  it('shows success UI after submitting the form', async () => {
    render(<WorkAllocation />);

    // Select required fields
    fireEvent.change(screen.getByLabelText('Work Type'), { target: { value: 'Type A' } });
    fireEvent.change(screen.getByLabelText('Work Requester'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByLabelText('Project (cost code description)'), { target: { value: 'Project A' } });
    fireEvent.change(screen.getByLabelText('Program'), { target: { value: 'Program A' } });
    fireEvent.change(screen.getByLabelText('Cost Code'), { target: { value: 'CC1' } });
    fireEvent.change(screen.getByLabelText('Faculty lead'), { target: { value: 'Lead A' } });

    // Select treatment types
    await selectTreatmentType('FFPE');
    await selectTreatmentType('Fresh frozen');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('success')).toBeInTheDocument();

      // Assert that success message contains the selected treatment types
      const successSection = screen.getByTestId('success');
      expect(successSection).toHaveTextContent(/Assigned/i);
      expect(successSection).toHaveTextContent(/treatment types: Fresh frozen, FFPE/i);

      // Assert that reminder message is displayed
      expect(screen.queryByTestId('reminder-div')).toBeInTheDocument();
    });
  });
});
