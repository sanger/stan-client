import { LabwareFlaggedFieldsFragment } from '../../types/sdk';
import React from 'react';
import { SampleDataTableRow } from '../dataTableColumns/sampleColumns';
import { Dictionary, uniqBy } from 'lodash';
import RemoveButton from '../buttons/RemoveButton';

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

export const SourceTable = ({
  sourceLabware,
  removeLabwareCallBack
}: {
  sourceLabware: Array<LabwareFlaggedFieldsFragment>;
  removeLabwareCallBack?: (barcode: string) => void;
}) => {
  const sources = React.useMemo(() => {
    return extractSourceSamplesFromLabware(sourceLabware);
  }, [sourceLabware]);

  if (sourceLabware.length === 0) return null;

  return (
    <div data-testid="source-table" className="bg-gray-100 text-center border-gray-500 border-b">
      <div className="grid grid-cols-5 gap-x-1 py-2 font-medium text-gray-600 tracking-wide  border-gray-500 border-b">
        <div>Barcode</div>
        <div>External ID</div>
        <div>Replicate</div>
        <div>Last Known Section Number</div>
        <div></div>
      </div>
      {Object.keys(sources).map((barcode) =>
        sources[barcode].map((sample, index) => (
          <div key={index} className={`grid grid-cols-5 gap-x-1 py-2 ${index === 0 ? 'border-t border-gray-400' : ''}`}>
            <div>{index === 0 ? barcode : ''}</div>
            <div>{sample.tissue.externalName}</div>
            <div>{sample.tissue.replicate}</div>
            <div data-testid="block-highest-section">{sample.blockHighestSection}</div>
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
