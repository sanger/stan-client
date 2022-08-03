import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Labware, { LabwareImperativeRef } from '../labware/Labware';
import Pager from '../pagination/Pager';
import slotMapperMachine from './slotMapper.machine';
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

function SlotMapper({
  onChange,
  onInputLabwareChange,
  initialInputLabware = [],
  initialOutputLabware = [],
  locked = false
}: SlotMapperProps) {
  const [current, send] = useMachine(() =>
    slotMapperMachine.withContext({
      inputLabware: initialInputLabware,
      outputLabware: initialOutputLabware,
      slotCopyContent: [],
      colorByBarcode: new Map(),
      failedSlots: new Map(),
      errors: new Map()
    })
  );

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
      const scc = find(slotCopyContent, {
        destinationAddress: address
      });

      if (scc) {
        return `bg-${colorByBarcode.get(scc.sourceBarcode)}-500`;
      }
    },
    [slotCopyContent, colorByBarcode]
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
  const [currentOutputLabware] = useState<Maybe<NewLabwareLayout>>(() => {
    return initialOutputLabware?.length === 0 ? null : initialOutputLabware[0];
  });

  const currentInputId = currentInputLabware?.id;
  const currentOutputId = currentOutputLabware?.id;

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
      if (currentInputId && currentOutputId && address) {
        send({
          type: 'COPY_SLOTS',
          inputLabwareId: currentInputId,
          inputAddresses: selectedInputAddresses,
          outputLabwareId: currentOutputId,
          outputAddress: address
        });
      }
      setDestinationAddress(undefined);
    },
    [currentInputId, currentOutputId, destinationAddress, selectedInputAddresses, send]
  );

  /**
   * Callback to handle click on destination address for tranferring slots
   */
  const handleOnOutputLabwareSlotClick = React.useCallback(
    (outputAddress: string) => {
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
    [currentInputLabware, handleCopySlots, failedSlots, selectedInputAddresses]
  );

  /**
   * Handler for the "Clear" button
   */
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutputId) {
      send({
        type: 'CLEAR_SLOTS',
        outputLabwareId: currentOutputId,
        outputAddresses: selectedOutputAddresses
      });
      outputLabwareRef.current?.deselectAll();
    }
  }, [send, currentOutputId, selectedOutputAddresses, outputLabwareRef]);

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
          <LabwareScanner initialLabwares={initialInputLabware} onChange={onLabwareScannerChange}>
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

        <div id="outputLabwares" className="p-4 flex flex-col items-center justify-center bg-gray-100">
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
      {
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
      }

      <div className={'flex flex-col w-full'}>
        {errors.size > 0 && (
          <Warning
            message={`There is an error while fetching pass/fail status for the slots in ${currentInputLabware?.barcode}.`}
          />
        )}
      </div>
    </div>
  );
}

export default SlotMapper;
