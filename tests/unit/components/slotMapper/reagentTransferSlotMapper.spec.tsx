import { render, cleanup, screen } from '@testing-library/react';
import ReagentTransferSlotMapper from '../../../../src/components/slotMapper/ReagentTransferSlotMapper';
import { getById } from '../../generic/utilities';
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
    const reagentSlotMapper = render(
      <ReagentTransferSlotMapper initialSourceLabware={undefined} initialDestLabware={undefined} />
    );

    //Displays div element for source labware
    const sourceLabwareElem = getById(reagentSlotMapper.container, 'sourceLabwares');
    expect(sourceLabwareElem).not.toBeNull();

    //Displays div element for destination labware
    const destLabwareElem = getById(reagentSlotMapper.container, 'destLabwares');
    expect(destLabwareElem).not.toBeNull();
  });

  it('displays source and destination', () => {
    render(<ReagentTransferSlotMapper initialSourceLabware={srcLabware} initialDestLabware={destLabware} />);
    //Displays source and destination labware element
    expect(screen.getByText('123456789123456789012345')).toBeInTheDocument();
    expect(screen.getByText('STAN-5111')).toBeInTheDocument();
  });
});
