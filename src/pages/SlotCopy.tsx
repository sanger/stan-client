import React, { useCallback, useEffect } from 'react';
import AppShell from '../components/AppShell';
import SlotMapper from '../components/slotMapper/SlotMapper';
import BlueButton from '../components/buttons/BlueButton';
import LabelPrinter from '../components/LabelPrinter';
import { NewLabwareLayout } from '../types/stan';
import Warning from '../components/notifications/Warning';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { useScrollToRef } from '../lib/hooks';
import { useMachine } from '@xstate/react';
import { LabwareFieldsFragment, LabwareState, SlotCopyContent } from '../types/sdk';
import slotCopyMachine, { Destination, Source } from '../lib/machines/slotCopy/slotCopyMachine';
import { Link, useNavigate } from 'react-router-dom';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Heading from '../components/Heading';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { ConfirmationModal } from '../components/modal/ConfirmationModal';
import Label from '../components/forms/Label';
import { plateFactory } from '../lib/factories/labwareFactory';
import LabelCopyButton from '../components/LabelCopyButton';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
import { SlotCopyMode } from '../components/slotMapper/slotMapper.types';
import { objectKeys } from '../lib/helpers';

type PageParams = {
  title: string;
  initialOutputLabware: NewLabwareLayout[];
};

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={'Slots copied'} />;

