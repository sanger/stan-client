import React, { useCallback, useEffect } from 'react';
import AppShell from '../components/AppShell';
import BlueButton from '../components/buttons/BlueButton';
import LabelPrinter from '../components/LabelPrinter';
import { NewFlaggedLabwareLayout } from '../types/stan';
import Warning from '../components/notifications/Warning';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';
import { useScrollToRef } from '../lib/hooks';
import { useMachine } from '@xstate/react';
import { ExecutionType, LabwareFlaggedFieldsFragment } from '../types/sdk';
import slotCopyMachine from '../lib/machines/slotCopy/slotCopyMachine';
import { Link, useNavigate } from 'react-router-dom';
import { reload } from '../lib/sdk';
import WorkNumberSelect from '../components/WorkNumberSelect';
import Heading from '../components/Heading';
import LabelCopyButton from '../components/LabelCopyButton';
import { DestinationSelectionMode, SlotCopyMode } from '../components/slotMapper/slotMapper.types';
import { objectKeys, Position } from '../lib/helpers';
import SlotCopyComponent from '../components/libraryGeneration/SlotCopyComponent';
import { LabwareWithoutPermConfirmationModal } from '../components/libraryGeneration/LabwareWithoutPermConfirmationModal';
import RadioGroup, { RadioButtonInput } from '../components/forms/RadioGroup';

type PageParams = {
  title: string;
  initialOutputLabware: NewFlaggedLabwareLayout[];
};

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={'Slots copied'} />;

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

  const [current, send] = useMachine(slotCopyMachine, {
    input: {
      workNumber: '',
      operationType: 'Transfer',
      destinations: [],
      sources: [],
      slotCopyResults: [],
      sourceLabwarePermData: []
    }
  });

  /**Keep track of input labware with no permeabilisation done**/
  const [labwaresWithoutPerm, setLabwaresWithoutPerm] = React.useState<LabwareFlaggedFieldsFragment[]>([]);

  const [warnBeforeSave, setWarnBeforeSave] = React.useState(false);

  const {
    serverErrors,
    sourceLabwarePermData,
    sources,
    destinations,
    slotCopyResults,
    destinationSelectionMode,
    executionType
  } = current.context;

  const navigate = useNavigate();

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
    if (
      destinationSelectionMode === DestinationSelectionMode.STRIP_TUBE ||
      destinationSelectionMode === DestinationSelectionMode.PLATE
    ) {
      return sources.some((src) => !src.labwareState) || destinations.some((dest) => !dest.slotCopyDetails.bioState);
    } else {
      return sources.some((src) => !src.labwareState);
    }
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
          <div className="mb-8">
            <Heading level={4}>Transfer Type</Heading>
            <div className="grid grid-cols-2 w-1/2" data-testid="transfer-type">
              <div className="flex items-center">Select a transfer type</div>
              <RadioGroup label="" name={'transfer-type'} withFormik={false}>
                {Object.values(ExecutionType).map((type) => (
                  <RadioButtonInput
                    key={type}
                    data-testid={`${type}-transfer`}
                    name={type}
                    value={type}
                    checked={type === executionType}
                    onChange={() => {
                      send({ type: 'UPDATE_TRANSFER_TYPE_MODE', mode: type });
                    }}
                    label={type}
                  />
                ))}
              </RadioGroup>
            </div>
          </div>
          <SlotCopyComponent
            title={'Transfer to Sample'}
            initialOutputLabware={initialOutputLabware}
            current={current}
            send={send}
            initialOutputSlotCopy={initialOutputSlotCopy}
            slotCopyModes={objectKeys(SlotCopyMode).map((key) => SlotCopyMode[key])}
            barcodeInfoPosition={Position.TopRight}
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
      <LabwareWithoutPermConfirmationModal
        show={warnBeforeSave}
        labwaresWithoutPerm={labwaresWithoutPerm}
        onSave={handleSave}
        setWarnBeforeSave={setWarnBeforeSave}
      />
    </AppShell>
  );
}

export default SlotCopy;
