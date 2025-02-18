import { act, cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router';
import React from 'react';
import Analysis from '../../../../src/pages/Analysis';
import { describe } from '@jest/globals';
import { scanLabware } from '../../../generic/utilities';
import labwareFactory from '../../../../src/lib/factories/labwareFactory';
import { PassFail } from '../../../../src/types/sdk';

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
  })),
  useLocation: jest.fn().mockReturnValue({
    state: []
  })
}));

describe('Analysis Component', () => {
  describe('Render without crashing', () => {
    beforeEach(() => {
      renderAnalysis();
    });
    it('renders the labware input field only with analysis button disabled', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Analysis');
      expect(screen.getByRole('button', { name: 'Analysis' })).toBeDisabled();
      expect(screen.getByTestId('input')).toBeEnabled();
    });
  });

  describe('when a user scans a labware', () => {
    beforeEach(() => {
      renderAnalysis();
    });
    it('renders table with information of the scanner labware and enables the Analysis button', async () => {
      await act(async () => {
        await scanLabware('STAN-611');
      });
      expect(screen.getAllByRole('table')).toHaveLength(1);
      expect(screen.getAllByRole('table')[0]).toContainHTML('STAN-611');
      expect(screen.getByRole('button', { name: 'Analysis' })).toBeEnabled();
    });
  });

  describe('when the page is loaded from RNA Extraction result page', () => {
    beforeEach(() => {
      const extractedLabware = labwareFactory.build({ barcode: 'STAN-1234' });
      require('react-router-dom').useLocation.mockImplementation(() => {
        return {
          state: [{ extractResult: { labware: extractedLabware, concentration: '4.5', result: PassFail.Pass } }]
        };
      });
      renderAnalysis();
    });
    it('renders with the labware already extracted', () => {
      expect(screen.getAllByRole('table')).toHaveLength(1);
      const extractedLabwareTable = screen.getAllByRole('table')[0];
      expect(extractedLabwareTable).toContainHTML('STAN-1234');
      expect(extractedLabwareTable).toContainHTML('4.5');
    });
    it('allows the  user to remove the extracted labware', () => {
      expect(screen.getAllByTestId('remove')[0]).toBeEnabled();
    });
    it('allows the user to scan different labware', () => {
      expect(screen.getAllByTestId('input')[0]).toBeEnabled();
    });
    it('renders with the analysis button enabled', () => {
      expect(screen.getAllByRole('button', { name: 'Analysis' })[0]).toBeEnabled();
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