interface DestinationLabwareScanPanelProps {
  labware: Destination | undefined;
  onAddLabware: () => void;
  onChangeBioState: (bioState: string) => void;
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
const SlotCopyDestinationConfigPanel: React.FC<DestinationLabwareScanPanelProps> = ({
  labware,
  onAddLabware,
  onChangeBioState
}) => {
  return (
    <div className={'w-full flex flex-row space-x-4 mb-8'} data-testid="input-labware">
      <div className={'w-1/2 flex flex-col'}>
        <Label className={'flex items-center whitespace-nowrap'} name={'Bio State'} />
        <CustomReactSelect
          handleChange={(val) => onChangeBioState((val as OptionType).label)}
          value={labware && labware.slotCopyDetails.bioState ? labware.slotCopyDetails.bioState : ''}
          emptyOption={true}
          dataTestId="transfer-type"
          options={transferTypes.map((type) => {
            return {
              label: type,
              value: type
            };
          })}
        />
      </div>
      <div className={'w-1/2 flex justify-end items-center'}>
        <BlueButton onClick={onAddLabware} className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm">
          + Add Plate
        </BlueButton>
      </div>
    </div>
  );
};

/**Component to display fields above the input labware**/
const SlotCopySourceConfigPanel: React.FC<SourceLabwareScanPanelProps> = ({ selectedSource, onChangeState }) => {
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

function SlotCopy({ title, initialOutputLabware }: PageParams) {
  /**Reformat the props to 'Destination' type**/
  const initialOutputSlotCopy = React.useMemo(() => {
    return initialOutputLabware.map((lw) => {
      return {
        labware: { ...lw, id: Date.parse(lw.created) },
        slotCopyDetails: {
          labwareType: lw.labwareType.name,
          contents: []
        }
      };
    });
  }, [initialOutputLabware]);

  const memoSlotCopyMachine = React.useMemo(() => {
    return slotCopyMachine.withContext({
      workNumber: '',
      operationType: 'Transfer',
      destinations: initialOutputSlotCopy,
      sources: [],
      slotCopyResults: [],
      sourceLabwarePermData: []
    });
  }, [initialOutputSlotCopy]);

  const [current, send] = useMachine(() => memoSlotCopyMachine);

  /**Keep track of input labware with no permeabilisation done**/
  const [labwaresWithoutPerm, setLabwaresWithoutPerm] = React.useState<LabwareFieldsFragment[]>([]);

  const [warnBeforeSave, setWarnBeforeSave] = React.useState(false);

  /** State to keep  track of selected source labware**/
  const [selectedSource, setSelectedSource] = React.useState<LabwareFieldsFragment | undefined>(undefined);

  /** State to keep track of selected destination labware**/
  const [selectedDestination, setSelectedDestination] = React.useState<NewLabwareLayout>(
    initialOutputSlotCopy[0].labware
  );
  const { serverErrors, sourceLabwarePermData, sources, destinations, slotCopyResults } = current.context;

  const navigate = useNavigate();

  /**Handler action to perform when a mapping is done  between source and destination**/
  const handleOnSlotMapperChange = useCallback(
    (labware: NewLabwareLayout, slotCopyContent: Array<SlotCopyContent>, anySourceMapped: boolean) => {
      send({
        type: 'UPDATE_SLOT_COPY_CONTENT',
        labware,
        slotCopyContent,
        anySourceMapped
      });
    },
    [send]
  );

  /**Handler for work number chnage**/
  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [send]
  );

  /**Save action handler**/
  const handleSave = React.useCallback(() => {
    setWarnBeforeSave(false);
    send({ type: 'SAVE' });
  }, [setWarnBeforeSave, send]);

  /**Action callback(from SlotMapper) when there is a change in source labware (addition/deletion)**/
  const handleInputLabwareChange = React.useCallback(
    (sourcesChanged: LabwareFieldsFragment[]) => {
      send({ type: 'UPDATE_SOURCE_LABWARE', labware: sourcesChanged });
      send({
        type: 'UPDATE_SOURCE_LABWARE_PERMTIME',
        labwares: sourcesChanged,
        destinaton: destinations.find((dest) => dest.labware.id === selectedDestination.id)
      });
    },
    [send, selectedDestination, destinations]
  );

  /**Action callback(from SlotMapper) when there is a change in destination labware
   * (It will be normally a deletion operation as the addition is handled within SlotCopy itself)
   * **/
  const handleOutputLabwareChange = React.useCallback(
    (destinations: NewLabwareLayout[]) => {
      send({ type: 'UPDATE_DESTINATION_LABWARE', labware: destinations });
    },
    [send]
  );

  /**Handler for 'Add Plate' button click**/
  const onAddDestinationLabware = React.useCallback(() => {
    const labware = plateFactory.build({});
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

  /**
   * Save action invoked, so check whether a warning to be given to user if any labware and it's ancestral labware
   * with no perm done is copied
   ***/
  const onSaveAction = React.useCallback(() => {
    /**Get all input laware and it's ancestors that didn't perform a perm operation and are mapped/copied to 96 well plate*/
    const labwareWithoutPermData = sourceLabwarePermData?.filter(
      (permData) => permData.visiumPermData.addressPermData.length === 0
    );

    if (labwareWithoutPermData && labwareWithoutPermData.length > 0) {
      setLabwaresWithoutPerm(labwareWithoutPermData.map((permData) => permData.visiumPermData.labware));
      setWarnBeforeSave(true);
    } else {
      handleSave();
    }
  }, [handleSave, sourceLabwarePermData]);

  /**
   * When we get into the "copied" state, show a success message
   */
  useEffect(() => {
    if (current.value === 'copied') {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
    }
  }, [current.value]);

  /**Check Labware state and Bio state is selected respectively for all source and destinations**/
  const isValidationFailure = () => {
    return sources.some((src) => !src.labwareState) || destinations.some((dest) => !dest.slotCopyDetails.bioState);
  };

  /**
   * When there's an error returned from the server, scroll to it
   */
  const [ref, scrollToRef] = useScrollToRef();
  useEffect(() => {
    if (serverErrors != null) {
      scrollToRef();
    }
  }, [serverErrors, scrollToRef]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          {serverErrors && (
            <div ref={ref} className="mb-4">
              <Warning error={serverErrors} />
            </div>
          )}

          <div className="mb-8">
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">Select an SGP number to associate with this operation.</p>
            <div className="my-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>

          <SlotMapper
            locked={current.matches('copied')}
            initialOutputLabware={destinations.map((output) => {
              return { labware: output.labware, slotCopyContent: output.slotCopyDetails.contents };
            })}
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
                onAddLabware={onAddDestinationLabware}
                onChangeBioState={onChangeBioState}
                labware={destinations.find((dest) => dest.labware.id === selectedDestination.id)}
              />
            }
            onSelectInputLabware={setSelectedSource}
            onSelectOutputLabware={setSelectedDestination}
            slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
          />

          {slotCopyResults.length > 0 && (
            <div className="mt-8 flex flex-col items-end sm:justify-end space-y-2">
              <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow space-y-2">
                <LabelPrinter labwares={slotCopyResults} />
              </div>
              <div className="sm:max-w-xl w-full  border-gray-200 p-4 rounded-md bg-gray-100 shadow space-y-2 ">
                <div className={'flex items-center space-x-2'}>
                  <div className={'font-bold'}>Labels:</div>
                  <div>{slotCopyResults.map((res) => res.barcode).join(',')}</div>
                </div>
                <div className={'flex items-end sm:justify-end'}>
                  <LabelCopyButton
                    labels={slotCopyResults.map((scr) => scr.barcode)}
                    copyButtonText={'Copy Labels'}
                    buttonClass={
                      'text-white bg-sdb-400 shadow-sm hover:bg-sdb focus:border-sdb focus:shadow-outline-sdb active:bg-sdb-600'
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches('copied') && (
            <BlueButton
              disabled={!current.matches('readyToCopy') || current.context.workNumber === '' || isValidationFailure()}
              onClick={onSaveAction}
            >
              Save
            </BlueButton>
          )}

          {current.matches('copied') && (
            <>
              <BlueButton onClick={() => reload(navigate)} action="tertiary">
                Reset Form
              </BlueButton>
              <Link to={'/'}>
                <BlueButton action="primary">Return Home</BlueButton>
              </Link>
            </>
          )}
        </div>
      </div>
      {
        <ConfirmationModal
          show={warnBeforeSave}
          header={'Save transferred slots'}
          message={{
            type: 'Warning',
            text: 'Labware without Permeabilisation'
          }}
          confirmOptions={[
            {
              label: 'Cancel',
              action: () => {
                setWarnBeforeSave(false);
              }
            },
            { label: 'Continue', action: handleSave },
            {
              label: 'Visium permeabilisation',
              action: () => {
                navigate('/lab/visium_perm');
                setWarnBeforeSave(false);
              }
            }
          ]}
        >
          <p className={'font-bold mt-8'}>{'Permeabilisation has not been recorded on the following labware'}</p>
          <Table className={'mt-6 w-full overflow-y-visible'}>
            <TableHead>
              <tr>
                <TableHeader>Barcode</TableHeader>
                <TableHeader>Type</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {labwaresWithoutPerm.map((lw) => (
                <tr key={lw.barcode}>
                  <TableCell>{lw.barcode}</TableCell>
                  <TableCell>{lw.labwareType.name}</TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
          <p className="mt-8 my-3 text-gray-800 text-center text-sm  leading-normal">
            If you wish to cancel this operation and record permeabilisation on these slides, click the
            <span className="font-bold text-gray-900"> Visium Permeabilisation </span>
            button.
          </p>{' '}
          <p className="my-3 text-gray-800 text-center text-sm  leading-normal">
            Otherwise click <span className="font-bold text-gray-900">Continue or Cancel</span> to record or cancel this
            operation.
          </p>
        </ConfirmationModal>
      }
    </AppShell>
  );
}

export default SlotCopy;
