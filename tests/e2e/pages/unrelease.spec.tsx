import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import * as reactDom from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Unrelease from '../../../src/pages/Unrelease';
import { selectFocusBlur, selectSGPNumber, waitFor } from '../../generic/utilities';
import { server } from '../../../src/mocks/server';
import { graphql, HttpResponse } from 'msw';
import * as sdk from '../../../src/lib/sdk';
import { createFlaggedLabware } from '../../../src/mocks/handlers/flagLabwareHandlers';
import { uniqueId } from 'lodash';
import { enableMapSet } from 'immer';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}));
require('react-router-dom').useLocation = jest.fn();

describe('Unrelease', () => {
  beforeEach(() => {
    enableMapSet();
    jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
      return {
        key: uniqueId(),
        pathname: '/admin/unrelease',
        search: '',
        hash: '',
        state: null
      };
    });
    render(
      <BrowserRouter>
        <Unrelease />
      </BrowserRouter>
    );
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('on initialisation', () => {
    it('should render without crashing', async () => {
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unrelease');
      });
    });
    it('should display a SGP number field', async () => {
      await waitFor(() => {
        expect(screen.getByText('SGP Number')).toBeVisible();
      });
    });
    it('should display an enabled labware scan input', async () => {
      await waitFor(() => {
        const labwareInput = screen.getByTestId('input');
        expect(labwareInput).toBeVisible();
        expect(labwareInput).toBeEnabled();
      });
    });
    it('should display High section table when a labware is scanned', async () => {
      await waitFor(async () => {
        await scanLabware('STAN-611');
        expect(screen.getByRole('table')).toBeVisible();
      });
    });
  });

  describe('Validation', () => {
    it('when the section number is below 0, it shows an error', async () => {
      await waitFor(async () => {
        await scanLabware('STAN-611');
        const highSectionInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement;
        fireEvent.change(highSectionInput, { target: { value: -1 } });
        expect(highSectionInput).toHaveValue(-1);
        expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
      });
    });
    it('when SGP Number not given, it shows an error', async () => {
      await waitFor(async () => {
        await selectFocusBlur('workNumber');
        expect(screen.getByText('SGP number is required')).toBeInTheDocument();
      });
    });
  });

  describe('Submission', () => {
    describe('when the submission fails server side', () => {
      beforeEach(() => {
        server.use(
          graphql.mutation('Unrelease', () => {
            return HttpResponse.json({
              errors: [
                {
                  extensions: {
                    problems: ['This thing went wrong', 'This other thing went wrong']
                  }
                }
              ]
            });
          })
        );
      });

      it('shows the server errors', async () => {
        await waitFor(async () => {
          await selectSGPNumber('SGP1008');
          await scanLabware('STAN-611');
          await userEvent.click(screen.getByRole('button', { name: /submit/i }));
          expect(screen.getByTestId('workNumber')).toHaveTextContent('SGP1008');
          expect(screen.getByRole('table')).toBeVisible();
          expect(screen.getByText('This thing went wrong')).toBeVisible();
          expect(screen.getByText('This other thing went wrong')).toBeVisible();
        });
      });
    });

    describe('when the submission is successful', () => {
      it('shows the Operation Complete', async () => {
        await waitFor(async () => {
          await selectSGPNumber('SGP1008');
          await scanLabware('STAN-611');
          await userEvent.click(screen.getByRole('button', { name: /submit/i }));
          expect(screen.getAllByText('Operation Complete')[0]).toBeVisible();
        });
      });
    });
  });
});
describe('loading the page with valid barcode(s) in the query string', () => {
  beforeEach(() => {
    jest.spyOn(sdk.stanCore, 'FindFlaggedLabware').mockResolvedValue({
      labwareFlagged: createFlaggedLabware('STAN-2233')
    });
    jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
      return {
        key: uniqueId(),
        pathname: '/admin/unrelease',
        search: 'barcode=STAN-2233',
        hash: '',
        state: null
      };
    });
  });
  it('should load the page with the labware ready to unrelease', async () => {
    act(() => {
      render(
        <BrowserRouter>
          <Unrelease />
        </BrowserRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeVisible();
      expect(screen.getByText('STAN-2233')).toBeVisible();
    });
  });
});

describe('loading the page with invalid query string', () => {
  beforeEach(() => {
    jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
      return {
        key: uniqueId(),
        pathname: '/admin/unrelease',
        search: 'nothing=here',
        hash: '',
        state: null
      };
    });
  });
  it('should load the page ignoring the invalid string query', async () => {
    act(() => {
      render(
        <BrowserRouter>
          <Unrelease />
        </BrowserRouter>
      );
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unrelease');
      expect(screen.getByText('SGP Number')).toBeVisible();
      expect(screen.getByTestId('input')).toBeVisible();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });
});

const scanLabware = async (barcode: string) => {
  const labwareInput = screen.getByTestId('input');
  await userEvent.type(labwareInput, barcode);
  await userEvent.type(labwareInput, '{enter}');
};
