import {
  act,
  cleanup,
  fireEvent,
  getAllByTestId,
  getByTestId,
  getByText,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { within } from '@testing-library/dom';
import SlotMapper from '../../../../src/components/slotMapper/SlotMapper';
import { SlotCopyMode } from '../../../../src/components/slotMapper/slotMapper.types';
import { objectKeys } from '../../../../src/lib/helpers';
import React from 'react';
import { plateFactory } from '../../../../src/lib/factories/labwareFactory';
import { LabwareFieldsFragment } from '../../../../src/types/sdk';
import { enableMapSet } from 'immer';
import { getById } from '../../generic/utilities';

beforeEach(() => {
  enableMapSet();
});

afterEach(() => {
  cleanup();
});

describe('slotMapper.spec.tsx', () => {
  it('should render the component properly', () => {
    const wrapper = render(<SlotMapper slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])} />);
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
    //It should display the default output labware by id
    expect(getById(wrapper.container, 'outputLabwares')).toBeInTheDocument();
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

  it('removes input labware on remove button click', () => {
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
    const removeButtons = getAllByTestId(container, 'removeButton');
    fireEvent.click(removeButtons[0]);
    const pagerTexts = getAllByTestId(container, 'pager-text-div');
    expect(pagerTexts[0]).toHaveTextContent('1 of 1');
  });
  it('displays previous and next input labware on previous and next button clicks', () => {
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

    const rightButton = getByTestId(container, 'right-button');
    fireEvent.click(rightButton);

    expect(pagerTexts[0]).toHaveTextContent('2 of 2');

    const leftButton = getByTestId(container, 'left-button');
    fireEvent.click(leftButton);

    expect(pagerTexts[0]).toHaveTextContent('1 of 2');
  });
  it('displays slot information in table when user selects source slots', () => {
    const inputLabware = plateFactory.build();
    //Convert  NewLabwareLayout to LabwareFieldsFragment
    const labware: LabwareFieldsFragment[] = [{ ...inputLabware, barcode: 'STAN-5111' }];
    const wrapper = render(
      <SlotMapper
        slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
        initialInputLabware={labware}
      />
    );
    //Select the first slot A1 in input labware
    const inputLabwareElement = getById(wrapper.container, 'inputLabwares');
    expect(inputLabwareElement).toBeInTheDocument();
    if (inputLabwareElement) {
      getByText(inputLabwareElement, 'A1').click();
    }
    //It should display a table with column A1
    const table = wrapper.getByTestId('mapping-table');
    expect(within(table).getByText('A1')).toBeInTheDocument();
  });
});
