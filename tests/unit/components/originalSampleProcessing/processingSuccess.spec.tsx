import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ProcessingSuccess from '../../../../src/components/originalSampleProcessing/ProcessingSuccess';
import labwareFactory from '../../../../src/lib/factories/labwareFactory';
import { Column } from 'react-table';
import { LabwareFieldsFragment } from '../../../../src/types/sdk';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

const labware = [
  labwareFactory.build({
    barcode: 'STAN-3333',
    labwareType: {
      name: 'Proviasette',
      numRows: 1,
      numColumns: 1,
      labelType: {
        name: 'Label Type 1'
      }
    }
  })
];

const columns: Column<LabwareFieldsFragment>[] = [
  {
    Header: 'Barcode',
    accessor: 'barcode'
  }
];
beforeEach(() => {
  render(
    <BrowserRouter>
      <ProcessingSuccess labware={labware} columns={columns} successMessage={'Operation X Complete'} />
    </BrowserRouter>
  );
});

describe('processingSuccess.spec.tsx', () => {
  it('should render the component properly', () => {
    expect(screen.getByText('Operation Complete')).toBeInTheDocument();
    expect(screen.getByText('Operation X Complete')).toBeInTheDocument();
    const labwareTable = screen.getByRole('table');
    expect(labwareTable).toBeInTheDocument();
    expect(labwareTable).toHaveTextContent('STAN-3333');
    expect(screen.getByText('Operation X Complete')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Form' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Store' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Return Home' })).toBeEnabled();
    waitFor(() => {
      expect(screen.getByRole('button', { name: 'Print Labels' })).toBeEnabled();
    });
  });

  describe('user clicks on the Store button', () => {
    it('redirects to the Store page', () => {
      act(() => {
        userEvent.click(screen.getByRole('button', { name: 'Store' }));
      });
      waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Store');
      });
    });
    it('displays the processed labware within the awaiting storage table ', () => {
      act(() => {
        userEvent.click(screen.getByRole('button', { name: 'Store' }));
      });
      waitFor(() => {
        expect(screen.getByText('Awaiting storage')).toBeInTheDocument();
        const awaitingStorageTable = screen.getByRole('table');
        expect(awaitingStorageTable).toBeInTheDocument();
        expect(awaitingStorageTable).toHaveTextContent('STAN-3333');
      });
    });
  });

  describe('user clicks on the Return Home button', () => {
    it('redirects to the Home page', () => {
      act(() => {
        userEvent.click(screen.getByRole('button', { name: 'Return Home' }));
      });
      waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('STAN');
      });
    });
  });

  describe('user clicks on the Reset Form button', () => {
    it('navigates back to the processing page', () => {
      const navigate = require('react-router-dom').useNavigate;
      act(() => {
        userEvent.click(screen.getByRole('button', { name: 'Reset Form' }));
      });
      waitFor(() => {
        expect(navigate).toHaveBeenCalled();
      });
    });
  });

  describe('user clicks on Print Labels button', () => {
    it('display a success message ', () => {
      screen.findByRole('button', { name: 'Print Labels' }).then((printButton) => {
        userEvent.click(screen.getByRole('button', { name: 'Reset Form' })).then(() => {
          expect(screen.getByText('Proviasette Printer successfully printed STAN-3333')).toBeVisible();
        });
      });
    });
  });
});
