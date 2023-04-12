import { act, cleanup, render, screen } from '@testing-library/react';
import SlotColumnInfo from '../../../../src/components/labware/SlotColumnInfo';
import { filledSlotFactory } from '../../../../src/lib/factories/slotFactory';
import { SlotFieldsFragment } from '../../../../src/types/sdk';

afterEach(() => {
  cleanup();
});

export const createSlots = (numSlots: number) => {
  return Array.from({ length: numSlots }, (slotNumber, i) => i + 1).map((slotNumber) =>
    filledSlotFactory.build({ address: 'A' + slotNumber })
  );
};
const slotBuilder = (_: SlotFieldsFragment) => {
  return <div />;
};
describe('SlotColumnInfo', () => {
  describe('on Mount', () => {
    it('displays the given slots in rows as specified', async () => {
      const slots = createSlots(4);
      act(() => {
        render(<SlotColumnInfo slotColumn={slots} slotBuilder={slotBuilder} numRows={2} dataTestid={'slotColDiv'} />);
      });
      const divElement = await screen.getByTestId('slotColDiv');
      expect(divElement).toBeInTheDocument();
    });
    it('displays all given slots', async () => {
      const slots = createSlots(4);
      act(() => {
        render(<SlotColumnInfo slotColumn={slots} slotBuilder={slotBuilder} numRows={2} dataTestid={'slotColDiv'} />);
      });
      const addressElements = await screen.findAllByTestId('slot-address');
      expect(addressElements).toHaveLength(4);
    });
  });
  describe('when no rows are specified', () => {
    const slots = createSlots(4);
    act(() => {
      render(<SlotColumnInfo slotColumn={slots} slotBuilder={slotBuilder} dataTestid={'divElem'} numRows={0} />);
    });
    it('will not display any thing', () => {
      expect(screen.queryByTestId('divElem')).toBeNull();
    });
  });
});
