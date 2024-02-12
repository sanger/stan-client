import React from 'react';
import { render, fireEvent, screen, act, waitFor, cleanup } from '@testing-library/react';
import { describe } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import * as reactDom from 'react-router-dom';
import History from '../../../src/pages/History';
import { uniqueId } from 'lodash';
import { HistoryData, HistoryTableEntry } from '../../../src/types/stan';
import * as historyService from '../../../src/lib/services/historyService';
import { LabwareState } from '../../../src/types/sdk';

const mockHistorySearchResults: HistoryTableEntry[] = [
  {
    eventId: 1,
    date: '01/01/2021',
    sourceBarcode: 'STAN-3111',
    destinationBarcode: 'STAN-123',
    labwareType: 'Slide',
    sampleID: 1,
    donorName: 'Donor 1',
    externalName: 'External 1',
    sectionNumber: 1,
    eventType: 'Event 1',
    biologicalState: 'Tissue',
    labwareState: LabwareState.Active,
    username: 'User 1',
    workNumber: 'SGP1008',
    details: ['A1: Pass', 'Foo:Fail'],
    address: 'A1',
    sectionPosition: '2'
  }
];
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
jest.mock('"../../../../src/lib/hooks/useDownload', () => ({
  useDownload: () => ['/download', jest.fn(), '']
}));
const navigateMock = jest.fn();
require('react-router-dom').useLocation = jest.fn();
require('react-router-dom').useNavigate = navigateMock;

jest.mock('../../../src/lib/sdk', () => ({
  ...jest.requireActual('../../../src/lib/sdk'),
  stanCore: {
    GetEventTypes: jest.fn().mockResolvedValue({
      eventTypes: ['Section', 'Stain']
    }),
    GetAllWorkInfo: jest.fn().mockResolvedValue({
      works: [
        {
          workNumber: 'SGP1001',
          workRequester: { username: 'Requestor 1' },
          status: undefined,
          project: { name: 'Project 1' }
        }
      ]
    })
  }
}));

describe('On load', () => {
  describe('when no query param are specified', () => {
    beforeEach(() => {
      jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
        return {
          key: uniqueId(),
          pathname: '/history',
          search: '',
          hash: '',
          state: null
        };
      });
      act(() => {
        render(
          <BrowserRouter>
            <History />
          </BrowserRouter>
        );
      });
    });
    it('loads all the page fields correctly', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('History').length).toBeGreaterThan(0);
        expect(screen.getByTestId('barcode')).toHaveValue('');
        expect(screen.getByTestId('external-name')).toHaveValue('');
        expect(screen.getByTestId('donor-name')).toHaveValue('');
        expect(screen.queryByTestId('history')).not.toBeInTheDocument();
      });
    });
  });
  describe('when invalid query params given', () => {
    beforeEach(() => {
      jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
        return {
          key: uniqueId(),
          pathname: '/history',
          search: 'bad=params&no=search',
          hash: '',
          state: null
        };
      });
      act(() => {
        render(
          <BrowserRouter>
            <History />
          </BrowserRouter>
        );
      });
    });
    it('does not use params to fill the fields', async () => {
      expect(screen.getByTestId('barcode')).toHaveValue('');
      expect(screen.getByTestId('external-name')).toHaveValue('');
      expect(screen.getByTestId('donor-name')).toHaveValue('');
      expect(screen.queryByTestId('history')).not.toBeInTheDocument();
    });
  });
  describe('When labware barcode specified in query params', () => {
    beforeEach(() => {
      jest.spyOn(reactDom, 'useLocation').mockImplementation(() => {
        return {
          key: uniqueId(),
          pathname: '/history',
          search: 'barcode=STAN-3111',
          hash: '',
          state: null
        };
      });
      jest.spyOn(historyService, 'findHistory').mockReturnValue(
        new Promise<HistoryData>((resolve) => {
          resolve({ entries: mockHistorySearchResults, flaggedBarcodes: [] });
        })
      );
      act(() => {
        render(
          <BrowserRouter>
            <History />
          </BrowserRouter>
        );
      });
    });
    it('loads all the page fields correctly', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('History').length).toBeGreaterThan(0);
        expect(screen.getByTestId('barcode')).toHaveValue('STAN-3111');
        expect(screen.getByTestId('external-name')).toHaveValue('');
        expect(screen.getByTestId('donor-name')).toHaveValue('');
      });
    });
    it('will submit action on barcode search', async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Search' }));
      expect(navigateMock).toHaveBeenCalled();
    });
  });
});
