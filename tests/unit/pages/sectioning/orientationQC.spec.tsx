import React from 'react';
import { render, screen, act, waitFor, cleanup } from '@testing-library/react';
import { describe } from '@jest/globals';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import OrientationQC from '../../../../src/pages/OrientationQC';
import { scanLabware, selectOption, selectSGPNumber, shouldHaveOption } from '../../../generic/utilities';
import { FindFlaggedLabwareQuery, FindFlaggedLabwareQueryVariables } from '../../../../src/types/sdk';
import { server } from '../../../../src/mocks/server';
import { graphql, HttpResponse } from 'msw';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';

afterEach(() => {
  cleanup();
  jest.resetAllMocks();
});

describe('Orientation QC', () => {
  beforeEach(() => {
    server.resetHandlers();
    server.use(
      graphql.query<FindFlaggedLabwareQuery, FindFlaggedLabwareQueryVariables>(
        'FindFlaggedLabware',
        ({ variables }) => {
          const barcode = variables.barcode;
          const labware = createFlaggedLabware(barcode);
          if (barcode === 'STAN-3111') {
            labware.slots = [labware.slots[0]];
            labware.slots[0].samples = [labware.slots[0].samples[0]];
            labware.slots[0].block = true;
          }
          const payload: FindFlaggedLabwareQuery = {
            labwareFlagged: labware
          };
          return HttpResponse.json({ data: payload });
        }
      )
    );

    act(() => {
      render(
        <BrowserRouter>
          <OrientationQC />
        </BrowserRouter>
      );
    });
  });

  it('should render the page', async () => {
    expect(screen.getByText('Orientation QC')).toBeVisible();
    expect(screen.getByTestId('workNumber')).toBeInTheDocument();
    expect(screen.getByText('Labware')).toBeInTheDocument();
    expect(screen.queryByText('Embedding Orientation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByText('No SGP number selected.')).toBeInTheDocument();
    expect(screen.getByText('No labware scanned.')).toBeInTheDocument();
  });

  it('should display the selected SGP number in summary', async () => {
    await waitFor(() => selectSGPNumber('SGP1008'));
    expect(screen.getByTestId('summary-sgp')).toHaveTextContent('The selected SGP number is SGP1008');
  });

  it('should display the embedding orientation when labware is scanned ', async () => {
    await waitFor(() => scanLabware('STAN-3111'));
    await waitFor(() => {
      expect(screen.queryByText('Embedding Orientation')).toBeInTheDocument();
      shouldHaveOption('orientation', 'Correct');
      shouldHaveOption('orientation', 'Incorrect');
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
      expect(screen.getByTestId('summary-barcode')).toHaveTextContent('The selected labware is STAN-3111');
    });
  });

  it('should display the embedded orientation in summary', async () => {
    await waitFor(() => scanLabware('STAN-3111'));
    await waitFor(() => selectOption('orientation', 'Correct'));
    await waitFor(() =>
      expect(screen.getByTestId('summary-orientation')).toHaveTextContent('The embedding orientation is Correct')
    );
  });

  it('should disable Submit button when all required fields are not selected', async () => {
    await waitFor(() => selectSGPNumber('SGP1008'));
    await waitFor(() => scanLabware('STAN-3111'));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('should enable Submit button  when all fields are selected', async () => {
    await waitFor(() => selectSGPNumber('SGP1008'));
    await waitFor(() => scanLabware('STAN-3111'));
    await waitFor(() => selectOption('orientation', 'Correct'));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('should only allow scanning of block labware', async () => {
    await waitFor(() => scanLabware('STAN-3112'));
    expect(screen.queryByText('Embedding Orientation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByText('Labware STAN-3112 is not a block labware.')).toBeInTheDocument();
    expect(screen.getByText('No labware scanned.')).toBeInTheDocument();
  });
});
