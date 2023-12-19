import { act, render, screen } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import '@testing-library/jest-dom';
import FlagLabware from '../../../src/pages/FlagLabware';
describe('On load', () => {
  describe('FlagLabware page is loaded correctly', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <FlagLabware />
        </BrowserRouter>
      );
    });
    it('renders page the page without clutching', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Flag Labware');
    });
    it('renders the labware scanner', () => {
      expect(screen.getByTestId('input')).toBeVisible();
    });

    it('submit button is disabled', () => {
      expect(screen.queryByRole('button', { name: 'Flag Labware' })).toBeDisabled();
    });
  });
});
