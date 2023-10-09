import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import Unrelease from '../../../src/pages/Unrelease';
import { selectFocusBlur, selectSGPNumber, waitFor } from '../generic/utilities';
import { server } from '../../../src/mocks/server';
import { graphql } from 'msw';
describe('Unrelease', () => {
  beforeEach(() => {
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
    it('should render without crashing', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Unrelease');
    });
    it('should display a SGP number field', async () => {
      await waitFor(() => {
        expect(screen.getByText('SGP Number')).toBeVisible();
      });
    });
    it('should display an enabled labware scan input', async () => {
      await waitFor(() => {
        const labwareInput = screen.getByText('Labware');
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
        await userEvent.click(screen.getByRole('button', { name: /submit/i }));
        expect(screen.getByText('Section number must be greater than or equal to 0')).toBeVisible();
      });
    });
    it('when SGP Number not given, it shows an error', async () => {
      act(() => {
        selectFocusBlur('workNumber');
      });
      await waitFor(() => {
        expect(screen.getByText('SGP number is required')).toBeInTheDocument();
      });
    });
  });

  describe('Submission', () => {
    describe('when the submission fails server side', () => {
      beforeEach(() => {
        server.use(
          graphql.mutation('Unrelease', (req, res, ctx) => {
            return res(
              ctx.errors([
                {
                  extensions: {
                    problems: ['This thing went wrong', 'This other thing went wrong']
                  }
                }
              ])
            );
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

const scanLabware = async (barcode: string) => {
  const labwareInput = screen.getByTestId('input');
  await userEvent.type(labwareInput, barcode);
  await userEvent.type(labwareInput, '{enter}');
};
