import Heading from '../Heading';
import ScanInput from '../scanInput/ScanInput';
import { ErrorMessage } from '../forms';
import MutedText from '../MutedText';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import Label from '../forms/Label';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import ReagentTransferSlotMapper from '../slotMapper/ReagentTransferSlotMapper';
import { LabwareFlaggedFieldsFragment, SlotCopyContent } from '../../types/sdk';
import React, { useCallback } from 'react';
import { MachineSnapshot } from 'xstate';
import {
  ReagentTransferContext,
  ReagentTransferEvent
} from '../../lib/machines/reagentTransfer/reagentTransferMachine';
import { PLATE_TYPES } from '../../pages/DualIndexPlate';
import labwareFactory from '../../lib/factories/labwareFactory';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../types/stan';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import { OutputSlotCopyData } from '../slotMapper/slotMapper.types';

type DualIndexPlateParams = {
  destinationLabware?: LabwareFlaggedFieldsFragment;
  send: (event: ReagentTransferEvent) => void;
  current: MachineSnapshot<ReagentTransferContext, any, any, any, any, any, any, any>;
  outputSlotCopies?: Array<OutputSlotCopyData>;
  destinationCleanedOutAddresses?: string[];
};

const DualIndexPlateComponent = ({
  current,
  send,
  destinationLabware,
  outputSlotCopies,
  destinationCleanedOutAddresses
}: DualIndexPlateParams) => {
  const { sourceReagentPlate, destLabware, plateType, validationError, cleanedOutAddresses } = current.context;
  React.useEffect(() => {
    if (destinationLabware) {
      send({
        type: 'SET_DESTINATION_LABWARE',
        labware: destinationLabware
      });
    }
  }, [destinationLabware, send]);

  const handlePlateTypeChange = useCallback(
    (plateType: string) => {
      send({ type: 'SET_PLATE_TYPE', plateType });
    },
    [send]
  );

  const memoInputLabware = React.useMemo(() => {
    if (!sourceReagentPlate) {
      return undefined;
    }
    const plate = labwareFactory.build({
      labwareType: labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.DUAL_INDEX_PLATE),
      barcode: sourceReagentPlate.barcode
    });
    plate.barcode = sourceReagentPlate.barcode;
    if (sourceReagentPlate.slots) {
      sourceReagentPlate.slots.forEach((slot, indx) => {
        if (slot.used) {
          plate.slots[indx].samples = [];
        }
      });
    }
    return buildLabwareFragment(plate);
  }, [sourceReagentPlate]);

  const handleOnSlotMapperChange = useCallback(
    (slotCopyContent: Array<SlotCopyContent>) => {
      const reagentTransfers = slotCopyContent.map((scc) => {
        return {
          reagentPlateBarcode: memoInputLabware!.barcode,
          reagentSlotAddress: scc.sourceAddress,
          destinationAddress: scc.destinationAddress
        };
      });
      send({ type: 'UPDATE_TRANSFER_CONTENT', reagentTransfers });
    },
    [send, memoInputLabware]
  );

  return (
    <div>
      <div className="grid grid-cols-2 auto-rows-max">
        <div className="space-y-4">
          <Heading level={4}>Dual Index Plate</Heading>
          <div className="w-1/2" id="sourceScanInput">
            <ScanInput
              onScan={(value) => {
                send({ type: 'SET_SOURCE_LABWARE', barcode: value });
              }}
              disabled={sourceReagentPlate !== undefined}
            />
            {validationError && (
              <div className={'mt-2'}>
                <ErrorMessage>{validationError}</ErrorMessage>
              </div>
            )}
            <MutedText>Add source labware using the scan input above</MutedText>
          </div>
        </div>
        <div className="space-y-4">
          <Heading level={4}>Destination Labware</Heading>
          {!destinationLabware && (
            <div>
              <LabwareScanner
                onChange={(labwares, cleanedOutAddresses) =>
                  send({
                    type: 'SET_DESTINATION_LABWARE',
                    labware: labwares[0],
                    cleanedOutAddresses: cleanedOutAddresses?.get(labwares[0].id)
                  })
                }
                locked={destLabware !== undefined}
                checkForCleanedOutAddresses
              ></LabwareScanner>
              <MutedText>Add destination labware using the scan input above</MutedText>
            </div>
          )}
        </div>
      </div>
      {sourceReagentPlate && (
        <div className="w-1/4 mt-4 mb-4" id="plateType">
          <Label name={'Plate Type'}>
            <CustomReactSelect
              emptyOption
              dataTestId={'plateType'}
              handleChange={(val) => handlePlateTypeChange((val as OptionType).label)}
              value={sourceReagentPlate ? sourceReagentPlate.plateType ?? plateType : plateType}
              isDisabled={sourceReagentPlate && PLATE_TYPES.includes(sourceReagentPlate.plateType ?? '')}
              options={PLATE_TYPES.map((plateType) => {
                return {
                  label: plateType,
                  value: plateType
                };
              })}
            />
          </Label>
          <MutedText>Select a dual index plate type</MutedText>
        </div>
      )}

      <ReagentTransferSlotMapper
        initialDestLabware={destinationLabware ?? destLabware}
        initialSourceLabware={memoInputLabware ? (memoInputLabware as LabwareFlaggedFieldsFragment) : undefined}
        onChange={handleOnSlotMapperChange}
        disabled={current.matches('transferred')}
        outputSlotCopies={outputSlotCopies}
        cleanedOutAddresses={destinationCleanedOutAddresses ?? cleanedOutAddresses}
      />
    </div>
  );
};

export default DualIndexPlateComponent;
