import React, { useCallback } from 'react';
import SlotMapper from '../slotMapper/SlotMapper';
import BlueButton from '../buttons/BlueButton';
import { NewFlaggedLabwareLayout } from '../../types/stan';
import { LabwareFlaggedFieldsFragment, LabwareState, SlotCopyContent } from '../../types/sdk';
import Label from '../forms/Label';
import CustomReactSelect, { OptionType } from '../forms/CustomReactSelect';
import { DestinationSelectionMode, SlotCopyMode } from '../slotMapper/slotMapper.types';
import RadioGroup, { RadioButtonInput } from '../forms/RadioGroup';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import RemoveButton from '../buttons/RemoveButton';
import { StripyCardDetail } from '../StripyCard';
import { MachineSnapshot } from 'xstate';
import { Destination, SlotCopyContext, SlotCopyEvent, Source } from '../../lib/machines/slotCopy/slotCopyMachine';
import { plateFactory } from '../../lib/factories/labwareFactory';

type SlotCopyParams = {
  title: string;
  initialOutputLabware: NewFlaggedLabwareLayout[];
  initialOutputSlotCopy: Array<Destination>;
  send: (event: SlotCopyEvent) => void;
  current: MachineSnapshot<SlotCopyContext, SlotCopyEvent, any, any, any, any>;
  slotCopyModes: Array<SlotCopyMode>;
  addPlateOption?: boolean;
  labwareDestinationSelectionMode?: DestinationSelectionMode;
  onDestinationSelectionMode?: (mode: DestinationSelectionMode) => void;
};

interface DestinationLabwareScanPanelProps {
  labware: Destination | undefined;
  onAddLabware?: () => void;
  onChangeBioState: (bioState: string) => void;
  onLabwareScan?: (labware: LabwareFlaggedFieldsFragment[]) => void;
  onDestinationSelectionModeChange?: (mode: DestinationSelectionMode) => void;
  destinationSelectionMode: DestinationSelectionMode;
}

const transferTypes = [
  'cDNA',
  'Probes',
  'Library',
  'Library pre-clean',
  'Library post-clean',
  'Probes pre-clean',
  'Probes post-clean'
];

interface SourceLabwareScanPanelProps {
  selectedSource: Source | undefined;
  onChangeState: (state: string) => void;
}

/**Component to display fields above the output labware**/
export const SlotCopyDestinationConfigPanel: React.FC<DestinationLabwareScanPanelProps> = ({
  labware,
  onAddLabware,
  onChangeBioState,
  onLabwareScan,
  onDestinationSelectionModeChange,
  destinationSelectionMode
}) => {
  const validateLabware = useCallback(
    (labwares: LabwareFlaggedFieldsFragment[], foundLabware: LabwareFlaggedFieldsFragment): string[] => {
      return foundLabware.state === LabwareState.Active ? [] : ['Labware is not active'];
    },
    []
  );
  const bioStatesStr = (destination: Destination) =>
    [...new Set(destination.labware.slots.flatMap((slot) => slot.samples.map((sample) => sample.bioState.name)))].join(
      ', '
    );

  return (
    <div className={'w-full flex flex-col space-y-2'} data-testid="input-labware">
      <div className="flex flex-row pb-2">
        <RadioGroup label="Output labware selection " name={'selectDestination'} withFormik={false}>
          {Object.values(DestinationSelectionMode).map((mode) => (
            <RadioButtonInput
              key={mode}
              data-testid={`${mode}`}
              name={'destinationMode'}
              value={mode}
              checked={mode === destinationSelectionMode}
              onChange={() => {
                onDestinationSelectionModeChange?.(mode);
              }}
              label={mode}
            />
          ))}
        </RadioGroup>
      </div>
      <div className={'w-full flex flex-row space-x-4 mb-8'} data-testid="input-labware">
        {destinationSelectionMode === DestinationSelectionMode.DEFAULT ? (
          <>
            <div className={'w-1/2 flex flex-col'}>
              <Label className={'flex items-center whitespace-nowrap'} name={'Bio State'} />
              <CustomReactSelect
                handleChange={(val) => onChangeBioState((val as OptionType).label)}
                value={labware && labware.slotCopyDetails.bioState ? labware.slotCopyDetails.bioState : ''}
                emptyOption={true}
                dataTestId="bioState"
                options={transferTypes.map((type) => {
                  return {
                    label: type,
                    value: type
                  };
                })}
              />
            </div>
            {onAddLabware && (
              <div className={'w-1/2 flex justify-end items-center'}>
                <BlueButton
                  data-testid={'add-plate'}
                  onClick={onAddLabware}
                  className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
                >
                  + Add Plate
                </BlueButton>
              </div>
            )}
          </>
        ) : (
          <div className={'flex flex-col w-full space-y-2'} data-testid={'dest-scanner'}>
            <LabwareScanner
              onChange={onLabwareScan}
              limit={1}
              labwareCheckFunction={validateLabware}
              enableFlaggedLabwareCheck
              locked={labware?.labware.barcode !== undefined}
            >
              {(props) => {
                return (
                  <div className="flex flex-col">
                    {props.labwares.length > 0 && (
                      <>
                        <div className={'flex flex-row justify-end'}>
                          <RemoveButton
                            onClick={() => {
                              labware?.labware.barcode && props.removeLabware(labware?.labware.barcode);
                              onLabwareScan?.([]);
                            }}
                          />
                        </div>
                        {labware && labware?.labware.barcode && (
                          <StripyCardDetail term={'Bio State'}>
                            <div className={'flex flex-wrap text-gray-600'}>{bioStatesStr(labware)}</div>
                          </StripyCardDetail>
                        )}
                      </>
                    )}
                  </div>
                );
              }}
            </LabwareScanner>
          </div>
        )}
      </div>
    </div>
  );
};

