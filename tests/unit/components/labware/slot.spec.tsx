import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Slot } from '../../../../src/components/labware/Slot';
import { filledSlotFactory } from '../../../../src/lib/factories/slotFactory';
import { SlotFieldsFragment } from '../../../../src/types/sdk';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

describe('Slot', () => {
  describe('on Mount', () => {
    it('displays a slot', () => {
      act(() => {
        render(
          <Slot
            address={'A1'}
            slot={filledSlotFactory.build({ address: 'A1' })}
            slotSizeProps={{ size: 'size-16', parentDivSize: 'size-17', textSize: 'text-[10px]' }}
            selected={false}
          />
        );
      });
      expect(screen.getByText('A1')).toBeVisible();
      //It displays a small shape
      expect(screen.getByTestId('slot')).toHaveClass('size-16');
    });
    it('displays a non-selected slot with size small', () => {
      act(() => {
        render(
          <Slot
            address={'A1'}
            slot={filledSlotFactory.build({ address: 'A1' })}
            slotSizeProps={{ size: 'size-16', parentDivSize: 'size-17', textSize: 'text-[10px]' }}
            selected={false}
          />
        );
      });
      expect(screen.getByText('A1')).toBeVisible();
      //Displays a small shape
      expect(screen.getByTestId('slot')).toHaveClass('size-16');
      //Displays slot as not selected
      expect(screen.getByTestId('slot')).toHaveClass('border border-gray-800');
      //Fills slot as selected with a default color
      expect(screen.getByTestId('slot')).toHaveClass('bg-gray-100 text-gray-800');
    });
    it('displays a selected slot with size large', () => {
      const color = (_address: string, _slot: SlotFieldsFragment) => {
        return 'bg-sdb-300';
      };
      act(() => {
        render(
          <Slot
            address={'A1'}
            slot={filledSlotFactory.build({ address: 'A1' })}
            slotSizeProps={{ size: 'size-20', parentDivSize: 'size-21', textSize: 'text-xs' }}
            selected={true}
            color={color}
          />
        );
      });
      expect(screen.getByText('A1')).toBeVisible();
      //Displays a large shape
      expect(screen.getByTestId('slot')).toHaveClass('size-20');
      //Displays slot as selected with a pink border
      expect(screen.getByTestId('slot')).toHaveClass('ring-3 ring-pink-600 ring-offset-2');
      //Fills slot as selected with a given color
      expect(screen.getByTestId('slot')).toHaveClass('bg-sdb-300');
    });
    it('invokes a callbacks on mouse click', async () => {
      const mockCallBack = jest.fn();
      const mockShiftCallBack = jest.fn();
      const mockCtrlCallBack = jest.fn();
      act(() => {
        render(
          <Slot
            address={'A2'}
            slot={filledSlotFactory.build({ address: 'A2' })}
            slotSizeProps={{ size: 'size-20', parentDivSize: 'size-21', textSize: 'text-xs' }}
            selected={true}
            onClick={mockCallBack}
            onShiftClick={mockShiftCallBack}
            onCtrlClick={mockCtrlCallBack}
          />
        );
      });
      let slotElem = (await screen.findByTestId('slot')) as HTMLDivElement;
      fireEvent.click(slotElem, {});
      expect(mockCallBack.mock.calls.length).toEqual(1);

      fireEvent.click(slotElem, {
        shiftKey: true
      });
      expect(mockShiftCallBack.mock.calls.length).toEqual(1);
      fireEvent.click(slotElem, {
        ctrlKey: true
      });
      expect(mockCtrlCallBack.mock.calls.length).toEqual(1);
    });

    it('displays a secondary text', async () => {
      act(() => {
        render(
          <Slot
            address={'A2'}
            slot={filledSlotFactory.build({ address: 'A2' })}
            slotSizeProps={{ size: 'size-20', parentDivSize: 'size-21', textSize: 'text-xs' }}
            selected={true}
            secondaryText={(_address: string, _slot: SlotFieldsFragment) => 'Testing'}
          />
        );
      });
      expect(screen.getByText('Testing')).toBeVisible();
    });
  });
});
