import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LabwareScanner, { useLabwareContext } from '../../../../src/components/labwareScanner/LabwareScanner';
import { getById } from '../../generic/utilities';
import React from 'react';
import { plateFactory } from '../../../../src/lib/factories/labwareFactory';
import { LabwareFieldsFragment } from '../../../../src/types/sdk';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

describe('LabwareScannaer', () => {
  describe('On Mount', () => {
    it('displays location and labware scan inputs', async () => {
      let { container } = render(<LabwareScanner enableLocationScanner={true}>{}</LabwareScanner>);

      expect(screen.getByText('Location:')).toBeVisible();
      expect(screen.getByText('Labware:')).toBeVisible();
      expect(getById(container, 'locationScanInput')).toBeVisible();
      expect(getById(container, 'labwareScanInput')).toBeVisible();
      expect(screen.getAllByTestId('input')).toHaveLength(2);
    });
    it('does not displays location scan inputs', async () => {
      let { container } = render(<LabwareScanner enableLocationScanner={false}>{}</LabwareScanner>);
      expect(screen).not.toContain('Labware:');
      expect(screen).not.toContain('Location:');
      expect(getById(container, 'locationScanInput')).not.toBeInTheDocument();
      expect(getById(container, 'labwareScanInput')).toBeVisible();
      expect(screen.getAllByTestId('input')).toHaveLength(1);
    });
  });
  describe('on Entering value', () => {
    it('displays entered value in location scanner', async () => {
      act(() => {
        render(<LabwareScanner enableLocationScanner={true}>{}</LabwareScanner>);
      });
      expect(screen.getAllByTestId('input')).toHaveLength(2);
      const input = screen.getAllByTestId('input')[0] as HTMLInputElement;
      await waitFor(() => {
        fireEvent.change(input, { target: { value: '123' } });
      });
      expect(input).toHaveValue('123');
    });
    it('displays entered value in labware scanner', async () => {
      act(() => {
        render(<LabwareScanner enableLocationScanner={true}>{}</LabwareScanner>);
      });
      expect(screen.getAllByTestId('input')).toHaveLength(2);
      const input = screen.getAllByTestId('input')[1] as HTMLInputElement;
      await waitFor(() => {
        fireEvent.change(input, { target: { value: '123' } });
      });
      expect(input).toHaveValue('123');
    });
  });

  describe('on Providing children', () => {
    const List = () => {
      const { labwares, removeLabware } = useLabwareContext();
      return (
        <ul data-testid={'list'}>
          {labwares.map((lw, indx) => (
            <li data-testid={'list-item'} key={indx}>
              {lw.barcode}
              <button
                data-testid={'removeButton'}
                onClick={() => removeLabware(lw.barcode)}
                className="text-red-500 font-bold underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      );
    };
    it('displays child components', async () => {
      act(() => {
        render(
          <LabwareScanner enableLocationScanner={true}>
            <List />
          </LabwareScanner>
        );
      });
      expect(screen.getByTestId('list')).toBeVisible();
    });
    it('displays contextual information on entering value in labware scanner', async () => {
      const inputLabware = plateFactory.build({ barcode: 'STAN-3111' });
      const labware: LabwareFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };

      act(() => {
        render(
          <LabwareScanner enableLocationScanner={true} initialLabwares={[labware]}>
            <List />
          </LabwareScanner>
        );
      });
      expect(screen.getAllByTestId('input')).toHaveLength(2);
      const listItem = screen.getByTestId('list-item');
      expect(listItem).toBeVisible();
      expect(listItem).toHaveTextContent('STAN-3111');
      expect(screen.getByTestId('removeButton')).toBeVisible();
    });
    it('removes labware on remove button click', async () => {
      const inputLabware = plateFactory.build({ barcode: 'STAN-3111' });
      const labware: LabwareFieldsFragment = { ...inputLabware, barcode: inputLabware.barcode ?? '' };

      act(() => {
        render(
          <LabwareScanner enableLocationScanner={true} initialLabwares={[labware]}>
            <List />
          </LabwareScanner>
        );
      });
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('removeButton'));
      });
      expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
      expect(screen).not.toContain('STAN-3111');
    });
  });
});
