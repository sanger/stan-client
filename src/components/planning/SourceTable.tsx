import { LabwareFlaggedFieldsFragment } from '../../types/sdk';
import React from 'react';
import { SampleDataTableRow } from '../dataTableColumns/sampleColumns';
import { Dictionary, uniqBy } from 'lodash';
import RemoveButton from '../buttons/RemoveButton';
import { Row } from 'react-table';

export const extractSourceSamplesFromLabware = (
  labware: LabwareFlaggedFieldsFragment[]
): Dictionary<SampleDataTableRow[]> => {
  return labware.reduce<Dictionary<SampleDataTableRow[]>>((acc, lw) => {
    const rows: SampleDataTableRow[] = lw.slots.flatMap((slot) =>
      slot.samples.map((sample) => ({
        ...sample,
        slotAddress: slot.address,
        barcode: lw.barcode,
        labwareType: lw.labwareType
      }))
    );
    acc[lw.barcode] = uniqBy(rows, (r) => `${r.barcode}-${r.tissue.externalName}`);
    return acc;
  }, {});
};

export type ExtraColumnType = {
  header: string;
  cell: ({ row }: { row: Row<SampleDataTableRow> }) => JSX.Element;
  // Render the cell on every sample row, rather than only on the first row of each labware
  perSample?: boolean;
};

export type RemoveLabwareConfig = {
  callback: (barcode: string) => void;
  // Column header and button label; left blank if not given, so pages that don't opt in are unaffected
  header?: string;
  // Returns why removal is disabled for this barcode, shown as the button's tooltip, or undefined to allow it
  disabledReason?: (barcode: string) => string | undefined;
};

export type SourceTableColumnsConfig = {
  extraColumns?: Array<ExtraColumnType>;
  showLastKnownSectionNumberColumn?: boolean;
  removeLabware?: RemoveLabwareConfig;
};

type SourceTableProps = {
  sourceLabware: Array<LabwareFlaggedFieldsFragment>;
  columnTableConfig?: SourceTableColumnsConfig;
};

export const SourceTable = ({ sourceLabware, columnTableConfig = {} }: SourceTableProps) => {
  const { showLastKnownSectionNumberColumn = true, extraColumns, removeLabware } = columnTableConfig;

  const sources = React.useMemo(() => {
    return extractSourceSamplesFromLabware(sourceLabware);
  }, [sourceLabware]);

  const gridColsNumber = React.useMemo(() => {
    const fixedColNumber = 3; // Barcode, External ID, Replicate
    let gridColsNumber = fixedColNumber;
    if (removeLabware) gridColsNumber = fixedColNumber + 1;
    if (extraColumns) gridColsNumber = gridColsNumber + extraColumns.length;
    if (showLastKnownSectionNumberColumn) gridColsNumber = gridColsNumber + 1;
    return gridColsNumber;
  }, [showLastKnownSectionNumberColumn, extraColumns, removeLabware]);

  if (sourceLabware.length === 0) return null;

  return (
    <div
      data-testid="source-table"
      className="bg-gray-100 text-center border-gray-500 border-b shadow-sm ring-2 ring-gray-200 mt-12"
    >
      <div className={`grid grid-cols-${gridColsNumber} gap-x-1 py-2 font-medium text-gray-600 tracking-wide`}>
        <div>Barcode</div>
        <div>External ID</div>
        <div>Replicate</div>
        {showLastKnownSectionNumberColumn && <div>Last Known Section Number</div>}
        {extraColumns && extraColumns.map((col, index) => <div key={`header-${index}`}>{col.header}</div>)}
        {removeLabware && <div>{removeLabware.header ?? ''}</div>}
      </div>
      {Object.keys(sources).map((barcode) =>
        sources[barcode].map((sample, index) => (
          <div
            key={index}
            className={`grid grid-cols-${gridColsNumber} gap-x-1 py-2 ${index === 0 ? 'border-t border-gray-400' : ''}`}
          >
            <div>{index === 0 ? barcode : ''}</div>
            <div>{sample.tissue.externalName}</div>
            <div>{sample.tissue.replicate}</div>
            {showLastKnownSectionNumberColumn && (
              <div data-testid="block-highest-section">{sample.blockHighestSection}</div>
            )}
            {extraColumns &&
              extraColumns.map((col, idx) => (
                <div key={`cell-${idx}`}>
                  {(col.perSample || index === 0) && col.cell({ row: { original: sample } as Row<SampleDataTableRow> })}
                </div>
              ))}

            {removeLabware && (
              <div>
                {index === 0 ? (
                  <RemoveButton
                    type={'button'}
                    aria-label={removeLabware.header ? `${removeLabware.header} ${barcode}` : undefined}
                    title={removeLabware.disabledReason?.(barcode)}
                    disabled={!!removeLabware.disabledReason?.(barcode)}
                    onClick={() => removeLabware.callback(barcode)}
                  />
                ) : (
                  ''
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
