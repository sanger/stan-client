import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import Analysis from '../../../../src/pages/Analysis';
import { describe } from '@jest/globals';
import { scanLabware, selectOption } from '../../../generic/utilities';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: jest.fn().mockReturnValue({
    comments: [],
    equipments: [
      { id: 1, name: 'Equipment 1' },
      { id: 2, name: 'Equipment 2' }
    ]
  }),
  useNavigate: jest.fn().mockImplementation(() => ({
    navigate: jest.fn()
  }))
}));

describe('Render Analysis Component', () => {
  beforeEach(() => {
    renderAnalysis();
  });
  it('renders the labware input field only with analysis button disabled', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Analysis');
    expect(screen.getByRole('button', { name: 'Analysis' })).toBeDisabled();
    expect(screen.getByTestId('input')).toBeVisible();
  });

  describe('when a user scans a labware', () => {
    beforeEach(() => {
      scanLabware('STAN-611');
    });
    it('renders with save button disabled until the user selects an equipment and an analysis type', () => {
      waitFor(async () => {
        expect(screen.getAllByRole('table')).toHaveLength(1);
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Reset Form' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Return Home' })).toBeEnabled();
      });
    });
    it('enables the save button when the user selects an equipment and an analysis type', () => {
      waitFor(async () => {
        await selectOption('equipmentId', 'Equipment 2');
        await selectOption('analysisType', 'RIN');
        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
      });
    });
  });
});

const renderAnalysis = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/lab/rna_analysis',
        element: <Analysis />
      }
    ],
    {
      initialEntries: ['/lab/rna_analysis']
    }
  );
  render(<RouterProvider router={router} />);
};
