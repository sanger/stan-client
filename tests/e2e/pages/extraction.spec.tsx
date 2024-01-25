import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { describe } from '@jest/globals';
import Extraction from '../../../src/pages/Extraction';
import equipmentRepository from '../../../src/mocks/repositories/equipmentRepository';
import { scanLabware, selectOption, selectSGPNumber } from '../../generic/utilities';
import {
  ExtractMutation,
  ExtractMutationVariables,
  GetAllWorkInfoQuery,
  GetAllWorkInfoQueryVariables,
  WorkStatus
} from '../../../src/types/sdk';
import { graphql, HttpResponse } from 'msw';
import { server } from '../../../src/mocks/server';
import React from 'react';

afterEach(() => {
  cleanup();
});

afterAll(() => {
  jest.resetAllMocks();
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
    server.use(
      graphql.query<GetAllWorkInfoQuery, GetAllWorkInfoQueryVariables>('GetAllWorkInfo', () => {
        return HttpResponse.json({
          data: {
            works: [
              {
                workNumber: 'SGP1008',
                workRequester: { username: 'Requestor 1' },
                status: WorkStatus.Withdrawn,
                project: { name: 'Project 1' }
              }
            ]
          }
        });
      })
    );
    renderExtraction();
  });
  describe('Extraction page is loaded correctly', () => {
    it('renders page the page without clutching', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Extraction');
    });
    it('renders the page with extract button disabled', () => {
      expect(screen.getByRole('button', { name: 'Extract' })).toBeDisabled();
    });
    it('enables extract button when fields are filled', () => {
      act(() => {
        fillInTheFields();
      });
      waitFor(() => {
        expect(screen.getByRole('button', { name: 'Extract' })).toBeEnabled();
      });
    });
  });

  describe('when extraction is successful', () => {
    it('hides the Extract button', () => {
      act(() => {
        fillInTheFields();
        fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
      });
      waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Extract' })).toBeNull();
      });
    });

    it('shows a success message', () => {
      act(() => {
        fillInTheFields();
        fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
      });
      waitFor(() => {
        expect(screen.getByText('Extraction Complete')).toBeVisible();
      });
    });
    it('shows a copy label button', () => {
      act(() => {
        fillInTheFields();
        fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
      });
      waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Labels/i })).toBeVisible();
      });
    });
  });
  describe('when extraction fails', () => {
    beforeEach(async () => {
      server.use(
        graphql.mutation<ExtractMutation, ExtractMutationVariables>('Extract', () => {
          return HttpResponse.json({
            errors: [
              {
                message: 'Exception while fetching data (/extract) : Failed to extract'
              }
            ]
          });
        })
      );
    });

    it("doesn't lock the labware scan table", () => {
      act(() => {
        fillInTheFields();
        fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
      });
      waitFor(() => {
        expect(screen.getByTestId('input')).toBeEnabled();
      });
    });

    it("doesn't disable the Extract button", () => {
      act(() => {
        fillInTheFields();
        fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
      });
      waitFor(() => {
        expect(screen.getByRole('button', { name: 'Extract' })).toBeEnabled();
      });
    });

    it('shows an error message', () => {
      act(() => {
        fillInTheFields();
        fireEvent.click(screen.getByRole('button', { name: 'Extract' }));
      });
      waitFor(() => {
        expect(screen.getByText('Failed to extract')).toBeVisible();
      });
    });
  });
});

const renderExtraction = () => {
  return render(
    <BrowserRouter>
      <Extraction />
    </BrowserRouter>
  );
};

const fillInTheFields = async () => {
  await selectSGPNumber('SGP1008');
  await selectOption('equipmentId', 'Manual');
  await scanLabware('STAN-011');
};
