import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import userEvent from '@testing-library/user-event';
import AteraRun from '../../../../src/pages/AteraRun';
import { selectFocusBlur } from '../../../generic/utilities';
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

//Pastes the barcode in one go, as typing it one key at a time renders the page for each key, which is slow on CI
const scanLabwareByPasting = async (barcode: string) => {
  await userEvent.click(screen.getByTestId('input'));
  await userEvent.paste(barcode);
  await userEvent.keyboard('{Enter}');
};

//Pastes in one go, as typing a long run name one key at a time is slow
const pasteRunName = async (runName: string) => {
  await userEvent.click(screen.getByTestId('runName'));
  await userEvent.paste(runName);
  await userEvent.tab();
};

//Replaces the run name in one change, as each change validates and renders the whole page
const replaceRunName = async (runName: string) => {
  await userEvent.tripleClick(screen.getByTestId('runName'));
  await userEvent.paste(runName);
  await userEvent.tab();
};

describe('Atera Run', () => {
  beforeEach(async () => {
    render(
      <BrowserRouter>
        <AteraRun />
      </BrowserRouter>
    );
    await scanLabwareByPasting('STAN-011');
    await screen.findByText('Run Details');
  });

  describe('Slide count', () => {
    it('warns when the run has 1 slide, without stopping the run', async () => {
      expect(await screen.findByText('This run has 1 slide. Atera runs usually have 2 or 4.')).toBeVisible();
    });
  });

  describe('Cassette position', () => {
    it('is required', async () => {
      await selectFocusBlur('STAN-011-position');
      expect(await screen.findByText('Cassette Position is a required field')).toBeVisible();
    });
  });

  describe('Run name', () => {
    it('is required', async () => {
      await userEvent.click(screen.getByTestId('runName'));
      await userEvent.tab();
      expect(await screen.findByText(REQUIRED_MESSAGE)).toBeVisible();
    });

    it('shows an error when it is longer than 32 characters, and not when it is 32', async () => {
      await pasteRunName('a'.repeat(33));
      expect(await screen.findByText(TOO_LONG_MESSAGE)).toBeVisible();
      await replaceRunName('a'.repeat(32));
      await waitFor(() => expect(screen.queryByText(TOO_LONG_MESSAGE)).not.toBeInTheDocument());
    });

    it('shows an error when it contains other characters than letters, numbers, underscores, hyphens and spaces', async () => {
      await pasteRunName('run/1');
      expect(await screen.findByText(INVALID_CHARACTERS_MESSAGE)).toBeVisible();
    });

    it('accepts letters, numbers, underscores, hyphens and spaces', async () => {
      await pasteRunName('run/1');
      await screen.findByText(INVALID_CHARACTERS_MESSAGE);
      await replaceRunName('Run_1-a b');
      await waitFor(() => expect(screen.queryByText(INVALID_CHARACTERS_MESSAGE)).not.toBeInTheDocument());
    });

    it('keeps a space typed at the end of the run name', async () => {
      await userEvent.click(screen.getByTestId('runName'));
      await userEvent.paste('Run_1-a');
      //Type the space, as that is where trimming on each key would lose it.
      //No tab out of the field, as each blur validates and renders the whole page, which is slow on CI.
      await userEvent.keyboard(' b');
      expect(screen.getByTestId('runName')).toHaveValue('Run_1-a b');
    });
  });
});
