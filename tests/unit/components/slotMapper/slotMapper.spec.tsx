import {
  act,
  cleanup,
  fireEvent,
  getAllByTestId,
  getByTestId,
  getByText,
  render,
  RenderResult,
  screen,
  waitFor
} from '@testing-library/react';
import SlotMapper from '../../../../src/components/slotMapper/SlotMapper';
import { OutputSlotCopyData, SlotCopyMode } from '../../../../src/components/slotMapper/slotMapper.types';
import { objectKeys } from '../../../../src/lib/helpers';
import React from 'react';
import { plateFactory } from '../../../../src/lib/factories/labwareFactory';
import { LabwareFieldsFragment } from '../../../../src/types/sdk';
import { enableMapSet } from 'immer';
import { getById } from '../../generic/utilities';
import Labware from '../../../../src/components/labware/Labware';
import { NewLabwareLayout } from '../../../../src/types/stan';

beforeEach(() => {
  enableMapSet();
});

afterEach(() => {
  cleanup();
});

jest.mock('../../../../src/components/labware/Labware', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onSelect, onSlotClick }) => {
      // Invoke the callback immediately
      return (
        <div data-testid="mock-labware">
          Labware <button data-testid="mock-input-select-button" onClick={() => onSelect?.(['A1', 'A2'])} />
          <button data-testid="mock-output-select-button" onClick={() => onSlotClick?.('A1')} />
        </div>
      );
    })
  };
});

describe('slotMapper.spec.tsx', () => {
  /*  it('should render the component properly', () => {
    render(<SlotMapper slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])} />);
    //It should display the given slot copy modes
    expect(screen.queryByTestId('copyMode-Many to one')).toBeInTheDocument();
    expect(screen.queryByTestId('copyMode-One to many')).toBeInTheDocument();
    expect(screen.queryByTestId('copyMode-One to one')).toBeInTheDocument();

    //It should display the input and output labwares
    expect(screen.getByText('Input Labwares')).toBeInTheDocument();
    expect(screen.getByText('Output Labwares')).toBeInTheDocument();
  });
  it('displays the correct number of input and output labwares', () => {
    const inputLabware = plateFactory.build({ barcode: 'STAN-3111' });
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const labware: LabwareFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };
    const wrapper = render(
      <SlotMapper
        slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
        initialInputLabware={[labware]}
      />
    );
    expect(getById(wrapper.container, 'inputLabwares')).toBeInTheDocument();
    expect(getById(wrapper.container, 'outputLabwares')).toBeInTheDocument();
    expect(screen.getByTestId('mock-labware')).toBeInTheDocument();
  });

  it('displays multiple input  labware from props', () => {
    const inputLabware = plateFactory.build();
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const labware: LabwareFieldsFragment[] = [
      { ...inputLabware, barcode: 'STAN-5111' },
      { ...inputLabware, barcode: 'STAN-5112' }
    ];
    const { container } = render(
      <SlotMapper
        slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
        initialInputLabware={labware}
      />
    );

    const pagerTexts = getAllByTestId(container, 'pager-text-div');
    expect(pagerTexts[0]).toHaveTextContent('1 of 2');
  });
  it('displays multiple input labware on scan', async () => {
    act(() => {
      render(<SlotMapper slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])} />);
    });
    const inputs = (await screen.getAllByTestId('input')) as HTMLInputElement[];
    await waitFor(() => {
      fireEvent.change(inputs[0], { target: { value: 'STAN-5111' } });
    });
  });

  it('removes input labware on remove button click', async () => {
    const inputLabware = plateFactory.build();
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const labware: LabwareFieldsFragment[] = [
      { ...inputLabware, barcode: 'STAN-5111' },
      { ...inputLabware, barcode: 'STAN-5112' }
    ];
    act(() => {
      render(
        <SlotMapper
          slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
          initialInputLabware={labware}
        />
      );
    });
    await act(async () => {
      fireEvent.click(screen.getAllByTestId('removeButton')[0]);
    });
    const pagerTexts = screen.getAllByTestId('pager-text-div');
    expect(pagerTexts[0]).toHaveTextContent('1 of 1');
  });
  it('displays previous and next input labware on previous and next button clicks', async () => {
    const inputLabware = plateFactory.build();
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const labware: LabwareFieldsFragment[] = [
      { ...inputLabware, barcode: 'STAN-5111' },
      { ...inputLabware, barcode: 'STAN-5112' }
    ];
    act(() => {
      render(
        <SlotMapper
          slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
          initialInputLabware={labware}
        />
      );
    });
    const pagerTexts = screen.getAllByTestId('pager-text-div');
    expect(pagerTexts[0]).toHaveTextContent('1 of 2');

    await act(async () => {
      fireEvent.click(screen.getByTestId('right-button'));
    });
    expect(pagerTexts[0]).toHaveTextContent('2 of 2');

    await act(async () => {
      fireEvent.click(screen.getByTestId('left-button'));
    });
    expect(pagerTexts[0]).toHaveTextContent('1 of 2');
  });
  it('displays slot information in table when user selects source slots', async () => {
    const inputLabware = plateFactory.build();
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const labware: LabwareFieldsFragment[] = [{ ...inputLabware, barcode: 'STAN-5111' }];
    act(() => {
      render(
        <SlotMapper
          slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
          initialInputLabware={labware}
        />
      );
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('mock-input-select-button'));
    });
    expect(screen.getByTestId('mapping-div')).toBeInTheDocument();
    expect(screen.getByText('Slot mapping for slot(s) A1,A2')).toBeInTheDocument();
  });*/

  it('on one to many mapping', async () => {
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const inputLabware: LabwareFieldsFragment[] = [{ ...plateFactory.build(), barcode: 'STAN-5111' }];
    const outputLabware: OutputSlotCopyData[] = [{ labware: plateFactory.build(), slotCopyContent: [] }];
    act(() => {
      render(
        <SlotMapper
          slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
          initialInputLabware={inputLabware}
          initialOutputLabware={outputLabware}
        />
      );
    });
    await waitFor(() => {
      fireEvent.click(screen.getByTestId('copyMode-One to many'));
    });
    expect(screen.getByTestId('copyMode-One to many')).toBeChecked();
    await waitFor(() => {
      fireEvent.click(screen.getAllByTestId('mock-input-select-button')[0]);
    });
    expect(screen.getByText('Finish mapping for A1')).toBeInTheDocument();

    await waitFor(() => {
      fireEvent.click(screen.getAllByTestId('mock-input-select-button')[1]);
    });
    //On finish Mapping click
    await waitFor(() => {
      fireEvent.click(screen.getByText('Finish mapping for A1'));
    });
    expect(screen.getByText('Finish mapping for A1')).not.toBeInTheDocument();
    // expect(screen.getByText('Slot mapping for STAN-5111')).toBeInTheDocument();
  });
});
