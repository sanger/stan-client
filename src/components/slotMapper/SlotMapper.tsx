import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Labware, { LabwareImperativeRef } from '../labware/Labware';
import Pager from '../pagination/Pager';
import { SlotMapperProps } from './slotMapper.types';
import { usePrevious } from '../../lib/hooks';
import WhiteButton from '../buttons/WhiteButton';
import LabwareScanner from '../labwareScanner/LabwareScanner';
import RemoveButton from '../buttons/RemoveButton';
import { LabwareFieldsFragment, Maybe, SlotFieldsFragment, SlotPassFailFieldsFragment } from '../../types/sdk';
import SlotMapperTable from './SlotMapperTable';
import Heading from '../Heading';
import MutedText from '../MutedText';
import { usePager } from '../../lib/hooks/usePager';
import { NewLabwareLayout } from '../../types/stan';
import { useMachine } from '@xstate/react';
import { find } from 'lodash';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import Warning from '../notifications/Warning';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import createSlotMapperMachine from './slotMapper.machine';

const SlotMapper: React.FC<SlotMapperProps> = ({
  onChange,
  onInputLabwareChange,
  initialInputLabware = [],
  initialOutputLabware = [],
  locked = false,
  inputLabwareLimit,
  failedSlotsCheck = true,
  children,
  disabledOutputSlotAddresses = []
}) => {
  const memoSlotMapperMachine = React.useMemo(() => {
    return createSlotMapperMachine({
      inputLabware: initialInputLabware,
      outputLabware: initialOutputLabware,
      failedSlotsCheck
    });
  }, [initialInputLabware, initialOutputLabware, failedSlotsCheck]);

  const [current, send] = useMachine(() => memoSlotMapperMachine);

  const { inputLabware, slotCopyContent, colorByBarcode, failedSlots, errors } = current.context;

  const anySourceMapped = useMemo(() => {
    if (inputLabware.length === 0) {
      return false;
    }
    return slotCopyContent.length > 0;
  }, [inputLabware, slotCopyContent]);

  useEffect(() => {
    if (!onInputLabwareChange) return;
    onInputLabwareChange(inputLabware);
  }, [onInputLabwareChange, inputLabware]);

  const getSourceSlotColor = useCallback(
    (labware: LabwareFieldsFragment, address: string, slot: SlotFieldsFragment) => {
      if (
        find(slotCopyContent, {
          sourceBarcode: labware.barcode,
          sourceAddress: address
        })
      ) {
        return `bg-${colorByBarcode.get(labware.barcode)}-200`;
      }

      if (slot?.samples?.length) {
        return `bg-${colorByBarcode.get(labware.barcode)}-500`;
      }
    },
    [slotCopyContent, colorByBarcode]
  );

  const getDestinationSlotColor = useCallback(
    (labware: NewLabwareLayout, address: string) => {
      if (disabledOutputSlotAddresses?.includes(address)) {
        return 'bg-gray-300 ring-0 ring-offset-0 text-gray-300 border-0 border-gray-300';
      }
      const scc = find(slotCopyContent, {
        destinationAddress: address
      });

      if (scc) {
        return `bg-${colorByBarcode.get(scc.sourceBarcode)}-500`;
      }
    },
    [slotCopyContent, colorByBarcode, disabledOutputSlotAddresses]
  );

  /**
   * State to track the current input labware (for paging)
   */
  const [currentInputLabware, setCurrentInputLabware] = useState<Maybe<LabwareFieldsFragment>>(() => {
    return initialInputLabware?.length === 0 ? null : initialInputLabware[0];
  });

  /**
   * State to track the current output labware (in case there's multiple one day)
   */
  const [currentOutputLabware, setCurrentOutputLabware] = useState<Maybe<NewLabwareLayout>>(() => {
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

  /**
   * Hook for tracking state for Pager component
   */
  const { currentPage, numberOfPages, setNumberOfPages, setCurrentPage, goToLastPage, ...pagerRest } = usePager({
    initialCurrentPage: 1,
    initialNumberOfPages: inputLabware.length
  });

  /**Update machine context, if there is a change in output labware**/
  React.useEffect(() => {
    setCurrentOutputLabware((prev) => {
      /**This is only used by CytAssist. But, if any other use cases come in future which require a different condition (for e.g change in barcode)
       * to clear mappings them this can be moved to a callback handler
       */
      if (initialOutputLabware.length > 0 && prev?.labwareType !== initialOutputLabware[0].labwareType) {
        send('CLEAR_SLOT_MAPPINGS');
        outputLabwareRef.current?.deselectAll();
      }
      return initialOutputLabware[0];
    });
    send({ type: 'UPDATE_OUTPUT_LABWARE', labware: initialOutputLabware });
  }, [initialOutputLabware, send]);

  /**
   * Whenever the number of input labwares changes, set the number of pages on the pager
   */
  const numberOfInputLabware = inputLabware.length;
  useEffect(() => {
    setNumberOfPages(numberOfInputLabware);
  }, [numberOfInputLabware, setNumberOfPages]);

  /**
   * Whenever the number of input labwares increases, go to the last page
   */
  const previousLength = usePrevious(inputLabware.length);
  useEffect(() => {
    if (previousLength && inputLabware.length > previousLength) {
      goToLastPage();
    }
  }, [inputLabware.length, goToLastPage, previousLength]);

  /**
   * Whenever the current page changes, set the current input labware
   */
  useEffect(() => {
    setCurrentInputLabware(inputLabware[currentPage - 1]);
  }, [currentPage, inputLabware]);

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
      if (currentInputLabware?.id && currentOutputLabware?.id && address) {
        send({
          type: 'COPY_SLOTS',
          inputLabwareId: currentInputLabware?.id,
          inputAddresses: selectedInputAddresses,
          outputLabwareId: currentOutputLabware?.id,
          outputAddress: address
        });
      }
      setDestinationAddress(undefined);
    },
    [currentInputLabware, currentOutputLabware, destinationAddress, selectedInputAddresses, send]
  );

  /**
   * Callback to handle click on destination address for tranferring slots
   */
  const handleOnOutputLabwareSlotClick = React.useCallback(
    (outputAddress: string) => {
      if (disabledOutputSlotAddresses?.includes(outputAddress)) {
        return;
      }
      setDestinationAddress(outputAddress);
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
    [currentInputLabware, handleCopySlots, failedSlots, selectedInputAddresses, disabledOutputSlotAddresses]
  );

  /**
   * Handler for the "Clear" button
   */
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutputLabware?.id) {
      send({
        type: 'CLEAR_SLOTS',
        outputLabwareId: currentOutputLabware?.id,
        outputAddresses: selectedOutputAddresses
      });
      outputLabwareRef.current?.deselectAll();
    }
  }, [send, currentOutputLabware, selectedOutputAddresses, outputLabwareRef]);

  /**
   * Whenever the SlotCopyContent map changes, or the current input labware changes,
   * deselect any selected input slots
   */
  useEffect(() => {
    inputLabwareRef.current?.deselectAll();
  }, [slotCopyContent, currentInputLabware]);

  /**
   * Whenever the SlotCopyContent map changes, call the onChange handler
   */
  useEffect(() => {
    onChange?.(slotCopyContent, anySourceMapped);
  }, [onChange, slotCopyContent, anySourceMapped]);

  /**
   * Callback whenever labware is added or removed by the labware scanner
   */
  const onLabwareScannerChange = React.useCallback(
    (labware: LabwareFieldsFragment[]) => {
      send({ type: 'UPDATE_INPUT_LABWARE', labware });
    },
    [send]
  );

  const selectedSlots = currentInputLabware
    ? currentInputLabware.slots.filter(
        (slot) => selectedInputAddresses.findIndex((selectedAddress) => selectedAddress === slot.address) !== -1
      )
    : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 auto-rows-auto">
        <Heading level={4}>Input Labwares</Heading>

        <Heading level={4}>Output Labwares</Heading>

        <div id="inputLabwares" className="bg-gray-100 p-4">
          <LabwareScanner
            initialLabwares={initialInputLabware}
            onChange={onLabwareScannerChange}
            limit={inputLabwareLimit}
          >
            {(props) => {
              if (!currentInputLabware) {
                return <MutedText>Add labware using the scan input above</MutedText>;
              }
              return (
                <>
                  {!locked && (
                    <div className="flex flex-row justify-end">
                      <RemoveButton onClick={() => props.removeLabware(currentInputLabware.barcode)} />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center">
                    <Labware
                      labware={currentInputLabware}
                      selectable="non_empty"
                      selectionMode="multi"
                      labwareRef={inputLabwareRef}
                      slotColor={(address, slot) => {
                        return getSourceSlotColor(currentInputLabware, address, slot);
                      }}
                      name={currentInputLabware.labwareType.name}
                      onSelect={setSelectedInputAddresses}
                    />
                  </div>
                </>
              );
            }}
          </LabwareScanner>
        </div>
        <div id="outputLabwares" className="p-4 flex flex-col  bg-gray-100 border-l-2">
          <div className="flex mb-8">{children}</div>
          <div className={'flex items-center justify-center'}>
            {currentOutputLabware && (
              <Labware
                labware={currentOutputLabware}
                selectable="any"
                selectionMode="multi"
                labwareRef={outputLabwareRef}
                name={currentOutputLabware.labwareType.name}
                onSlotClick={handleOnOutputLabwareSlotClick}
                onSelect={setSelectedOutputAddresses}
                slotColor={(address) => getDestinationSlotColor(currentOutputLabware, address)}
              />
            )}
          </div>
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-between bg-gray-200">
          {inputLabware.length > 0 && <Pager currentPage={currentPage} numberOfPages={numberOfPages} {...pagerRest} />}
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-end bg-gray-200">
          {!locked && <WhiteButton onClick={handleOnClickClear}>Clear</WhiteButton>}
        </div>
      </div>

      {currentInputLabware && selectedSlots.length > 0 && (
        <div className="space-y-4">
          <Heading level={4}>Slot Mapping</Heading>
          <SlotMapperTable labware={currentInputLabware} slots={selectedSlots} slotCopyContent={slotCopyContent} />
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
