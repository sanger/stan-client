import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';
import AteraRun from '../../../../src/pages/AteraRun';
import { scanLabware } from '../../../generic/utilities';
import { enableMapSet } from 'immer';

beforeEach(() => {
  enableMapSet();
});
afterEach(() => {
  cleanup();
});

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => jest.fn(),
  useLoaderData: () => ({
    equipments: [{ id: 1, name: 'Atera 1', category: 'atera', enabled: true }],
    workTypes: [{ id: 1, text: 'Atera WTA 4 slides', category: 'Atera run work type', enabled: true }]
  })
}));

const REQUIRED_MESSAGE = 'Run Name is a required field';
const TOO_LONG_MESSAGE = 'Run name should be a string of maximum length 32';
const INVALID_CHARACTERS_MESSAGE = 'Run name should only contain letters, numbers, underscores, hyphens and spaces';

const typeRunName = async (runName: string) => {
  await userEvent.type(screen.getByTestId('runName'), runName);
  await userEvent.tab();
};

//Pastes in one go, as typing a long run name one key at a time is slow
const pasteRunName = async (runName: string) => {
  await userEvent.click(screen.getByTestId('runName'));
  await userEvent.paste(runName);
  await userEvent.tab();
};

describe('Atera Run', () => {
  describe('Run name', () => {
    beforeEach(async () => {
      render(
        <BrowserRouter>
          <AteraRun />
        </BrowserRouter>
      );
      await scanLabware('STAN-011');
      await screen.findByText('Run Details');
    });

    it('is required', async () => {
      await userEvent.click(screen.getByTestId('runName'));
      await userEvent.tab();
      expect(await screen.findByText(REQUIRED_MESSAGE)).toBeVisible();
    });

    it('shows an error when it is longer than 32 characters, and not when it is 32', async () => {
      await pasteRunName('a'.repeat(33));
      expect(await screen.findByText(TOO_LONG_MESSAGE)).toBeVisible();
      await userEvent.clear(screen.getByTestId('runName'));
      await screen.findByText(REQUIRED_MESSAGE);
      await pasteRunName('a'.repeat(32));
      await waitFor(() => expect(screen.queryByText(REQUIRED_MESSAGE)).not.toBeInTheDocument());
      expect(screen.queryByText(TOO_LONG_MESSAGE)).not.toBeInTheDocument();
    });

    it('shows an error when it contains other characters than letters, numbers, underscores, hyphens and spaces', async () => {
      await typeRunName('run/1');
      expect(await screen.findByText(INVALID_CHARACTERS_MESSAGE)).toBeVisible();
    });

    it('accepts letters, numbers, underscores, hyphens and spaces, keeping the spaces as typed', async () => {
      await typeRunName('run/1');
      await screen.findByText(INVALID_CHARACTERS_MESSAGE);
      await userEvent.clear(screen.getByTestId('runName'));
      await screen.findByText(REQUIRED_MESSAGE);
      await typeRunName('Run_1-a b');
      await waitFor(() => expect(screen.queryByText(REQUIRED_MESSAGE)).not.toBeInTheDocument());
      expect(screen.queryByText(INVALID_CHARACTERS_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByTestId('runName')).toHaveValue('Run_1-a b');
    });
  });
});
