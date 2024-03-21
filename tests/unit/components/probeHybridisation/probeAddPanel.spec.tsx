import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Formik } from 'formik';
import ProbeAddPanel from '../../../../src/components/probeHybridisation/ProbeAddPanel';
import { ProbePanelFieldsFragment } from '../../../../src/types/sdk';

afterEach(() => {
  cleanup();
});
const FormikProps = {
  onSubmit: () => {},
  initialValues: {}
};

const probePanels: ProbePanelFieldsFragment[] = [
  { name: 'Custom breast', __typename: 'ProbePanel', enabled: true },
  { name: 'Custom brain', __typename: 'ProbePanel', enabled: true }
];
describe('ProbeAddPanel', () => {
  describe('On Mount', () => {
    it('displays probe panel', async () => {
      act(() => {
        render(
          <Formik {...FormikProps}>
            <ProbeAddPanel probePanels={probePanels} />
          </Formik>
        );
      });
      expect(screen.getByText('Probe Panel')).toBeVisible();
      expect(screen.getByText('Lot')).toBeVisible();
      expect(screen.getByText('Plex')).toBeVisible();
      expect(screen.getByTestId('probe-name')).toBeVisible();
      expect(screen.getByTestId('probe-lot')).toBeVisible();
      expect(screen.getByTestId('probe-plex')).toBeVisible();
      expect(screen.getByTestId('probe-costing')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Add to all' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Add to all' })).toBeDisabled();
    });
  });
  describe('Invalid values', () => {
    it('displays error for probe panel', async () => {
      render(
        <Formik {...FormikProps}>
          <ProbeAddPanel probePanels={probePanels} />
        </Formik>
      );
      /**Change selection from 'Custom breast' to empty */
      blurSelect('probe-name');
      expect(screen.getByText('Probe panel is required')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Add to all' })).toBeDisabled();
    });
    it('displays error for probe lot ', async () => {
      render(
        <Formik {...FormikProps}>
          <ProbeAddPanel probePanels={probePanels} />
        </Formik>
      );
      const input = screen.getByTestId('probe-lot');
      expect(input).toBeInTheDocument();
      await waitFor(() => {
        fireEvent.change(input, { target: { value: '123' } });
      });
      expect(input).toHaveValue('123');
      expect(screen.queryByText('Lot number is required')).not.toBeInTheDocument();
      await waitFor(() => {
        fireEvent.change(input, { target: { value: '' } });
      });
      expect(screen.getByText('Lot number is required')).toBeVisible();

      await waitFor(() => {
        fireEvent.change(input, { target: { value: '123*' } });
      });
      expect(
        screen.getByText(
          'Lot number should be a string of maximum length 25 of capital letters, numbers and underscores'
        )
      ).toBeVisible();

      await waitFor(() => {
        fireEvent.change(input, { target: { value: '123456789012345678901234567' } });
      });
      expect(
        screen.getByText(
          'Lot number should be a string of maximum length 25 of capital letters, numbers and underscores'
        )
      ).toBeVisible();
      expect(screen.getByRole('button', { name: 'Add to all' })).toBeDisabled();
    });
    it('displays error for probe plex', async () => {
      render(
        <Formik {...FormikProps}>
          <ProbeAddPanel probePanels={probePanels} />
        </Formik>
      );
      const input = screen.getByTestId('probe-plex');
      expect(input).toBeInTheDocument();
      await waitFor(() => {
        fireEvent.change(input, { target: { value: '1' } });
      });
      expect(input).toHaveValue(1);
      await waitFor(() => {
        fireEvent.change(input, { target: { value: '0' } });
      });
      expect(screen.getByText('Plex is required and should be a positive integer.')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Add to all' })).toBeDisabled();
    });
    it('displays error if costing field is empty', async () => {
      render(
        <Formik {...FormikProps}>
          <ProbeAddPanel probePanels={probePanels} />
        </Formik>
      );
      blurSelect('probe-costing');
      expect(screen.getByText('Probe costing is required.')).toBeVisible();
      expect(screen.getByRole('button', { name: 'Add to all' })).toBeDisabled();
    });
    describe('Valid values', () => {
      it('enables add to all button when all fields are valid', async () => {
        render(
          <Formik {...FormikProps}>
            <ProbeAddPanel probePanels={probePanels} />
          </Formik>
        );
        await selectOption('probe-name', 'Custom breast');
        const lot = screen.getByTestId('probe-lot');
        await waitFor(() => {
          fireEvent.change(lot, { target: { value: '123' } });
        });
        expect(screen.getByTestId('probe-lot')).toHaveValue('123');
        const plex = screen.getByTestId('probe-plex');
        await waitFor(() => {
          fireEvent.change(plex, { target: { value: '1' } });
        });
        await selectOption('probe-costing', 'SGP');
        expect(screen.getByTestId('probe-plex')).toHaveValue(1);
        expect(screen.getByRole('button', { name: 'Add to all' })).toBeEnabled();
      });
    });
  });
});

const selectOption = async (dataTesId: string, optionText: string) => {
  const probePanelDiv = screen.getByTestId(dataTesId);
  const select = within(probePanelDiv).getByRole('combobox');
  await waitFor(() => {
    fireEvent.keyDown(select, { keyCode: 40 });
    const option = screen.getByText(optionText);
    fireEvent.click(option);
  });
};

const blurSelect = (dataTesId: string) => {
  const probePanelDiv = screen.getByTestId(dataTesId);
  const select = within(probePanelDiv).getByRole('combobox');
  expect(select).toBeInTheDocument();
  fireEvent.keyDown(select, { keyCode: 40 });
  fireEvent.blur(select);
};
