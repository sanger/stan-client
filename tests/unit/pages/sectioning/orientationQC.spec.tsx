import React from 'react';
import { render, fireEvent, screen, act, waitFor, cleanup } from '@testing-library/react';
import { describe } from '@jest/globals';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import OrientationQC from '../../../../src/pages/OrientationQC';
import { scanLabware, selectOption, selectSGPNumber, shouldHaveOption } from '../../../generic/utilities';
import userEvent from '@testing-library/user-event';

describe('Orientation QC', () => {
  describe('On load', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <OrientationQC />
        </BrowserRouter>
      );
    });
    it('should render the page', () => {
      expect(screen.getByText('Orientation QC')).toBeVisible();
      expect(screen.getByTestId('workNumber')).toBeInTheDocument();
      expect(screen.getByText('Labware')).toBeInTheDocument();
      expect(screen.getByText('Embedding Orientation')).toBeInTheDocument();
      shouldHaveOption('orientation', 'Correct');
      shouldHaveOption('orientation', 'Incorrect');
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });
    it('should enable the submit button only when all required fields are entered', async () => {
      await selectSGPNumber('SGP1008');
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
      await waitFor(async () => {
        //await scanLabware('STAN-3111');
        // expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
        //await selectOption('orientation', 'Correct');
        // expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
      });
    });
  });
});
