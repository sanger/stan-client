import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { LibraryAmpAndGeneration } from '../../../../src/pages/LibraryAmpAndGeneration';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe } from '@jest/globals';
import { shouldDisplayValue } from '../../../generic/utilities';
import * as xState from '@xstate/react';
import { LabwareState, SlideCosting, SlotCopyDestination } from '../../../../src/types/sdk';
import { NewFlaggedLabwareLayout } from '../../../../src/types/stan';
import { plateFactory } from '../../../../src/lib/factories/labwareFactory';
import { createFlaggedLabware } from '../../../../src/mocks/handlers/flagLabwareHandlers';

beforeEach(() => {
  jest.clearAllMocks();
  cleanup();
});

afterAll(() => {
  jest.resetAllMocks();
});

jest.mock('../../../../src/components/notifications/PromptOnLeave', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return <div>Prompt on Leave</div>;
    })
  };
});

jest.mock('../../../../src/components/WorkNumberSelect', () => {
  return {
    __esModule: true,
    default: jest.fn(() => {
      return (
        <select data-testid="workNumber">
          <option></option>
        </select>
      );
    })
  };
});

jest.mock('../../../../src/lib/sdk', () => ({
  ...jest.requireActual('../../../../src/lib/sdk'),
  stanCore: {
    FindMeasurementByBarcodeAndName: jest
      .fn()
      .mockResolvedValueOnce({
        measurementValueFromLabwareOrParent: []
      })
      .mockResolvedValueOnce({
        measurementValueFromLabwareOrParent: []
      })
      .mockResolvedValue({
        measurementValueFromLabwareOrParent: [
          { address: 'A1', string: '1' },
          { address: 'A2', string: '3' }
        ]
      })
  }
}));

const mockedSlotCopyComponent = require('../../../../src/components/libraryGeneration/SlotCopyComponent');

const mockedSlotCopyContent: SlotCopyDestination = {
  labwareType: 'SLIDE',
  barcode: 'STAN-3245',
  bioState: 'FRESH',
  costing: SlideCosting.Sgp,
  lotNumber: '1234567',
  probeLotNumber: '1234567',
  preBarcode: '1234567',
  contents: [
    {
      sourceBarcode: 'STAN-3245',
      sourceAddress: 'A1',
      destinationAddress: 'A1'
    }
  ]
};

const defaultOutputLabware: NewFlaggedLabwareLayout = plateFactory.build() as NewFlaggedLabwareLayout;

const mockedDestination = {
  labware: { ...defaultOutputLabware, id: Date.parse(defaultOutputLabware.created) },
  slotCopyDetails: {
    labwareType: defaultOutputLabware.labwareType.name,
    contents: [mockedSlotCopyContent]
  }
};

const mockedSlotCopyMachineContext = {
  workNumber: '',
  operationType: 'Transfer',
  destinations: [mockedDestination],
  sources: [{ barcode: 'STAN-3245', labwareState: LabwareState.Active }],
  slotCopyResults: [],
  sourceLabwarePermData: []
};

const mockedLibraryAmpAndGenerationMachineContext = {
  workNumber: '',
  destination: mockedSlotCopyContent,
  sources: [{ barcode: 'STAN-3245', labwareState: LabwareState.Active }],
  destinationLabware: createFlaggedLabware('STAN-5245'),
  reagentTransfers: [],
  plateType: 'Dual Index TT Set A',
  slotMeasurements: []
};

