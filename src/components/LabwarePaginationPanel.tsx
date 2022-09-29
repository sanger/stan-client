import React from 'react';
import { LabwareFieldsFragment, SlotFieldsFragment } from '../types/sdk';
import { motion } from 'framer-motion';
import Labware from './labware/Labware';
import IconButton from './buttons/IconButton';
import LeftArrowIcon from './icons/LeftArrowIcon';
import RightArrowIcon from './icons/RightArrowIcon';

interface PaginationPanelProps {
  labware: Array<LabwareFieldsFragment>;
  getSourceSlotColor: (labware: LabwareFieldsFragment, address: string, slot: SlotFieldsFragment) => string;
  onSlotSelection: (barcode: string, selectedSlotAddress: string[]) => void;
}
const LabwarePaginationPanel: React.FC<PaginationPanelProps> = ({ labware, getSourceSlotColor, onSlotSelection }) => {
  /**selectecLabware is required to keep the labware in selection to be in display,
   * in case the labware list changes externally (for example deletion of other can lw still keep the display same)
   ***/
  const [selectedLabware, setSelectedLabware] = React.useState<LabwareFieldsFragment | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

  React.useEffect(() => {
    if (labware.length <= 0) {
      setSelectedLabware(undefined);
      setSelectedIndex(-1);
    } else {
      if (selectedLabware) {
        const lwIndex = labware.findIndex((lw) => lw.barcode === selectedLabware.barcode);
        if (lwIndex >= 0) {
          setSelectedIndex(lwIndex);
          return;
        }
      }
      setSelectedLabware(labware[0]);
      setSelectedIndex(0);
    }
  }, [labware]);

  const handleSelection = React.useCallback((selectedAddresses: string[]) => {
    if (!selectedLabware) return;
    onSlotSelection(selectedLabware.barcode, selectedAddresses);
  }, []);

  return (
    <div className={'border-1 border-gray-100 flex-col'}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
        {selectedLabware && (
          <Labware
            labware={selectedLabware}
            selectable="non_empty"
            selectionMode="single"
            slotColor={(address, slot) => {
              return getSourceSlotColor(selectedLabware, address, slot);
            }}
            name={selectedLabware.labwareType.name}
            onSelect={handleSelection}
          />
        )}
      </motion.div>
      {labware.length > 0 && (
        <div className="flex flex-row items-center justify-end space-x-4">
          <IconButton
            type="button"
            disabled={selectedIndex <= 0}
            data-testid={`left-button`}
            onClick={() => {
              setSelectedIndex((prev) => prev - 1);
            }}
          >
            <LeftArrowIcon />
          </IconButton>
          {`${selectedIndex + 1} of ${labware.length}`}
          <IconButton
            type="button"
            disabled={selectedIndex >= labware.length - 1}
            data-testid={`right-button`}
            onClick={() => {
              setSelectedIndex((prev) => prev + 1);
            }}
          >
            <RightArrowIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default LabwarePaginationPanel;
