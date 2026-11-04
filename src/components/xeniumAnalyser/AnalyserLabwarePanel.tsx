import React from 'react';
import { useFormikContext } from 'formik';
import Labware from '../labwarePerSection/Labware';
import PinkButton from '../buttons/PinkButton';
import { GridDirection } from '../../lib/helpers';
import LabwareWorkNumber from './LabwareWorkNumber';
import RegionsTable from './RegionsTable';
import { RegionDefinerFormValues } from './analyser.types';

type AnalyserLabwarePanelProps = {
  labwareIndex: number;
  /** Called when the user clicks a slot or the Define Regions button */
  onDefineRegions: () => Promise<void>;
  /** Called with the trimmed region name when a region name field loses focus and is not empty */
  onRoiBlur: (roi: string) => Promise<void>;
  /** Fields specific to an operation, shown below the SGP number (e.g. the Xenium cassette position) */
  children?: React.ReactNode;
};

const AnalyserLabwarePanel = ({ labwareIndex, onDefineRegions, onRoiBlur, children }: AnalyserLabwarePanelProps) => {
  const { values } = useFormikContext<RegionDefinerFormValues>();
  const analyserLabware = values.labware[labwareIndex];

  return (
    <div className="grid grid-cols-4 gap-x-2">
      <div className="flex flex-col items-center space-y-8">
        <Labware
          labware={analyserLabware.labware}
          gridDirection={GridDirection.LeftUp}
          regions={analyserLabware.regions}
          onSlotClick={onDefineRegions}
        />
        <PinkButton data-testid={'define-regions-button'} onClick={onDefineRegions}>
          Define Regions
        </PinkButton>
      </div>
      <div className="col-span-3">
        <div className="grid grid-cols-7 gap-x-2">
          <div className="col-span-1">
            <div className="grid grid-rows-3 ">
              <LabwareWorkNumber labwareIndex={labwareIndex} />
              {children}
            </div>
          </div>
          <div className="col-span-6" data-testid={`${analyserLabware.labware.barcode}-regions-table`}>
            <RegionsTable labwareIndex={labwareIndex} onRoiBlur={onRoiBlur} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyserLabwarePanel;
