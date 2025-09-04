import AppShell from '../components/AppShell';
import Heading from '../components/Heading';
import WorkNumberSelect from '../components/WorkNumberSelect';
import React, { useCallback, useEffect, useRef } from 'react';
import { NewFlaggedLabwareLayout } from '../types/stan';
import { Link, useNavigate } from 'react-router-dom';
import PinkButton from '../components/buttons/PinkButton';
import ButtonBar from '../components/ButtonBar';
import SlotCopyComponent, { plateOutputSlotCopy } from '../components/libraryGeneration/SlotCopyComponent';
import slotCopyMachine from '../lib/machines/slotCopy/slotCopyMachine';
import { useMachine } from '@xstate/react';
import { OutputSlotCopyData, SlotCopyMode } from '../components/slotMapper/slotMapper.types';
import { libraryGenerationMachine } from '../lib/machines/libraryGenerationMachine';
import Warning from '../components/notifications/Warning';
import reagentTransferMachine from '../lib/machines/reagentTransfer/reagentTransferMachine';
import DualIndexPlateComponent from '../components/libraryGeneration/DualIndexPlateComponent';
import { LabwareFlaggedFieldsFragment, SlotCopyContent } from '../types/sdk';
import PromptOnLeave from '../components/notifications/PromptOnLeave';
import { BlockerFunctionParams } from './Store';
import BlueButton from '../components/buttons/BlueButton';
import Amplification from '../components/visiumQC/Amplification';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SlotMeasurement } from '../components/slotMeasurement/SlotMeasurements';
import { LabwareWithoutPermConfirmationModal } from '../components/libraryGeneration/LabwareWithoutPermConfirmationModal';
import LabelPrinter from '../components/LabelPrinter';
import LabelCopyButton from '../components/LabelCopyButton';
import { reload } from '../lib/sdk';
import Success from '../components/notifications/Success';
import { toast } from 'react-toastify';

const ToastSuccess = () => <Success message={'Library Amplification and Generation successfully completed'} />;

