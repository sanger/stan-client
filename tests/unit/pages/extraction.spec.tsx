import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe } from '@jest/globals';
import Extraction from '../../../src/pages/Extraction';
import equipmentRepository from '../../../src/mocks/repositories/equipmentRepository';
import { scanLabware, selectOption, selectSGPNumber } from '../generic/utilities';

afterEach(() => {
  cleanup();
});

const useLoaderDataMock = jest
  .fn()
  .mockReturnValue(equipmentRepository.findAll().filter((equipment) => equipment.category === 'extract'));
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => jest.fn(),
  useLoaderData: () => useLoaderDataMock()
}));

describe('Extraction page is loaded correctly', () => {
  beforeEach(() => {
    renderExtraction();
  });
  it('renders page the page without clutching', () => {
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Extraction');
  });
  it('renders the page with extract button disabled', () => {
    expect(screen.getByRole('button', { name: 'Extract' })).toBeDisabled();
  });
  it('enables extract button when fields are filled', async () => {
    await fillInTheFields();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Extract' })).toBeEnabled();
    });
  });
});

const renderExtraction = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/lab/extraction',
        element: <Extraction />
      }
    ],
    {
      initialEntries: ['/lab/extraction']
    }
  );
  render(<RouterProvider router={router} />);
};
const fillInTheFields = async () => {
  await selectSGPNumber('SGP1008');
  await selectOption('equipmentId', 'Manual');
  await scanLabware('STAN-011');
};
