import { act, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import '@testing-library/jest-dom';
import FlagLabware from '../../../src/pages/FlagLabware';

describe('On load', () => {
  describe('FlagLabware page is loaded correctly', () => {
    beforeEach(async () => {
      await act(() => {
        render(
          <BrowserRouter>
            <FlagLabware />
          </BrowserRouter>
        );
      });
    });
    it('renders page the page without clutching', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Flag Labware');
    });
    it('renders SGP number select number', () => {
      expect(screen.getByTestId('workNumber')).toBeVisible();
    });
    it('renders the flag priority select box', () => {
      expect(screen.getByTestId('priority')).toBeVisible();
    });
    it('renders the labware scanner', () => {
      expect(screen.getByTestId('input')).toBeVisible();
    });
  });
});
