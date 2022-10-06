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
import slotCopyMachine from '../lib/machines/slotCopy/slotCopyMachine';
import { Link } from 'react-router-dom';
import { history, reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Heading from '../components/Heading';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../components/Table';
import { ConfirmationModal } from '../components/modal/ConfirmationModal';
import Label from '../components/forms/Label';
import { Select } from '../components/forms/Select';
import { plateFactory } from '../lib/factories/labwareFactory';

type PageParams = {
  title: string;
  initialOutputLabware: NewLabwareLayout[];
};

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={'Slots copied'} />;

interface OutputLabwareScanPanelProps {
  onAddLabware: () => void;
  onChangeBioState: (bioState: string) => void;
}

const transferTypes = ['cDNA', 'Probe', 'Library'];

interface InputLabwareScanPanelProps {
  onChangeState: (state: string) => void;
}

/**Component to configure the output labware**/
const SlotCopyDestinationConfigPanel: React.FC<OutputLabwareScanPanelProps> = ({ onAddLabware, onChangeBioState }) => {
  return (
    <div className={'w-full flex flex-row space-x-4 mb-8'} data-testid="input-labware">
      <div className={'w-1/2 flex flex-col'}>
        <Label className={'flex items-center whitespace-nowrap'} name={'Bio State'} />
        <Select
          onChange={(e) => {
            onChangeBioState(e.currentTarget.value);
          }}
          emptyOption={true}
          data-testid="transfer-type"
        >
          {transferTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>
      <div className={'w-1/2 flex justify-end items-center'}>
        <BlueButton onClick={onAddLabware} className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm">
          + Add Labware
        </BlueButton>
      </div>
    </div>
  );
};

/**Component to configure the input labware**/
const SlotCopySourceConfigPanel: React.FC<InputLabwareScanPanelProps> = ({ onChangeState }) => {
  return (
    <div className={'w-1/2 mt-4 flex flex-col'} data-testid="input-labware">
      <Label name={'Labware state'} className={'whitespace-nowrap'} />
      <Select
        onChange={(e) => {
          onChangeState(e.currentTarget.value);
        }}
        emptyOption={true}
        data-testid="input-labware-state"
      >
        {[LabwareState.Active, LabwareState.Used, LabwareState.Discarded].map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </Select>
    </div>
  );
};

function SlotCopy({ title, initialOutputLabware }: PageParams) {
  const outputLabwareDetails = React.useMemo(() => {
    return initialOutputLabware.map((lw) => {
      return {
        labware: lw,
        slotCopyDetails: {
          labwareType: lw.labwareType.name,
          contents: []
        }
      };
    });
  }, []);
  const [current, send] = useMachine(() =>
    slotCopyMachine.withContext({
      workNumber: '',
      operationType: 'Visium cDNA',
      destinations: outputLabwareDetails,
      sources: [],
      selectedDestIndex: -1,
      selectedSrcBarcode: '',
      slotCopyResults: [],
      sourceLabwarePermData: []
    })
  );

  const [labwaresWithoutPerm, setLabwaresWithoutPerm] = React.useState<LabwareFieldsFragment[]>([]);
  const [warnBeforeSave, setWarnBeforeSave] = React.useState(false);
  const { serverErrors, sourceLabwarePermData, sources, destinations, slotCopyResults, selectedSrcBarcode } =
    current.context;

  const handleOnSlotMapperChange = useCallback(
    (slotCopyContent: Array<SlotCopyContent>, anySourceMapped: boolean) => {
      send({
        type: 'UPDATE_SLOT_COPY_CONTENT',
        slotCopyContent,
        anySourceMapped
      });
    },
    [send]
  );

  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [send]
  );

  const handleSave = React.useCallback(() => {
    setWarnBeforeSave(false);
    send({ type: 'SAVE' });
  }, [setWarnBeforeSave, send]);

  const handleInputLabwareChange = React.useCallback(
    (sourcesChanged: LabwareFieldsFragment[]) => {
      /**Check a new labware is added**/
      if (sourcesChanged.length < sources.length) {
        const removedSource = sources.filter(
          (org) => !sourcesChanged.some((changed) => changed.barcode === org.barcode)
        );
        if (removedSource.length > 0) {
          send({ type: 'REMOVE_SOURCE_LABWARE', barcode: removedSource[0].barcode });
        }
      } /**Check any labware is removed**/ else if (sourcesChanged.length > sources.length) {
        const addedSource = sourcesChanged.filter((changed) => !sources.some((org) => changed.barcode === org.barcode));
        if (addedSource.length > 0) {
          send({ type: 'ADD_SOURCE_LABWARE', labware: addedSource[0] });
        }
      }
      send({ type: 'UPDATE_SOURCE_LABWARE_PERMTIME', labwares: sourcesChanged });
    },
    [send]
  );

  const onAddDestinationLabware = React.useCallback(() => {
    send({ type: 'ADD_DESTINATION_LABWARE', labware: plateFactory.build() });
  }, [send]);

  const onRemoveDestinationLabware = React.useCallback(
    (removeIndex: number) => {
      send({ type: 'REMOVE_DESTINATION_LABWARE', index: removeIndex });
    },
    [send]
  );

  const onSourceLabwareStateChange = React.useCallback(
    (labwareState: string) => {
      if (!selectedSrcBarcode) {
        return;
      }
      send({
        type: 'UPDATE_SOURCE_LABWARE_STATE',
        barcode: selectedSrcBarcode!,
        labwareState: labwareState as unknown as LabwareState
      });
    },
    [send, selectedSrcBarcode]
  );

  const onChangeBioState = React.useCallback(
    (bioState: string) => {
      send({
        type: 'UPDATE_DESTINATION_BIO_STATE',
        bioState
      });
    },
    [send]
  );

  /**
   * Save action invoked, so check whether a warning to be given to user if any labware with no perm done is copied
   ***/
  const onSaveAction = React.useCallback(() => {
    /**Get all input lawares that didn't perform perm operation and are mapped/copied to 96 well plate*/

    const slotCopyContents = destinations.flatMap((dest) => dest.slotCopyDetails.contents);

    const labwareWithoutPermData = sourceLabwarePermData?.filter(
      (permData) =>
        permData.visiumPermData.addressPermData.length === 0 &&
        slotCopyContents.some((scc) => scc.sourceBarcode === permData.visiumPermData.labware.barcode)
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
            initialOutputLabware={destinations.map((dest) => dest.labware)}
            onChange={handleOnSlotMapperChange}
            onInputLabwareChange={handleInputLabwareChange}
            inputLabwareConfigPanel={<SlotCopySourceConfigPanel onChangeState={onSourceLabwareStateChange} />}
            outputLabwareConfigPanel={
              <SlotCopyDestinationConfigPanel
                onAddLabware={onAddDestinationLabware}
                onChangeBioState={onChangeBioState}
              />
            }
            onRemoveOutputLabware={onRemoveDestinationLabware}
          />

          {destinations.length > 0 && (
            <div className="mt-8 flex flex-row items-center sm:justify-end">
              <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow space-y-2">
                <LabelPrinter labwares={slotCopyResults} />
              </div>
            </div>
          )}
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches('copied') && (
            <BlueButton
              disabled={!current.matches('readyToCopy') || current.context.workNumber === ''}
              onClick={onSaveAction}
            >
              Save
            </BlueButton>
          )}

          {current.matches('copied') && (
            <>
              <BlueButton onClick={reload} action="tertiary">
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
                history.push({
                  pathname: '/lab/visium_perm'
                });
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
