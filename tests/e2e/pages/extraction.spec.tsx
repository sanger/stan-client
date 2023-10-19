import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe } from '@jest/globals';
import Extraction from '../../../src/pages/Extraction';
import equipmentRepository from '../../../src/mocks/repositories/equipmentRepository';
import { scanLabware, selectOption, selectSGPNumber } from '../../generic/utilities';
import { ExtractMutation, ExtractMutationVariables } from '../../../src/types/sdk';
import { graphql } from 'msw';
import { server } from '../../../src/mocks/server';

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

describe('Extraction', () => {
  beforeEach(() => {
    renderExtraction();
  });
  describe('Extraction page is loaded correctly', () => {
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
  describe('when extraction is successful', () => {
    beforeEach(async () => {
      await fillInTheFields();
      fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
    });

    it('hides the Extract button', async () => {
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Extract' })).not.toBeInTheDocument();
      });
    });

    it('shows a success message', async () => {
      await waitFor(() => {
        expect(screen.getByText('Extraction Complete')).toBeVisible();
      });
    });
    it('shows a copy label button', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Labels/i })).toBeVisible();
      });
    });
  });
  describe('when extraction fails', () => {
    beforeEach(async () => {
      server.use(
        graphql.mutation<ExtractMutation, ExtractMutationVariables>('Extract', (req, res, ctx) => {
          return res(
            ctx.errors([
              {
                message: 'Exception while fetching data (/extract) : Failed to extract'
              }
            ])
          );
        })
      );
      await fillInTheFields();
      fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
    });

    it("doesn't lock the labware scan table", async () => {
      await waitFor(() => {
        expect(screen.getByTestId('input')).toBeEnabled();
      });
    });

    it("doesn't disable the Extract button", async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Extract' })).toBeEnabled();
      });
    });

    it('shows an error message', async () => {
      await waitFor(() => {
        expect(screen.getByText('Failed to extract')).toBeVisible();
      });
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