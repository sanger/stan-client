import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExtraColumnType, SourceTable } from '../../../../src/components/planning/SourceTable';
import labwareFactory from '../../../../src/lib/factories/labwareFactory';
import { slotFactory } from '../../../../src/lib/factories/slotFactory';
import { sampleFactory, tissueFactory } from '../../../../src/lib/factories/sampleFactory';
import { convertLabwareToFlaggedLabware } from '../../../../src/lib/helpers/labwareHelper';

const buildSample = (id: number, externalName: string) =>
  sampleFactory.build({ id }, { associations: { tissue: tissueFactory.build({ externalName }) } });

const sourceLabware = convertLabwareToFlaggedLabware([
  labwareFactory.build(
    { barcode: 'STAN-100' },
    {
      associations: {
        slots: [
          slotFactory.build(
            { address: 'A1' },
            {
              associations: { samples: [buildSample(1, 'EXT-A1'), buildSample(2, 'EXT-A2'), buildSample(3, 'EXT-A3')] }
            }
          )
        ]
      }
    }
  ),
  labwareFactory.build(
    { barcode: 'STAN-200' },
    {
      associations: {
        slots: [slotFactory.build({ address: 'A1' }, { associations: { samples: [buildSample(4, 'EXT-B1')] } })]
      }
    }
  )
]);

const perLabwareColumn: ExtraColumnType = {
  header: 'Per Labware',
  cell: ({ row }) => <span data-testid={`per-labware-${row.original.barcode}-${row.original.id}`} />
};

const perSampleColumn: ExtraColumnType = {
  header: 'Per Sample',
  perSample: true,
  cell: ({ row }) => <span data-testid={`per-sample-${row.original.barcode}-${row.original.id}`} />
};

const renderSourceTable = (extraColumns: ExtraColumnType[]) =>
  render(
    <SourceTable
      sourceLabware={sourceLabware}
      columnTableConfig={{
        extraColumns,
        showLastKnownSectionNumberColumn: false,
        removeLabwareCallBack: jest.fn()
      }}
    />
  );

describe('SourceTable', () => {
  it('renders one row per sample', () => {
    renderSourceTable([]);
    ['EXT-A1', 'EXT-A2', 'EXT-A3', 'EXT-B1'].forEach((externalName) =>
      expect(screen.getByText(externalName)).toBeInTheDocument()
    );
  });

  describe('when an extra column is per labware', () => {
    it('renders the cell only on the first row of each labware', () => {
      renderSourceTable([perLabwareColumn]);
      expect(screen.getAllByTestId(/^per-labware-/).map((el) => el.dataset.testid)).toEqual([
        'per-labware-STAN-100-1',
        'per-labware-STAN-200-4'
      ]);
    });
  });

  describe('when an extra column is per sample', () => {
    it('renders the cell on every sample row', () => {
      renderSourceTable([perSampleColumn]);
      expect(screen.getAllByTestId(/^per-sample-/).map((el) => el.dataset.testid)).toEqual([
        'per-sample-STAN-100-1',
        'per-sample-STAN-100-2',
        'per-sample-STAN-100-3',
        'per-sample-STAN-200-4'
      ]);
    });
  });

  describe('when per labware and per sample columns are combined', () => {
    it('renders the same number of cells in every row as there are headers', () => {
      renderSourceTable([perLabwareColumn, perSampleColumn]);
      const [header, ...rows] = Array.from(screen.getByTestId('source-table').children);
      expect(rows).toHaveLength(4);
      rows.forEach((row) => expect(row.children).toHaveLength(header.children.length));
    });

    it('keeps each cell under its own column', () => {
      renderSourceTable([perLabwareColumn, perSampleColumn]);
      const [header, ...rows] = Array.from(screen.getByTestId('source-table').children);
      const perSampleColumnIndex = Array.from(header.children).findIndex((cell) => cell.textContent === 'Per Sample');
      rows.forEach((row) =>
        expect(row.children[perSampleColumnIndex].querySelector('[data-testid^="per-sample-"]')).not.toBeNull()
      );
    });
  });

  describe('when labware can be unscanned', () => {
    it('shows an Unscan column with a button on the first row of each labware', () => {
      renderSourceTable([]);
      expect(screen.getByText('Unscan')).toBeInTheDocument();
      expect(screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
        'Unscan STAN-100',
        'Unscan STAN-200'
      ]);
    });

    it('explains that layouts already using the labware keep its samples', () => {
      renderSourceTable([]);
      expect(screen.getByRole('button', { name: 'Unscan STAN-100' })).toHaveAttribute(
        'title',
        'Unscan STAN-100. Layouts already using it keep its samples.'
      );
    });
  });

  describe('when labware cannot be unscanned', () => {
    it('shows no Unscan column', () => {
      render(<SourceTable sourceLabware={sourceLabware} />);
      expect(screen.queryByText('Unscan')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      const [header, ...rows] = Array.from(screen.getByTestId('source-table').children);
      rows.forEach((row) => expect(row.children).toHaveLength(header.children.length));
    });
  });
});
