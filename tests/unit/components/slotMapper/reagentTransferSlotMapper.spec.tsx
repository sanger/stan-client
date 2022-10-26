import { render, cleanup, screen, act } from '@testing-library/react';
import ReagentTransferSlotMapper from '../../../../src/components/slotMapper/ReagentTransferSlotMapper';
import { createLabware } from '../../../../src/mocks/handlers/labwareHandlers';
import { enableMapSet } from 'immer';

enableMapSet();
afterEach(() => {
  cleanup();
});
const srcLabware = createLabware('123456789123456789012345');
const destLabware = createLabware('STAN-5111');

describe('ReagentTransferSlotMapper.tsx', () => {
  it('displays the parent div elements for source and destination', () => {
    act(() => {
      render(<ReagentTransferSlotMapper initialSourceLabware={undefined} initialDestLabware={undefined} />);

      //Displays div element for source labware
      expect(screen.getByTestId('sourceLabwares')).toBeInTheDocument();

      //Displays div element for destination labware
      expect(screen.getByTestId('destLabwares')).toBeInTheDocument();
    });

    it('displays source and destination', () => {
      act(() => {
        render(<ReagentTransferSlotMapper initialSourceLabware={srcLabware} initialDestLabware={destLabware} />);
      });

      //Displays source and destination labware element
      expect(screen.getByText('123456789123456789012345')).toBeInTheDocument();
      expect(screen.getByText('STAN-5111')).toBeInTheDocument();
    });
  });
});
