import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Labware, { LabwareImperativeRef } from '../labware/Labware';
import Pager from '../pagination/Pager';
import { OutputSlotCopyData, SlotCopyMode, SlotMapperProps } from './slotMapper.types';
import { usePrevious } from '../../lib/hooks';
import WhiteButton from '../buttons/WhiteButton';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import RemoveButton from '../buttons/RemoveButton';
import { LabwareFlaggedFieldsFragment, Maybe, SlotFieldsFragment, SlotPassFailFieldsFragment } from '../../types/sdk';
import SlotMapperTable from './SlotMapperTable';
import Heading from '../Heading';
import MutedText from '../MutedText';
import { usePager } from '../../lib/hooks/usePager';
import { useMachine } from '@xstate/react';
import { find } from 'lodash';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import Warning from '../notifications/Warning';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import createSlotMapperMachine from './slotMapper.machine';
import PinkButton from '../buttons/PinkButton';
import RadioGroup, { RadioButtonInput } from '../forms/RadioGroup';
import { isSlotFilled } from '../../lib/helpers/slotHelper';

type LabwareType = {
  labwareType?: string;
};

type ExtendedSlotMapperProps = SlotMapperProps & LabwareType;

const SlotMapper: React.FC<ExtendedSlotMapperProps> = ({
  onChange,
  onInputLabwareChange,
  onOutputLabwareChange,
  initialInputLabware = [],
  initialOutputLabware = [],
  locked = false,
  inputLabwareLimit,
  failedSlotsCheck = true,
  disabledOutputSlotAddresses = [],
  slotCopyModes,
  inputLabwareConfigPanel,
  outputLabwareConfigPanel,
  onSelectInputLabware,
  onSelectOutputLabware,
  displayMappedTable = true,
  labwareType = undefined
}) => {
  const memoSlotMapperMachine = React.useMemo(() => {
    return createSlotMapperMachine({
      inputLabware: initialInputLabware,
      outputSlotCopies: initialOutputLabware,
      failedSlotsCheck
    });
  }, [initialOutputLabware, failedSlotsCheck, initialInputLabware]);

  const [current, send] = useMachine(memoSlotMapperMachine);

  const { inputLabware, outputSlotCopies, colorByBarcode, failedSlots, errors } = current.context;

  /**
   * State to track the current input labware (for paging)
   */
  const [currentInputLabware, setCurrentInputLabware] = useState<Maybe<LabwareFlaggedFieldsFragment>>(() => {
    return initialInputLabware?.length === 0 ? null : initialInputLabware[0];
  });

  /**
   * State to track the current output labware
   */
  const [currentOutput, setCurrentOutput] = useState<Maybe<OutputSlotCopyData>>(() => {
    return initialOutputLabware?.length === 0 ? null : initialOutputLabware[0];
  });

  /**
   * State to track the currently selected input and output addresses
   */
  const [selectedInputAddresses, setSelectedInputAddresses] = useState<Array<string>>([]);
  const [selectedOutputAddresses, setSelectedOutputAddresses] = useState<Array<string>>([]);

  /**
   * State to track the failed ones in selected input slots
   */
  const [failedSelectSlots, setFailedSelectSlots] = useState<SlotPassFailFieldsFragment[]>([]);

  /**
   * State to keep the output address clicked to transfer from input
   */
  const [destinationAddress, setDestinationAddress] = useState<string | undefined>();

  const [selectedCopyMode, setSelectedCopyMode] = useState<SlotCopyMode>(SlotCopyMode.ONE_TO_ONE);
  const [oneToManyCopyInProgress, setOneToManyCopyInProgress] = useState(false);

  /**
   * Hook for tracking state for Pager component for input
   */
  const {
    currentPage: currentInputPage,
    numberOfPages: numberOfInputPages,
    setNumberOfPages: setNumberOfInputPages,
    setCurrentPage: setCurrentInputPage,
    goToLastPage: goToLastInputPage,
    ...pagerRestInput
  } = usePager({
    initialCurrentPage: 1,
    initialNumberOfPages: inputLabware.length
  });

  /**
   * Hook for tracking state for Pager component for output
   */
  const {
    currentPage: currentOutputPage,
    numberOfPages: numberOfOutputPages,
    setNumberOfPages: setNumberOfOutputPages,
    setCurrentPage: setCurrentOutputPage,
    goToLastPage: goToLastOutputPage,
    ...pageRestOutput
  } = usePager({
    initialCurrentPage: 1,
    initialNumberOfPages: outputSlotCopies.length
  });

  /**Memoise whether any source is mapped**/
  const anySourceMapped = useMemo(() => {
    if (inputLabware.length === 0) {
      return false;
    }
    if (!currentOutput) {
      return false;
    }
    return currentOutput.slotCopyContent.length > 0;
  }, [currentOutput, inputLabware]);

  /**Address of all slots copied between current selected source and destination labware
   * other than currently selected one (these will displayed as disabled)
   */
  const memoInputAddressesDisabled = React.useMemo(() => {
    if (!currentOutput || !currentInputLabware) return [];
    const outputSlotCopiesFromNotSelected = outputSlotCopies.filter(
      (osc) => osc.labware.id !== currentOutput.labware.id
    );
    const slots = outputSlotCopiesFromNotSelected
      .flatMap((item) => item.slotCopyContent)
      .filter((scc) => scc.sourceBarcode === currentInputLabware.barcode);
    return slots.map((slot) => slot.sourceAddress);
  }, [currentOutput, currentInputLabware, outputSlotCopies]);

  /**
   * Whenever the given output labware props changes, check whether that labware is already in
   * the context of this component (outputSlotCopies). If not, update it.
   * Here we need to check only for any additions in output labware happened externally, as we are handling the removal of
   * output labware within this.
   * This check is very important because it can result in recursive calls between parent and this component.
   */
  useEffect(() => {
    if (!currentOutput && initialOutputLabware?.length === 0) return;
    if (initialOutputLabware?.length === 0) {
      setCurrentOutput(null);
      send({ type: 'UPDATE_OUTPUT_LABWARE', outputSlotCopyContent: [] });
      return;
    }
    const matchingLabware = initialOutputLabware?.find((outputLw) => outputLw.labware.id === currentOutput?.labware.id);
    //Update changes in barcode , if any
    if (matchingLabware && matchingLabware.labware.barcode !== currentOutput?.labware.barcode) {
      setCurrentOutput((prev) => {
        if (prev && prev.labware.barcode !== matchingLabware.labware.barcode) {
          return {
            ...prev,
            labware: {
              ...prev.labware,
              barcode: matchingLabware.labware.barcode
            }
          };
        } else return prev;
      });
    }
    if (initialOutputLabware.some((lw) => !outputSlotCopies.map((osc) => osc.labware.id).includes(lw.labware.id))) {
      send({ type: 'UPDATE_OUTPUT_LABWARE', outputSlotCopyContent: initialOutputLabware });
    }
  }, [initialOutputLabware, outputSlotCopies, send, currentOutput]);

  const getSourceSlotColor = useCallback(
    (labware: LabwareFlaggedFieldsFragment, address: string, slot: SlotFieldsFragment) => {
      if (!currentOutput) {
        return 'bg-white';
      }
      if (selectedCopyMode === SlotCopyMode.ONE_TO_MANY) {
        if (oneToManyCopyInProgress && selectedInputAddresses[0] === address) {
          return `bg-${colorByBarcode.get(labware.barcode)}-500 ring ring-pink-600 ring-offset-2`;
        }
      }
      //Slots copied between current selected source and destination labware
      if (
        find(currentOutput.slotCopyContent, {
          sourceBarcode: labware.barcode,
          sourceAddress: address
        })
      ) {
        return `bg-${colorByBarcode.get(labware.barcode)}-200 ${
          selectedInputAddresses.includes(address) ? 'ring ring-blue-600 ring-offset-2' : ''
        }`;
      }

      //This input slot address has got mapping to a different output labware
      if (memoInputAddressesDisabled.includes(address)) {
        return `bg-gray-300 ring-0 ring-offset-0 text-white border-0 border-gray-300`;
      }
      if (slot?.samples?.length) {
        return `bg-${colorByBarcode.get(labware.barcode)}-500`;
      }
    },
    [
      currentOutput,
      colorByBarcode,
      memoInputAddressesDisabled,
      selectedCopyMode,
      selectedInputAddresses,
      oneToManyCopyInProgress
    ]
  );

  const getDestinationSlotColor = useCallback(
    (outputSlotCopyData: OutputSlotCopyData, address: string) => {
      if (currentOutput?.labware.barcode) {
        const slot = currentOutput.labware.slots.find((s) => s.address === address);
        if (slot && isSlotFilled(slot)) {
          return 'bg-gray-300 ring-0 ring-offset-0 text-gray-300 border-0 border-gray-300';
        }
      }
      //Is this slot specified as disabled in props given?
      if (disabledOutputSlotAddresses?.includes(address)) {
        return 'bg-gray-300 ring-0 ring-offset-0 text-gray-300 border-0 border-gray-300';
      }
      const scc = find(outputSlotCopyData.slotCopyContent, {
        destinationAddress: address
      });

      if (scc) {
        if (
          currentInputLabware &&
          currentInputLabware.barcode === scc.sourceBarcode &&
          selectedInputAddresses.includes(scc.sourceAddress) &&
          !oneToManyCopyInProgress
        ) {
          return `bg-${colorByBarcode.get(scc.sourceBarcode)}-500 ring ring-blue-600 ring-offset-2`;
        }
        return `bg-${colorByBarcode.get(scc.sourceBarcode)}-500`;
      }
    },
    [
      colorByBarcode,
      disabledOutputSlotAddresses,
      oneToManyCopyInProgress,
      selectedInputAddresses,
      currentInputLabware,
      currentOutput?.labware
    ]
  );

  /**
   * Whenever the number of input labwares changes, set the number of pages on the pager
   */
  useEffect(() => {
    setNumberOfInputPages(inputLabware.length);
  }, [inputLabware, setNumberOfInputPages]);

  /**
   * Whenever the number of input labwares increases, go to the last page
   */
  const previousInputLength = usePrevious(inputLabware.length);
  useEffect(() => {
    if (previousInputLength && inputLabware.length > previousInputLength) {
      goToLastInputPage();
    }
  }, [inputLabware.length, goToLastInputPage, previousInputLength]);

  /**
   * Whenever the current page changes, set the current input labware and also
   * notify parent using callback function
   */
  useEffect(() => {
    if (inputLabware.length === 0 || currentInputPage <= 0 || inputLabware.length <= currentInputPage - 1) return;
    setCurrentInputLabware(inputLabware[currentInputPage - 1]);
    //Notify parent using callback
    onSelectInputLabware?.(inputLabware[currentInputPage - 1]);
  }, [currentInputPage, inputLabware, onSelectInputLabware, setCurrentInputLabware]);

  /**
   * Whenever the number of input labwares changes, set the number of pages on the pager
   */
  const numberOfOutputLabware = outputSlotCopies.length;
  useEffect(() => {
    setNumberOfOutputPages(numberOfOutputLabware);
  }, [numberOfOutputLabware, setNumberOfOutputPages]);

  /**
   * Whenever the number of input labwares increases, go to the last page
   */
  const previousOutputLength = usePrevious(outputSlotCopies.length);
  useEffect(() => {
    if (previousOutputLength && outputSlotCopies.length > previousOutputLength) {
      goToLastOutputPage();
    }
  }, [outputSlotCopies.length, goToLastOutputPage, previousOutputLength]);

  /**
   * Whenever the current page changes, set the current input labware
   * and also notify parent using callback function
   */
  useEffect(() => {
    if (outputSlotCopies.length === 0 || currentOutputPage <= 0 || outputSlotCopies.length <= currentOutputPage - 1)
      return;
    setCurrentOutput(outputSlotCopies[currentOutputPage - 1]);
    //Notify parent using callback
    onSelectOutputLabware?.(outputSlotCopies[currentOutputPage - 1].labware);
  }, [currentOutputPage, outputSlotCopies, onSelectOutputLabware, setCurrentOutput]);

  /**
   * When the current input labware changes, unset the selected input addresses
   */
  useEffect(() => {
    setSelectedInputAddresses([]);
  }, [currentInputLabware]);

  /**
   * If `locked` changes, tell the model
   */
  useEffect(() => {
    locked ? send({ type: 'LOCK' }) : send({ type: 'UNLOCK' });
  }, [locked, send]);

  /**
   * These refs are passed into the Labware components so we can imperatively
   * change their state e.g. deselecting all slots
   */
  const inputLabwareRef = useRef<LabwareImperativeRef>(null);
  const outputLabwareRef = useRef<LabwareImperativeRef>(null);

  /**
   * Callback for sending the actual copy slots event
   */
  const handleCopySlots = React.useCallback(
    (givenDestinationAddress?: string) => {
      setFailedSelectSlots([]);
      const address = destinationAddress ? destinationAddress : givenDestinationAddress;
      if (currentInputLabware?.id && currentOutput?.labware?.id && address) {
        send({
          type: 'COPY_ONE_TO_ONE_SLOTS',
          inputLabwareId: currentInputLabware?.id,
          inputAddresses: selectedInputAddresses,
          outputLabwareId: currentOutput?.labware?.id,
          outputAddress: address
        });
      }
      setDestinationAddress(undefined);
    },
    [currentInputLabware, currentOutput, destinationAddress, selectedInputAddresses, send]
  );
  /**
   * Handle one to one copy action
   */
  const handleOneToOneCopy = React.useCallback(
    (outputAddress: string) => {
      if (disabledOutputSlotAddresses?.includes(outputAddress)) return;
      setDestinationAddress(outputAddress);
      //Check whether it is a scanned labware, if so allow copting to empty slots
      if (currentOutput?.labware?.barcode) {
        const slot = currentOutput?.labware?.slots.find((slot) => slot.address === outputAddress);
        if (slot && isSlotFilled(slot)) {
          return;
        }
      }
      //Check whether any selected input slots are failed in QC
      if (currentInputLabware) {
        const slotFails = failedSlots.get(currentInputLabware.barcode);
        if (slotFails) {
          const failedSelectSlots = slotFails.filter(
            (slot) => selectedInputAddresses.findIndex((address) => address === slot.address) !== -1
          );
          setFailedSelectSlots(failedSelectSlots);
          if (failedSelectSlots.length === 0) {
            handleCopySlots(outputAddress);
            return;
          }
        } else {
          handleCopySlots(outputAddress);
          return;
        }
      }
    },
    [
      currentInputLabware,
      handleCopySlots,
      failedSlots,
      selectedInputAddresses,
      disabledOutputSlotAddresses,
      currentOutput?.labware
    ]
  );

  const handleOneToManyCopy = React.useCallback(
    (outputAddress: string) => {
      if (disabledOutputSlotAddresses?.includes(outputAddress)) return;
      if (!oneToManyCopyInProgress) return;
      setDestinationAddress(outputAddress);
      setFailedSelectSlots([]);
      const address = destinationAddress ? destinationAddress : outputAddress;
      if (currentInputLabware?.id && currentOutput?.labware?.id && address) {
        send({
          type: 'COPY_ONE_TO_MANY_SLOTS',
          inputLabwareId: currentInputLabware?.id,
          inputAddress: selectedInputAddresses[0],
          outputLabwareId: currentOutput?.labware?.id,
          outputAddress: address
        });
      }
      setDestinationAddress(undefined);
      return;
    },
    [
      setDestinationAddress,
      destinationAddress,
      oneToManyCopyInProgress,
      send,
      currentInputLabware,
      currentOutput,
      disabledOutputSlotAddresses,
      selectedInputAddresses
    ]
  );

  const handleManyToOneCopy = React.useCallback(
    (outputAddress: string) => {
      if (disabledOutputSlotAddresses?.includes(outputAddress)) return;
      setDestinationAddress(outputAddress);
      setFailedSelectSlots([]);
      const address = destinationAddress ? destinationAddress : outputAddress;
      if (currentInputLabware?.id && currentOutput?.labware?.id && address) {
        send({
          type: 'COPY_MANY_TO_ONE_SLOTS',
          inputLabwareId: currentInputLabware?.id,
          inputAddresses: selectedInputAddresses,
          outputLabwareId: currentOutput?.labware?.id,
          outputAddress: address
        });
      }
      setDestinationAddress(undefined);
      return;
    },
    [
      setDestinationAddress,
      destinationAddress,
      send,
      currentInputLabware,
      currentOutput,
      disabledOutputSlotAddresses,
      selectedInputAddresses
    ]
  );

  /**
   * Callback to handle click on destination address for tranferring slots
   */
  const handleOnOutputLabwareSlotClick = React.useCallback(
    (outputAddress: string) => {
      switch (selectedCopyMode) {
        case SlotCopyMode.ONE_TO_ONE:
          handleOneToOneCopy(outputAddress);
          break;
        case SlotCopyMode.ONE_TO_MANY:
          handleOneToManyCopy(outputAddress);
          break;
        case SlotCopyMode.MANY_TO_ONE:
          handleManyToOneCopy(outputAddress);
          break;
      }
    },
    [handleOneToOneCopy, handleManyToOneCopy, handleOneToManyCopy, selectedCopyMode]
  );

  /**
   * Callback to handle click on source address for tranferring slots
   */
  const handleOnInputLabwareSlotClick = React.useCallback(
    (inputAddress: string[]) => {
      if (selectedCopyMode === SlotCopyMode.ONE_TO_MANY) {
        if (oneToManyCopyInProgress) {
          return;
        }
        if (inputAddress.length === 0) {
          setSelectedInputAddresses([]);
          return;
        }
        /**If the selected slot address is not already mapped, signal the start of that multiple transfers
         *in one to many mapping process by setting oneToManyCopyInProgress to true**/
        if (
          !find(currentOutput?.slotCopyContent, {
            sourceBarcode: currentInputLabware?.barcode,
            sourceAddress: inputAddress[0]
          })
        )
          setOneToManyCopyInProgress(true);
      }
      setSelectedInputAddresses(inputAddress.filter((address) => !memoInputAddressesDisabled.includes(address)));
    },
    [
      setSelectedInputAddresses,
      memoInputAddressesDisabled,
      setOneToManyCopyInProgress,
      selectedCopyMode,
      currentInputLabware?.barcode,
      currentOutput?.slotCopyContent,
      oneToManyCopyInProgress
    ]
  );

  /**
   * Handler for the "Clear" button to clear the mapping in selected slot
   */
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutput?.labware?.id) {
      send({
        type: 'CLEAR_SLOTS',
        outputLabwareId: currentOutput?.labware?.id,
        outputAddresses: selectedOutputAddresses
      });
      outputLabwareRef.current?.deselectAll();
    }
  }, [send, currentOutput, selectedOutputAddresses, outputLabwareRef]);

  /**
   * Handler for the "Clear all" button to clear all mappings between selected source and selected destination
   */
  const handleOnClickClearAll = React.useCallback(() => {
    if (currentOutput?.labware?.id && currentInputLabware?.barcode) {
      send({
        type: 'CLEAR_ALL_SLOT_MAPPINGS_BETWEEN',
        outputLabwareId: currentOutput?.labware?.id,
        inputLabwareBarcode: currentInputLabware?.barcode
      });
      outputLabwareRef.current?.deselectAll();
    }
  }, [send, currentOutput, currentInputLabware, outputLabwareRef]);

  /**
   * Whenever the SlotCopyContent map changes, or the current input labware changes,
   * deselect any selected input slots
   */
  useEffect(() => {
    inputLabwareRef.current?.deselectAll();
  }, [currentOutput?.slotCopyContent, currentInputLabware]);

  /**
   * Whenever the SlotCopyContent map changes, or the current output labware changes,
   * deselect any selected output slots
   */
  useEffect(() => {
    outputLabwareRef.current?.deselectAll();
  }, [currentOutput?.slotCopyContent, currentInputLabware]);

  /**
   * Whenever the SlotCopyContent map changes, call the onChange handler
   */
  useEffect(() => {
    if (!currentOutput?.slotCopyContent) return;
    onChange?.(currentOutput.labware, currentOutput?.slotCopyContent, anySourceMapped);
  }, [onChange, currentOutput, anySourceMapped]);

  /**
   * Callback whenever the input labware is added or removed by the labware scanner
   */
  const onLabwareScannerChange = React.useCallback(
    (labware: LabwareFlaggedFieldsFragment[]) => {
      send({ type: 'UPDATE_INPUT_LABWARE', labware });
      onInputLabwareChange?.(labware);
    },
    [send, onInputLabwareChange]
  );

  /**
   * Callback whenever the output labware is removed
   */
  const onRemoveOutputLabware = React.useCallback(() => {
    const outputs = outputSlotCopies.filter((osc) => osc.labware.id !== currentOutput?.labware.id);
    send({
      type: 'UPDATE_OUTPUT_LABWARE',
      outputSlotCopyContent: outputs
    });
    onOutputLabwareChange?.(outputs.map((o) => o.labware));
  }, [send, onOutputLabwareChange, currentOutput, outputSlotCopies]);

  const selectedInputSlots = currentInputLabware
    ? currentInputLabware.slots.filter(
        (slot) => selectedInputAddresses.findIndex((selectedAddress) => selectedAddress === slot.address) !== -1
      )
    : [];

  const slotsMappedForCurrentInput = currentOutput?.slotCopyContent.some((slotCopy) => {
    return slotCopy.sourceBarcode === currentInputLabware?.barcode;
  });
  /**
   * Callback when the copy mode changes
   */
  const handleCopyModeChange = React.useCallback(
    (mode: SlotCopyMode) => {
      setSelectedCopyMode(mode);
      setOneToManyCopyInProgress(false);
    },
    [setSelectedCopyMode, setOneToManyCopyInProgress]
  );

  /**
   * Callback function when finish transfer is called
   */

  const onFinishTransferButtonClick = React.useCallback(() => {
    setOneToManyCopyInProgress(false);
    setSelectedInputAddresses([]);
    setSelectedOutputAddresses([]);
  }, [setOneToManyCopyInProgress, setSelectedOutputAddresses, setSelectedInputAddresses]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 auto-rows-auto">
        <Heading level={4}>Input Labware</Heading>

        <Heading level={4}>Output Labware</Heading>
        {slotCopyModes && (
          <>
            <div className="flex flex-row p-4 space-x-4">
              <RadioGroup label="Select transfer mode" name={'sectionNumber'} withFormik={false}>
                {slotCopyModes.map((mode) => (
                  <RadioButtonInput
                    key={mode}
                    data-testid={`copyMode-${mode}`}
                    name={'copyMode'}
                    value={mode}
                    checked={selectedCopyMode === mode}
                    onChange={() => handleCopyModeChange(mode)}
                    label={mode}
                  />
                ))}
              </RadioGroup>
            </div>
            <div className={'flex flex-row w-full my-2 '}>
              <div className={'flex flex-col my-2 text-gray-700 text-xs italic'}>
                <p>For selection of multiple slots :</p>
                <p>Hold 'Shift' key to select consecutive items</p>
                <p>Hold 'Ctrl' (Cmd for Mac) key to select non-consecutive items</p>
              </div>
            </div>
          </>
        )}

        <div id="inputLabwares" className="bg-gray-100 p-4">
          <LabwareScanner
            initialLabwares={inputLabware}
            onChange={onLabwareScannerChange}
            limit={inputLabwareLimit}
            enableFlaggedLabwareCheck
          >
            {(props) => {
              if (!currentInputLabware) {
                return <MutedText>Add labware using the scan input above</MutedText>;
              }
              return (
                <>
                  <div className="flex mb-8">{inputLabwareConfigPanel}</div>
                  {!locked && inputLabware.length > 0 && (
                    <div className="flex flex-row justify-end">
                      <RemoveButton
                        onClick={() => {
                          props.removeLabware(currentInputLabware.barcode);
                          onInputLabwareChange?.(inputLabware);
                        }}
                      />
                    </div>
                  )}
                  {inputLabware.length > 0 && (
                    <div className="flex flex-col items-center justify-center" data-testid={'input-labware-div'}>
                      <Labware
                        labware={currentInputLabware}
                        selectable={oneToManyCopyInProgress ? 'none' : 'non_empty'}
                        selectionMode={selectedCopyMode !== SlotCopyMode.ONE_TO_MANY ? 'multi' : 'single'}
                        labwareRef={inputLabwareRef}
                        slotColor={(address, slot) => {
                          return getSourceSlotColor(currentInputLabware, address, slot);
                        }}
                        name={currentInputLabware.labwareType.name}
                        onSelect={handleOnInputLabwareSlotClick}
                      />
                    </div>
                  )}
                </>
              );
            }}
          </LabwareScanner>
          {}
        </div>
        <div id="outputLabwares" className="p-4 flex flex-col  bg-gray-100 border-l-2">
          <div className="flex mb-8">{outputLabwareConfigPanel}</div>
          {initialOutputLabware?.length > 1 && (
            <div className="flex flex-row justify-end">
              <RemoveButton
                onClick={() => {
                  onRemoveOutputLabware();
                }}
              />
            </div>
          )}
          <div className={'flex items-center justify-center'}>
            {initialOutputLabware?.length > 0 && currentOutput?.labware && (
              <div className="flex flex-col space-y-2">
                <div className="flex justify-end">
                  {oneToManyCopyInProgress && (
                    <div className={'flex flex-col items-end'}>
                      <PinkButton
                        onClick={onFinishTransferButtonClick}
                      >{`Finish mapping for ${selectedInputAddresses[0]}`}</PinkButton>
                      <MutedText>Press when you finish</MutedText>
                    </div>
                  )}
                </div>
                {(labwareType === undefined || labwareType.length > 0) && (
                  <Labware
                    labware={currentOutput.labware}
                    selectable="any"
                    selectionMode="multi"
                    labwareRef={outputLabwareRef}
                    name={currentOutput?.labware.labwareType.name}
                    onSlotClick={handleOnOutputLabwareSlotClick}
                    onSelect={setSelectedOutputAddresses}
                    slotColor={(address) => getDestinationSlotColor(currentOutput, address)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-between bg-gray-200">
          {inputLabware.length > 0 && (
            <Pager currentPage={currentInputPage} numberOfPages={numberOfInputPages} {...pagerRestInput} />
          )}
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-between bg-gray-200">
          <div>
            {outputSlotCopies.length > 0 && (
              <Pager currentPage={currentOutputPage} numberOfPages={numberOfOutputPages} {...pageRestOutput} />
            )}
          </div>
          <div className="border-gray-300 flex-row items-center justify-end bg-gray-200">
            {!locked && (
              <div className={'flex flex-row space-x-4 justify-end'}>
                <WhiteButton onClick={handleOnClickClear}>Clear</WhiteButton>
                <WhiteButton data-testid={'clearAll'} onClick={handleOnClickClearAll}>
                  Clear all
                </WhiteButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentInputLabware &&
        (selectedInputSlots.length > 0 || (currentOutput && slotsMappedForCurrentInput && displayMappedTable)) && (
          <div className="space-y-4" data-testid={'mapping-div'}>
            <Heading level={4}>
              {selectedInputSlots.length > 0
                ? `Slot mapping for slot(s) ${selectedInputAddresses.join(',')}`
                : `Slot mapping for ${currentInputLabware.barcode}`}
            </Heading>
            <SlotMapperTable
              labware={currentInputLabware}
              slots={selectedInputSlots}
              slotCopyContent={currentOutput?.slotCopyContent ?? []}
            />
          </div>
        )}
      <ConfirmationModal
        show={failedSelectSlots.length > 0}
        header={'Slot transfer'}
        message={{ type: 'Warning', text: 'Failed slot(s)' }}
        confirmOptions={[
          {
            label: 'Cancel',
            action: () => {
              setFailedSelectSlots([]);
            }
          },
          { label: 'Continue', action: handleCopySlots }
        ]}
      >
        <p className={'font-bold mt-8'}>{`Following slot(s) failed in slide processing : `}</p>
        <Table className={'mt-4 w-full'}>
          <TableHead>
            <tr>
              <TableHeader>Address</TableHeader>
              <TableHeader>Comment</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {failedSelectSlots.map((slot) => (
              <tr key={slot.address}>
                <TableCell>{slot.address}</TableCell>
                <TableCell>{slot.comment}</TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>

        <p className={'mt-6 font-bold'}>Do you wish to continue or cancel?</p>
      </ConfirmationModal>

      <div className={'flex flex-col w-full'}>
        {errors.size > 0 && (
          <Warning
            message={`There is an error while fetching pass/fail status for the slots in ${currentInputLabware?.barcode}.`}
          />
        )}
      </div>
    </div>
  );
};

export default SlotMapper;
