import { act, cleanup, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { Reactivate } from '../../../src/pages/Reactivate';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});

const useLoaderDataMock = jest.fn().mockReturnValue([
  {
    id: 1,
    text: 'Comment1',
    category: 'reactivate',
    enabled: true
  },
  {
    id: 2,
    text: 'Comment2',
    category: 'reactivate',
    enabled: true
  }
]);
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLoaderData: () => useLoaderDataMock()
}));

describe('On load', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Reactivate />
      </BrowserRouter>
    );
  });
  describe('Reactivate page is loaded correctly', () => {
    it('renders page the page without clutching', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reactivate');
    });
    it('renders the work number select box', () => {
      expect(screen.getByTestId('workNumber')).toBeVisible();
    });
    it('renders the labware scanner', () => {
      expect(screen.getByTestId('input')).toBeVisible();
    });

    it('does not display the submit button', () => {
      expect(screen.queryByRole('button', { name: 'Reactivate' })).not.toBeInTheDocument();
    });
  });
  describe('when a discarded or destroyed labware is scanned', () => {
    beforeEach(() => {
      act(() => {
        userEvent.type(screen.getByTestId('input'), 'STAN-123456{enter}');
      });
    });

    it('renders the labware layout', () => {
      screen.findByTestId('labware').then((labware) => {
        expect(labware).toBeVisible();
      });
    });
    it('renders the table with the labware details', () => {
      screen.findByRole('table').then((table) => {
        expect(table).toBeVisible();
      });
    });
    it('renders reasons select box', () => {
      screen.findByLabelText('Reason to Reactivate').then((comments) => {
        expect(comments).toBeVisible();
      });
    });
  });
  describe('when an active labware is scanned', () => {
    beforeEach(() => {
      act(() => {
        userEvent.type(screen.getByTestId('input'), 'STAN-1234{enter}');
      });
    });
    it('display error message', () => {
      screen.findByLabelText('This labware is neither discarded nor destroyed.').then((errorMessage) => {
        expect(errorMessage).toBeVisible();
      });
    });

    it('does not display the labware details', () => {
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByTestId('labware')).not.toBeInTheDocument();
      expect(screen.queryByText('Reason to Reactivate')).not.toBeInTheDocument();
    });
    it('does not display the submit button', () => {
      expect(screen.queryByRole('button', { name: 'Reactivate' })).not.toBeInTheDocument();
    });
  });
});