/**Component to display fields above the input labware**/
export const SlotCopySourceConfigPanel: React.FC<SourceLabwareScanPanelProps> = ({ selectedSource, onChangeState }) => {
  return (
    <div className={'w-1/2 mt-4 flex flex-col'} data-testid="input-labware">
      <Label name={'Labware state'} className={'whitespace-nowrap'} />
      <CustomReactSelect
        handleChange={(val) => {
          onChangeState((val as OptionType).label);
        }}
        value={selectedSource && selectedSource.labwareState ? selectedSource.labwareState : ''}
        emptyOption={true}
        dataTestId="input-labware-state"
        options={[LabwareState.Active, LabwareState.Used, LabwareState.Discarded].map((state) => {
          return {
            label: state,
            value: state
          };
        })}
      />
    </div>
  );
};

/**Reformat the props to 'Destination' type**/
const defaultOutputLabware: NewFlaggedLabwareLayout = plateFactory.build() as NewFlaggedLabwareLayout;

export const defaultOutputSlotCopy: Destination = {
  labware: { ...defaultOutputLabware, id: Date.parse(defaultOutputLabware.created) },
  slotCopyDetails: {
    labwareType: defaultOutputLabware.labwareType.name,
    contents: []
  }
};

function SlotCopyComponent({
  current,
  send,
  initialOutputSlotCopy,
  slotCopyModes,
  addPlateOption = true,
  labwareDestinationSelectionMode = DestinationSelectionMode.DEFAULT
}: SlotCopyParams) {
  const { sources, destinations } = current.context;

  /** State to keep  track of selected source labware**/
  const [selectedSource, setSelectedSource] = React.useState<LabwareFlaggedFieldsFragment | undefined>(
    sources[0]?.labware
  );

  /** State to keep track of selected destination labware**/
  const [selectedDestination, setSelectedDestination] = React.useState<NewFlaggedLabwareLayout>(
    initialOutputSlotCopy[0].labware
  );

  const destinationSelectionMode = React.useRef(labwareDestinationSelectionMode);

  /**Handler action to perform when a mapping is done  between source and destination**/
  const handleOnSlotMapperChange = useCallback(
    (labware: NewFlaggedLabwareLayout, slotCopyContent: Array<SlotCopyContent>, anySourceMapped: boolean) => {
      send({
        type: 'UPDATE_SLOT_COPY_CONTENT',
        labware,
        slotCopyContent,
        anySourceMapped
      });
    },
    [send]
  );

  /**Action callback(from SlotMapper) when there is a change in source labware (addition/deletion)**/
  const handleInputLabwareChange = React.useCallback(
    (sourcesChanged: LabwareFlaggedFieldsFragment[]) => {
      send({
        type: 'UPDATE_SOURCE_LABWARE',
        labware: sourcesChanged
      });
      send({
        type: 'UPDATE_SOURCE_LABWARE_PERMTIME',
        labwares: sourcesChanged,
        destination: destinations.find((dest) => dest.labware.id === selectedDestination.id)
      });
    },
    [send, selectedDestination, destinations]
  );

  /**Action callback(from SlotMapper) when there is a change in destination labware
   * (It will be normally a deletion operation as the addition is handled within SlotCopy itself)
   * **/
  const handleOutputLabwareChange = React.useCallback(
    (destinations: NewFlaggedLabwareLayout[]) => {
      send({ type: 'UPDATE_DESTINATION_LABWARE', labware: destinations });
    },
    [send]
  );

  /**Handler for output labware selection mode change**/
  const onDestinationSelectionModeChange = React.useCallback(
    (mode: DestinationSelectionMode) => {
      destinationSelectionMode.current = mode;
      const labware = mode === DestinationSelectionMode.DEFAULT ? [defaultOutputSlotCopy.labware] : [];
      send({ type: 'UPDATE_DESTINATION_LABWARE', labware });
      send({ type: 'UPDATE_DESTINATION_SELECTION_MODE', mode });
    },
    [send]
  );

  /**Handler for 'Add Plate' button click**/
  const onAddDestinationLabware = React.useCallback(() => {
    const labware = plateFactory.build({}) as NewFlaggedLabwareLayout;
    const labwareArray = destinations.map((dest) => dest.labware);
    labwareArray.push(labware);
    send({ type: 'UPDATE_DESTINATION_LABWARE', labware: labwareArray });
  }, [send, destinations]);

  /**Handler for a labware state change in source**/
  const onSourceLabwareStateChange = React.useCallback(
    (labwareState: string) => {
      if (!selectedSource) {
        return;
      }
      send({
        type: 'UPDATE_SOURCE_LABWARE_STATE',
        labware: selectedSource,
        labwareState: labwareState as unknown as LabwareState
      });
    },
    [send, selectedSource]
  );

  /**Handler for Bio-state change in destination**/
  const onChangeBioState = React.useCallback(
    (bioState: string) => {
      if (!selectedDestination) {
        return;
      }
      send({
        type: 'UPDATE_DESTINATION_BIO_STATE',
        labware: selectedDestination,
        bioState
      });
    },
    [selectedDestination, send]
  );

  /**Handler for output labware selection mode change**/
  const onDestinationLabwareScan = React.useCallback(
    (labware: LabwareFlaggedFieldsFragment[]) => {
      send({ type: 'UPDATE_DESTINATION_LABWARE', labware: labware });
    },
    [send]
  );

  return (
    <>
      <div className="mx-auto">
        <SlotMapper
          locked={current.matches('copied')}
          initialOutputLabware={destinations.map((output) => {
            return { labware: output.labware, slotCopyContent: output.slotCopyDetails.contents };
          })}
          initialInputLabware={sources.map((source) => source.labware)}
          onInputLabwareChange={handleInputLabwareChange}
          onChange={handleOnSlotMapperChange}
          onOutputLabwareChange={handleOutputLabwareChange}
          inputLabwareConfigPanel={
            sources.length > 0 && (
              <SlotCopySourceConfigPanel
                onChangeState={onSourceLabwareStateChange}
                selectedSource={sources.find((src) => src.labware.barcode === selectedSource?.barcode)}
              />
            )
          }
          outputLabwareConfigPanel={
            <SlotCopyDestinationConfigPanel
              onAddLabware={addPlateOption ? onAddDestinationLabware : undefined}
              onChangeBioState={onChangeBioState}
              onLabwareScan={onDestinationLabwareScan}
              onDestinationSelectionModeChange={onDestinationSelectionModeChange}
              labware={destinations.find((dest) => dest.labware.id === selectedDestination.id)}
              destinationSelectionMode={destinationSelectionMode.current}
            />
          }
          onSelectInputLabware={setSelectedSource}
          onSelectOutputLabware={setSelectedDestination}
          slotCopyModes={slotCopyModes}
        />
      </div>
    </>
  );
}

export default SlotCopyComponent;