describe('Library Amplification and Generation ', () => {
  describe('Page is loaded correctly', () => {
    beforeEach(() => {
      render(<LibraryAmpAndGeneration />, { wrapper: BrowserRouter });
    });
    it('renders page the page without clutching', () => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Library Amplification and Generation');
    });
    it('display SGP Number field default to empty', () => {
      expect(screen.getByText('SGP number to associate with these operations')).toBeVisible();
      shouldDisplayValue('workNumber', '');
    });
    it('loads on the Sample transfer Step', () => {
      expect(screen.getByTestId('input')).toBeVisible();
      expect(screen.getByText('Input Labware')).toBeVisible();
      expect(screen.getByText('Output Labware')).toBeVisible();
    });
    it('loads with default destination as 96 plate', () => {
      expect(screen.getByTestId('96 Well Plate')).not.toBeChecked();
      expect(screen.getByTestId('8 Strip Tube')).not.toBeChecked();
      expect(screen.getByTestId('Scan Labware')).not.toBeChecked();
    });
    it('loads with empty source labware', () => {
      expect(screen.getByTestId('input')).toHaveValue('');
    });
    it('loads with Reagent Transfer button disabled', () => {
      expect(screen.getByRole('button', { name: 'Reagent Transfer >' })).toBeDisabled();
    });
  });

  describe('On Reagent Transfer button Click', () => {
    describe('When slot mapping form is filled correctly', () => {
      beforeEach(() => {
        mockedSlotCopyComponent.default = jest.fn(() => {
          return <div>Slot Copy Component</div>;
        });
        jest.spyOn(xState, 'useMachine').mockReturnValueOnce([
          {
            context: { ...mockedSlotCopyMachineContext }
          },
          jest.fn()
        ] as any);

        render(<LibraryAmpAndGeneration />, { wrapper: BrowserRouter });
      });
      it('enables reagent transfer button', () => {
        expect(screen.getByRole('button', { name: 'Reagent Transfer >' })).toBeEnabled();
      });
    });

    describe('On Reagent Transfer button click', () => {
      beforeEach(() => {
        jest
          .spyOn(xState, 'useMachine')
          .mockReturnValueOnce([
            {
              context: { ...mockedSlotCopyMachineContext },
              value: 'copied',
              matches: jest.fn()
            },
            jest.fn()
          ] as any)
          .mockReturnValueOnce([
            {
              context: { ...mockedLibraryAmpAndGenerationMachineContext },
              value: 'reagentTransfer',
              matches: jest.fn().mockImplementation((value) => value === 'reagentTransfer')
            },

            jest.fn()
          ] as any)
          .mockReturnValueOnce([
            {
              context: { ...mockedLibraryAmpAndGenerationMachineContext },
              value: 'reagentTransfer',
              matches: jest.fn()
            },
            jest.fn()
          ] as any);

        render(<LibraryAmpAndGeneration />, { wrapper: BrowserRouter });
      });
      it('navigates to the Reagent Transfer step', () => {
        expect(screen.getByText('SGP number to associate with these operations')).toBeVisible();
        shouldDisplayValue('workNumber', '');
        expect(screen.getByRole('button', { name: '< Sample Transfer' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Record Cycle >' })).toBeVisible();
        expect(screen.getByText('Dual Index Plate')).toBeVisible();
        expect(screen.getByText('Destination Labware')).toBeVisible();
      });
    });
  });
  describe('On Record Cycle button click', () => {
    beforeEach(() => {
      jest
        .spyOn(xState, 'useMachine')
        .mockReturnValueOnce([
          {
            context: { ...mockedSlotCopyMachineContext },
            value: 'copied',
            matches: jest.fn()
          },
          jest.fn()
        ] as any)
        .mockReturnValueOnce([
          {
            context: { ...mockedLibraryAmpAndGenerationMachineContext },
            value: 'amplification',
            matches: jest.fn().mockImplementation((value) => value === 'amplification')
          },

          jest.fn()
        ] as any)
        .mockReturnValueOnce([
          {
            context: { ...mockedLibraryAmpAndGenerationMachineContext },
            value: 'reagentTransfer',
            matches: jest.fn().mockImplementation((value) => value === 'reagentTransfer')
          },

          jest.fn()
        ] as any);
    });
    it('navigates to the Amplification step', async () => {
      act(() => {
        render(<LibraryAmpAndGeneration />, { wrapper: BrowserRouter });
      });
      await waitFor(() => {
        expect(screen.getByText('SGP number to associate with these operations')).toBeVisible();
        shouldDisplayValue('workNumber', '');
        expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
        expect(screen.getByRole('button', { name: '< Reagent Transfer' })).toBeVisible();
      });
    });
  });
});
