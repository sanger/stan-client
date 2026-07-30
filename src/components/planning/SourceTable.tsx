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
};

type SourceTableProps = {
  sourceLabware: Array<LabwareFlaggedFieldsFragment>;
  removeLabwareCallBack?: (barcode: string) => void;
  extraColumns?: Array<ExtraColumnType>;
};

export const SourceTable = ({ sourceLabware, removeLabwareCallBack, extraColumns }: SourceTableProps) => {
  const sources = React.useMemo(() => {
    return extractSourceSamplesFromLabware(sourceLabware);
  }, [sourceLabware]);

  const gridColsNumber = React.useMemo(() => {
    const fixedColNumber = 5;
    let gridColsNumber = fixedColNumber;
    if (removeLabwareCallBack) gridColsNumber = fixedColNumber + 1;
    if (extraColumns) gridColsNumber = fixedColNumber + extraColumns.length;
    return gridColsNumber;
  }, [removeLabwareCallBack, extraColumns]);

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
        <div>Last Known Section Number</div>
        {extraColumns && extraColumns.map((col, index) => <div key={`header-${index}`}>{col.header}</div>)}
        <div></div>
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
            <div data-testid="block-highest-section">{sample.blockHighestSection}</div>
            {extraColumns &&
              index === 0 &&
              extraColumns.map((col, idx) => (
                <div key={`cell-${idx}`}>{col.cell({ row: { original: sample } as Row<SampleDataTableRow> })}</div>
              ))}

            {removeLabwareCallBack && (
              <div>
                {index === 0 ? <RemoveButton type={'button'} onClick={() => removeLabwareCallBack(barcode)} /> : ''}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
