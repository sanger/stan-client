import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StanCoreContext } from '../../../src/lib/sdk';

// Test that Configuration page shows Treatment Types tab and loads types with
// NAME/ENABLED columns and checkbox works.

// Minimal configuration object for the page (only keys used by page construction must exist)
const mockConfiguration = {
  comments: [],
  equipments: [],
  bioRisks: [],
  cellClasses: [],
  destructionReasons: [],
  dnapStudies: [],
  fixatives: [],
  hmdmcs: [],
  species: [],
  releaseDestinations: [],
  releaseRecipients: [],
  projects: [],
  programs: [],
  proteinPanels: [],
  cytassistProbePanels: [],
  spikeProbePanels: [],
  xeniumProbePanels: [],
  users: [],
  workTypes: [],
  costCodes: [],
  solutions: [],
  tissueTypes: [],
  treatmentTypes: [
    { name: 'Type A', enabled: true },
    { name: 'Type B', enabled: false }
  ]
};

// Mock useLoaderData to return our mock configuration
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => mockConfiguration
}));

describe('Configuration page - Treatment Types', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('shows Treatment Types tab and loads types with NAME/ENABLED columns and checkbox works', async () => {
    const mockStanCore = {
      SetTreatmentTypeEnabled: jest.fn().mockResolvedValue({ setTreatmentTypeEnabled: {} })
    } as any;

    // require Configuration after we set up mocks so the module sees them
    const Configuration = require('../../../src/pages/Configuration').default;
    const { MemoryRouter } = require('react-router-dom');
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(StanCoreContext.Provider, { value: mockStanCore }, React.createElement(Configuration))
      )
    );

    // Heading present
    expect(screen.getByText('Treatment Types')).toBeInTheDocument();

    // switch to the Treatment Types tab
    const tab = screen.getByText('Treatment Types');
    fireEvent.click(tab);

    // Scope assertions to the panel content to avoid matching duplicate text elsewhere
    const panel = await screen.findByRole('tabpanel');

    // EntityManager rendered and headers exist (check table header cells)
    const headerEls = await within(panel).findAllByRole('columnheader');
    const headers = headerEls.map((h: any) => (h.textContent || '').trim());
    expect(headers.some((h: string) => /name/i.test(h))).toBeTruthy();
    expect(headers.some((h: string) => /enabled/i.test(h))).toBeTruthy();

    // Rows loaded
    expect(await within(panel).findByText('Type A')).toBeInTheDocument();
    expect(await within(panel).findByText('Type B')).toBeInTheDocument();

    // Checkbox toggles call stanCore - find checkboxes within the panel (in row order)
    const checkboxes = await within(panel).findAllByRole('checkbox');
    const chk = checkboxes[0] as HTMLInputElement;
    expect(chk.checked).toBe(true);

    // click to disable
    fireEvent.click(chk);
    // actor is async - wait for the stanCore call
    return waitFor(() =>
      expect(mockStanCore.SetTreatmentTypeEnabled).toHaveBeenCalledWith({ name: 'Type A', enabled: false })
    );
  });
});
