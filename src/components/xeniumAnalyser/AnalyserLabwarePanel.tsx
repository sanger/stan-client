import React from 'react';
import { useFormikContext } from 'formik';
import Labware from '../labwarePerSection/Labware';
import PinkButton from '../buttons/PinkButton';
import LabwareWorkNumber from './LabwareWorkNumber';
import RegionsTable from './RegionsTable';
import { RegionDefinerFormValues, SlideLayout } from './analyser.types';
import Panel from '../Panel';
import { FlaggedBarcodeLink } from '../dataTableColumns/labwareColumns';

type AnalyserLabwarePanelProps = {
  labwareIndex: number;
  /** How the slide is drawn on this page's machine */
  slideLayout: SlideLayout;
  /** Called when the user clicks a slot or the Define Regions button */
  onDefineRegions: () => Promise<void>;
  /** Called with the region name when a region name field loses focus, unless it is empty or starts or ends with a space */
  onRoiBlur: (roi: string) => Promise<void>;
  /** Fields specific to an operation, shown next to the SGP number (e.g. the Xenium cassette position) */
  children?: React.ReactNode;
};

const AnalyserLabwarePanel = ({
  labwareIndex,
  slideLayout,
  onDefineRegions,
  onRoiBlur,
  children
}: AnalyserLabwarePanelProps) => {
  const { values } = useFormikContext<RegionDefinerFormValues>();
  const analyserLabware = values.labware[labwareIndex];
  //A slide with fewer than 10 columns sits beside its regions table; a wider one sits above it
  const gridLayoutClassName = analyserLabware.labware.numColumns < 10 ? 'grid grid-cols-2 gap-x-2' : '';

  return (
    <Panel>
      <div className="grid justify-items-end">
        {FlaggedBarcodeLink(analyserLabware.labware.barcode, analyserLabware.labware.flagPriority)}
      </div>
      <div className="grid grid-cols-4 gap-x-4 mb-4">
        <LabwareWorkNumber labwareIndex={labwareIndex} />
        {children}
      </div>
      <div className={gridLayoutClassName}>
        <div className="flex flex-col items-center space-y-8 mb-4">
          <Labware
            labware={analyserLabware.labware}
            gridDirection={slideLayout.gridDirection}
            barcodeInfoPosition={slideLayout.barcodeInfoPosition}
            regions={analyserLabware.regions}
            onSlotClick={onDefineRegions}
          />
          <PinkButton data-testid={'define-regions-button'} onClick={onDefineRegions}>
            Define Regions
          </PinkButton>
        </div>
        <div data-testid={`${analyserLabware.labware.barcode}-regions-table`}>
          <RegionsTable labwareIndex={labwareIndex} onRoiBlur={onRoiBlur} />
        </div>
      </div>
    </Panel>
  );
};

export default AnalyserLabwarePanel;