export const LibraryAmpAndGeneration = () => {
  const navigate = useNavigate();

  const warningRef = useRef<HTMLDivElement>(null);
  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  /**Keep track of input labware with no permeabilisation done**/
  const [labwaresWithoutPerm, setLabwaresWithoutPerm] = React.useState<LabwareFlaggedFieldsFragment[]>([]);

  const [warnBeforeSave, setWarnBeforeSave] = React.useState(false);

  const [currentSlotCopyMachine, sendSlotCopyMachine] = useMachine(slotCopyMachine, {
    input: {
      workNumber: '',
      operationType: 'Transfer',
      destinations: [],
      sources: [],
      slotCopyResults: [],
      sourceLabwarePermData: []
    }
  });

  const { sources, destinations } = currentSlotCopyMachine.context;

  const [currentLibraryGeneration, sendLibraryGeneration] = useMachine(libraryGenerationMachine, {
    input: {
      workNumber: '',
      sources: [],
      destinationLabware: plateOutputSlotCopy?.labware,
      reagentTransfers: [],
      reagentPlateType: '',
      slotMeasurements: undefined
    }
  });

  const [currentReagentTransferMachine, sendReagentTransferMachine] = useMachine(reagentTransferMachine);

  const transferredReagents: OutputSlotCopyData | undefined = React.useMemo(() => {
    if (currentLibraryGeneration.context.reagentTransfers.length === 0) return undefined;
    return {
      labware: currentLibraryGeneration.context.destinationLabware!,
      slotCopyContent: currentLibraryGeneration.context.reagentTransfers.map((rt): SlotCopyContent => {
        return {
          sourceBarcode: rt.reagentPlateBarcode,
          sourceAddress: rt.reagentSlotAddress,
          destinationAddress: rt.destinationAddress
        };
      })
    };
  }, [currentLibraryGeneration.context.reagentTransfers, currentLibraryGeneration.context.destinationLabware]);

  /**
   * For tracking whether the user gets a prompt if they tried to navigate to another page
   */
  const shouldConfirmBeforeLeave = (args: BlockerFunctionParams): boolean => {
    return args && args.historyAction !== 'REPLACE' && currentLibraryGeneration.value !== 'recorded';
  };

  /** Handle 'Clear all' SlotMapper functionality */
  React.useEffect(() => {
    if (
      currentSlotCopyMachine.context.destinations[0] &&
      currentSlotCopyMachine.context.destinations[0].slotCopyDetails.contents.length === 0 &&
      currentLibraryGeneration.context.reagentTransfers.length > 0
    ) {
      sendLibraryGeneration({
        type: 'CLEAR_REAGENT_TRANSFER'
      });
    }
  });

  /** Handle Reagent plate type update */
  React.useEffect(() => {
    if (currentReagentTransferMachine.context.plateType) {
      sendLibraryGeneration({
        type: 'UPDATE_REAGENT_PLATE_TYPE',
        plateType: currentReagentTransferMachine.context.plateType
      });
    }
  }, [currentReagentTransferMachine, sendLibraryGeneration]);

  /** Handles the case when the user deletes one/all the source(s) */
  React.useEffect(() => {
    //when a source is deleting, the sources array is not updated
    if (sources.length < currentLibraryGeneration.context.sources.length) {
      sendLibraryGeneration({
        type: 'REMOVE_TRANSFERRED_REAGENT',
        newSource: sources
      });
    }
  }, [sources, currentLibraryGeneration.context.sources.length, sendLibraryGeneration]);

  const { serverErrors, serverSuccess } = currentLibraryGeneration.context;

  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      sendLibraryGeneration({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [sendLibraryGeneration]
  );

  const handleOnSave = useCallback(
    (slotMeasurement?: SlotMeasurement[]) => {
      sendLibraryGeneration({
        type: 'SAVE',
        slotMeasurements: slotMeasurement?.map((sm) => {
          const { samples, ...rest } = sm;
          return rest;
        })
      });
    },
    [sendLibraryGeneration]
  );

  const onSaveAction = useCallback(
    (slotMeasurement?: SlotMeasurement[]) => {
      /**Get all input laware and it's ancestors that didn't perform a perm operation and are mapped/copied to 96 well plate*/
      const sourceLabwarePermData = currentSlotCopyMachine.context.sourceLabwarePermData;
      const labwareWithoutPermData = sourceLabwarePermData?.filter(
        (permData) => permData.visiumPermData.addressPermData.length !== 0
      );
      if (labwareWithoutPermData && labwareWithoutPermData.length > 0) {
        setLabwaresWithoutPerm(labwareWithoutPermData.map((permData) => permData.visiumPermData.labware));
        setWarnBeforeSave(true);
      } else {
        handleOnSave(slotMeasurement);
      }
    },
    [currentSlotCopyMachine.context, handleOnSave]
  );

  React.useEffect(() => {
    if (serverSuccess) {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true
      });
    }
  });

  const canGoToSampleTransfer = React.useMemo(() => {
    let isValid = destinations[0] && destinations[0].slotCopyDetails.contents.length > 0;
    if (isValid) {
      isValid = sources.map((source) => source.labwareState).every((ls) => ls !== undefined);
    }
    return isValid;
  }, [destinations, sources]);

  const amplificationValidationSchema = Yup.object().shape({
    slotMeasurements: Yup.array()
      .of(
        Yup.object().shape({
          address: Yup.string().required(),
          name: Yup.string().required(),
          value: Yup.string().required('Positive value required')
        })
      )
      .notRequired()
  });

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Library Amplification and Generation </AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <div className="mb-8">
            {serverErrors !== undefined && (
              <div ref={warningRef}>
                <Warning message={serverErrors.message ?? 'The request could not be validated'}>
                  <ul className="list-disc list-inside">
                    {serverErrors.problems.map((problem, index) => {
                      return <li key={index}>{problem}</li>;
                    })}
                  </ul>
                </Warning>
              </div>
            )}
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">SGP number to associate with these operations</p>
            <div className="my-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>

            {currentLibraryGeneration.matches('sampleTransfer') && (
              <>
                <SlotCopyComponent
                  title={'Sample Transfer'}
                  initialOutputLabware={[
                    currentLibraryGeneration.context.destinationLabware as NewFlaggedLabwareLayout
                  ]}
                  initialOutputSlotCopy={[
                    {
                      labware: currentLibraryGeneration.context.destinationLabware as LabwareFlaggedFieldsFragment,
                      slotCopyDetails: currentLibraryGeneration.context.destination!
                    }
                  ]}
                  current={currentSlotCopyMachine}
                  send={sendSlotCopyMachine}
                  slotCopyModes={[SlotCopyMode.ONE_TO_ONE]}
                  addPlateOption={false}
                  labwareDestinationSelectionMode={currentSlotCopyMachine.context.destinationSelectionMode}
                />

                <ButtonBar>
                  <Link to="">
                    <PinkButton
                      disabled={!canGoToSampleTransfer}
                      action="primary"
                      onClick={() =>
                        sendLibraryGeneration({
                          type: 'GO_TO_REAGENT_TRANSFER',
                          sources,
                          slotCopyDetails: destinations[0].slotCopyDetails,
                          destinationLabware: destinations[0].labware,
                          cleanedOutAddresses: destinations[0].cleanedOutAddresses
                        })
                      }
                    >
                      Reagent Transfer {'>'}
                    </PinkButton>
                  </Link>
                </ButtonBar>
              </>
            )}
            {currentLibraryGeneration.matches('reagentTransfer') && (
              <>
                <DualIndexPlateComponent
                  send={sendReagentTransferMachine}
                  current={currentReagentTransferMachine}
                  destinationLabware={
                    currentLibraryGeneration.context.destinationLabware as LabwareFlaggedFieldsFragment
                  }
                  outputSlotCopies={transferredReagents ? [transferredReagents] : undefined}
                  destinationCleanedOutAddresses={currentLibraryGeneration.context.cleanedOutAddresses}
                />
                <ButtonBar className="flex flex-row justify-between">
                  <PinkButton
                    action="primary"
                    onClick={() =>
                      sendLibraryGeneration({
                        type: 'GO_TO_SAMPLE_TRANSFER',
                        reagentTransfers: currentReagentTransferMachine.context.reagentTransfers,
                        sourceReagentPlate: currentReagentTransferMachine.context.sourceReagentPlate,
                        reagentPlateType: currentReagentTransferMachine.context.plateType
                      })
                    }
                  >
                    {'<'} Sample Transfer
                  </PinkButton>
                  <PinkButton
                    disabled={
                      !currentLibraryGeneration.context.reagentPlateType ||
                      currentReagentTransferMachine.context.reagentTransfers.length === 0
                    }
                    action="primary"
                    onClick={() =>
                      sendLibraryGeneration({
                        type: 'GO_TO_AMPLIFICATION',
                        reagentTransfers: currentReagentTransferMachine.context.reagentTransfers,
                        sourceReagentPlate: currentReagentTransferMachine.context.sourceReagentPlate,
                        reagentPlateType: currentReagentTransferMachine.context.plateType
                      })
                    }
                  >
                    Record Cycle {'>'}
                  </PinkButton>
                </ButtonBar>
              </>
            )}
            {(currentLibraryGeneration.matches('amplification') ||
              currentLibraryGeneration.matches('readyToRecord') ||
              currentLibraryGeneration.matches('recording') ||
              currentLibraryGeneration.matches('recorded')) && (
              <>
                <Formik<{ slotMeasurements: Array<SlotMeasurement> | undefined }>
                  initialValues={{
                    slotMeasurements: currentLibraryGeneration.context.slotMeasurements
                  }}
                  onSubmit={() => {}}
                  validationSchema={amplificationValidationSchema}
                >
                  {({ values, isValid }) => {
                    return (
                      <>
                        <Amplification
                          slotMeasurements={currentLibraryGeneration.context.slotMeasurements}
                          labware={currentLibraryGeneration.context.destinationLabware as LabwareFlaggedFieldsFragment}
                          className={'mx-auto'}
                          slotCopyContent={currentLibraryGeneration.context.destination!.contents}
                          cleanedOutAddress={currentLibraryGeneration.context.cleanedOutAddresses}
                        />

                        <ButtonBar className="flex flex-row justify-between">
                          <PinkButton
                            action="primary"
                            disabled={currentLibraryGeneration.value === 'recorded'}
                            onClick={() =>
                              sendLibraryGeneration({
                                type: 'GO_TO_REAGENT_TRANSFER',
                                slotMeasurements: values.slotMeasurements
                              })
                            }
                          >
                            {'< '} Reagent Transfer
                          </PinkButton>
                          {!currentLibraryGeneration.matches('recorded') && (
                            <BlueButton
                              disabled={
                                !isValid ||
                                currentLibraryGeneration.context.workNumber.length === 0 ||
                                serverErrors !== undefined ||
                                values.slotMeasurements?.length === 0
                              }
                              onClick={() => onSaveAction(values.slotMeasurements)}
                            >
                              Save
                            </BlueButton>
                          )}
                          {currentLibraryGeneration.matches('recorded') && (
                            <div>
                              <BlueButton onClick={() => reload(navigate)} action="tertiary">
                                Reset Form
                              </BlueButton>
                              <Link to={'/'}>
                                <BlueButton action="primary">Return Home</BlueButton>
                              </Link>
                            </div>
                          )}
                        </ButtonBar>

                        <LabwareWithoutPermConfirmationModal
                          show={warnBeforeSave}
                          labwaresWithoutPerm={labwaresWithoutPerm}
                          onSave={() => handleOnSave(values.slotMeasurements)}
                          setWarnBeforeSave={setWarnBeforeSave}
                        />
                      </>
                    );
                  }}
                </Formik>
              </>
            )}
            {serverSuccess && (
              <div className="mt-8 flex flex-col items-end sm:justify-end space-y-2">
                <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow-md space-y-2">
                  <LabelPrinter labwares={serverSuccess.libraryPrep.labware} />
                </div>
                <div className="sm:max-w-xl w-full  border-gray-200 p-4 rounded-md bg-gray-100 shadow-md space-y-2 ">
                  <div className={'flex items-center space-x-2'}>
                    <div className={'font-bold'}>Labels:</div>
                    <div>{serverSuccess.libraryPrep.labware.map((lw) => lw.barcode).join(',')}</div>
                  </div>
                  <div className={'flex items-end sm:justify-end'}>
                    <LabelCopyButton
                      labels={serverSuccess.libraryPrep.labware.map((lw) => lw.barcode)}
                      copyButtonText={'Copy Labels'}
                      buttonClass={
                        'text-white bg-sdb-400 shadow-xs hover:bg-sdb focus:border-sdb focus:shadow-outline-sdb active:bg-sdb-600'
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            <PromptOnLeave
              when={shouldConfirmBeforeLeave}
              message={'You have unsaved changes. Are you sure you want to leave?'}
              onPromptLeave={() => {}}
            />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
