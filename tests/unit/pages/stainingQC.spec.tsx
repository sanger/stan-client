import React from 'react';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { CommentFieldsFragment } from '../../../src/types/sdk';
import StainingQC from '../../../src/pages/StainingQC';
import { scanLabware, selectOption, selectSGPNumber, shouldDisplayValue } from '../../generic/utilities';
import { enableMapSet } from 'immer';

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

afterAll(() => {
  jest.resetAllMocks();
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}));

const comments: CommentFieldsFragment[] = [
  {
    id: 1,
    text: 'Comment1',
    category: 'stain QC',
    enabled: true
  },
  {
    id: 2,
    text: 'Comment2',
    category: 'stain QC',
    enabled: true
  }
];

function shouldDisplayIntialFields() {
  expect(screen.getByTestId('workNumber')).toBeVisible();
  expect(screen.getByTestId('qcType')).toBeVisible();
  expect(screen.getByTestId('qcType')).toHaveTextContent('');
  expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  expect(screen.queryAllByTestId('coverage')).toHaveLength(0);
  expect(screen.queryAllByTestId('comment')).toHaveLength(0);
  expect(screen.queryAllByTestId('passIcon')).toHaveLength(0);
  expect(screen.queryAllByTestId('failIcon')).toHaveLength(0);
}
describe('On load', () => {
  beforeEach(() => {
    enableMapSet();
    act(() => {
      render(
        <BrowserRouter>
          <StainingQC info={{ comments }} />
        </BrowserRouter>
      );
    });
  });
  describe('When no labware have been scanned', () => {
    it('loads all the page fields correctly', () => {
      shouldDisplayIntialFields();
      expect(screen.queryByTestId('labwareResult')).not.toBeInTheDocument();
    });
    it('should not enable save button without labwareScanned', async () => {
      await selectOption('qcType', 'Stain QC');
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });
  describe('When labware have been scanned', () => {
    it('should display labware result panel', async () => {
      await scanLabware('STAN-3113');
      shouldDisplayIntialFields();
      expect(screen.getByTestId('labwareResult')).toBeInTheDocument();
    });
    it('should not enable save button without qcType', () => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
    it('should not enable save button without workNumber', async () => {
      await selectOption('qcType', 'Stain QC');
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });
  describe('When Stain QC qcType is selected', () => {
    beforeEach(async () => {
      await scanLabware('STAN-3112');
      await selectOption('qcType', 'Stain QC');
    });
    it('should display comment dropdowns as enabled', async () => {
      expect(screen.getAllByTestId('comment').length).toBeGreaterThan(0);
      screen.getAllByTestId('comment').forEach((elem: any) => {
        expect(elem).toBeEnabled();
      });
    });
    it('should have all slots as passed', () => {
      expect(screen.getAllByTestId('passIcon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('failIcon').length).toBeGreaterThan(0);
      screen.getAllByTestId('passIcon').forEach((passIcon) => {
        expect(passIcon).toHaveClass('text-green-700');
      });
    });
    it('should not display coverage field', () => {
      expect(screen.queryAllByTestId('coverage')).toHaveLength(0);
    });
    it('fails all slots when fail all button is clicked', async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Fail All' }));
      screen.getAllByTestId('failIcon').forEach((passIcon) => {
        expect(passIcon).toHaveClass('text-red-700');
      });
    });
    it('should change all comments when a comment is selected for all', async () => {
      await selectOption('commentAll', 'Comment2');
      screen.getAllByTestId('comment').forEach((_, indx) => {
        shouldDisplayValue('comment', 'Comment2', indx);
      });
    });
  });

  describe('When Tissue coverage is selected', () => {
    beforeEach(async () => {
      await scanLabware('STAN-3112');
      await selectOption('qcType', 'Tissue coverage');
    });
    it('should not display comment dropdowns', async () => {
      expect(screen.queryAllByTestId('comment')).toHaveLength(0);
    });
    it('should not display pass/fail icons', () => {
      expect(screen.queryAllByTestId('passIcon')).toHaveLength(0);
      expect(screen.queryAllByTestId('failIcon')).toHaveLength(0);
    });
    it('should  display coverage field', () => {
      expect(screen.queryAllByTestId('coverage').length).toBeGreaterThan(0);
    });
  });

  describe('When Pretreatment QC is selected', () => {
    beforeEach(async () => {
      await scanLabware('STAN-3112');
      await selectOption('qcType', 'Pretreatment QC');
    });
    it('should display comment dropdowns as enabled', async () => {
      expect(screen.getAllByTestId('comment').length).toBeGreaterThan(0);
      screen.getAllByTestId('comment').forEach((elem: any) => {
        expect(elem).toBeEnabled();
      });
    });

    it('should not display pass/fail icons', () => {
      expect(screen.queryAllByTestId('passIcon')).toHaveLength(0);
      expect(screen.queryAllByTestId('failIcon')).toHaveLength(0);
    });
    it('should not display coverage field', () => {
      expect(screen.queryAllByTestId('coverage')).toHaveLength(0);
    });

    it('should change all comments when a comment is selected for all', async () => {
      await selectOption('commentAll', 'Comment2');
      screen.getAllByTestId('comment').forEach((_, indx) => {
        shouldDisplayValue('comment', 'Comment2', indx);
      });
    });
  });
});
