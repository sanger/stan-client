import { render, cleanup, screen } from '@testing-library/react';
import ReagentTransferSlotMapper from '../../../../src/components/slotMapper/ReagentTransferSlotMapper';
import { getById } from '../../generic/utilities';
import { createLabware } from '../../../../src/mocks/handlers/labwareHandlers';
import { enableMapSet } from 'immer';

enableMapSet();
afterEach(() => {
  cleanup();
});
describe('ReagentTransferSlotMapper.tsx', () => {
  it('displays the parent div elements for source and destination', () => {
    const dom = render(<ReagentTransferSlotMapper initialSourceLabware={undefined} initialDestLabware={undefined} />);

    //Displays div element for source labware
    const sourceLabwareElem = getById(dom.container, 'sourceLabwares');
    expect(sourceLabwareElem).not.toBeNull();

    //Displays div element for destination labware
    const destLabwareElem = getById(dom.container, 'destLabwares');
    expect(destLabwareElem).not.toBeNull();
  });

  it('displays source', () => {
    const srcLabware = createLabware('123456789123456789012345');

    render(<ReagentTransferSlotMapper initialSourceLabware={srcLabware} initialDestLabware={undefined} />);
    //Displays source labware element
    expect(screen.getByText('123456789123456789012345')).toBeInTheDocument();
  });
  it('displays destination', () => {
    const destLabware = createLabware('STAN-5111');
    render(<ReagentTransferSlotMapper initialSourceLabware={undefined} initialDestLabware={destLabware} />);

    //Displays source labware element
    expect(screen.getByText('STAN-5111')).toBeInTheDocument();
  });
});
