import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import Unrelease from '../../../src/pages/Unrelease';
import { selectFocusBlur, selectSGPNumber } from '../generic/utilities';
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
        const labwareInput = screen.getByText('Labware');
        expect(labwareInput).toBeVisible();
        expect(labwareInput).toBeEnabled();
      });
    });
    it('should display High section table when a labware is scanned', async () => {
      await waitFor(async () => {
        await scanLabware();
        expect(screen.getByRole('table')).toBeVisible();
      });
    });
  });

  describe('Validation', () => {
    it('when the section number is below 0, it shows an error', async () => {
      await waitFor(async () => {
        await selectSGPNumber('SGP1008');
        await scanLabware();
        await waitFor(async () => {
          const highSectionInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement;
          fireEvent.change(highSectionInput, { target: { value: -1 } });
          fireEvent.click(screen.getByRole('button', { name: /submit/i }));
        });
        expect(screen.getByText('Section number must be greater than or equal to 0')).toBeInTheDocument();
      });
    });
    it('when SGP Number not given, it shows an error', async () => {
      await waitFor(() => {
        selectFocusBlur('workNumber');
        expect(screen.getByTestId('workNumber')).toHaveTextContent('');
        expect(screen.getByText('SGP number is required')).toBeInTheDocument();
      });
    });
  });

  describe('Submission', () => {
    describe('when the submission fails server side', () => {
      beforeEach(async () => {
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
        await waitFor(async () => {
          await selectSGPNumber('SGP1008');
          await scanLabware();
          fireEvent.click(screen.getByRole('button', { name: /submit/i }));
        });
      });

      it('shows the server errors', () => {
        expect(screen.getByText('This thing went wrong')).toBeInTheDocument();
        expect(screen.getByText('This other thing went wrong')).toBeInTheDocument();
      });
    });

    describe('when the submission is successful', () => {
      it('shows the Operation Complete', async () => {
        await waitFor(async () => {
          await selectSGPNumber('SGP1008');
          await scanLabware();
          fireEvent.click(screen.getByRole('button', { name: /submit/i }));
        });
        expect(screen.getByRole('dialog')).toBeVisible();
      });
    });
  });
});

const scanLabware = async () => {
  const labwareInput = screen.getByTestId('input');
  await userEvent.type(labwareInput, 'STAN-611{enter}');
};
