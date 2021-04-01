import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Labware, { LabwareImperativeRef } from "../labware/Labware";
import Pager from "../pagination/Pager";
import slotMapperMachine from "./slotMapper.machine";
import { SlotMapperProps } from "./slotMapper.types";
import { usePrevious } from "../../lib/hooks";
import WhiteButton from "../buttons/WhiteButton";
import LabwareScanner from "../labwareScanner/LabwareScanner";
import RemoveButton from "../buttons/RemoveButton";
import {
  LabwareFieldsFragment,
  Maybe,
  SlotFieldsFragment,
} from "../../types/graphql";
import SlotMapperTable from "./SlotMapperTable";
import { maybeFindSlotByAddress } from "../../lib/helpers/slotHelper";
import Heading from "../Heading";
import MutedText from "../MutedText";
import { usePager } from "../../lib/hooks/usePager";
import { NewLabwareLayout } from "../../types/stan";
import { useMachine } from "@xstate/react";
import * as labwareHelper from "../../lib/helpers/labwareHelper";
import { find, findIndex } from "lodash";

function SlotMapper({
  onChange,
  initialInputLabware = [],
  initialOutputLabware = [],
  locked = false,
}: SlotMapperProps) {
  const [current, send] = useMachine(() =>
    slotMapperMachine.withContext({
      inputLabware: initialInputLabware,
      outputLabware: initialOutputLabware,
      slotCopyContent: [],
      colorByBarcode: new Map(),
    })
  );

  const { inputLabware, slotCopyContent, colorByBarcode } = current.context;

  const allSourcesMapped = useMemo(() => {
    if (inputLabware.length === 0) {
      return false;
    }

    // List of [labwareBarcode, slotAddress] tuples for all filled slots of the source labwares
    const allSources: Array<readonly [string, string]> = inputLabware.flatMap(
      (lw) => {
        return labwareHelper
          .filledSlots(lw)
          .map((slot) => [lw.barcode, slot.address]);
      }
    );

    // Is every source in slotCopyContent?
    return allSources.every(([sourceBarcode, sourceAddress]) => {
      return (
        findIndex(slotCopyContent, {
          sourceBarcode,
          sourceAddress,
        }) !== -1
      );
    });
  }, [inputLabware, slotCopyContent]);

  const getSourceSlotColor = useCallback(
    (
      labware: LabwareFieldsFragment,
      address: string,
      slot: SlotFieldsFragment
    ) => {
      if (
        find(slotCopyContent, {
          sourceBarcode: labware.barcode,
          sourceAddress: address,
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
        destinationAddress: address,
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
  const [currentInputLabware, setCurrentInputLabware] = useState<
    Maybe<LabwareFieldsFragment>
  >(() => {
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
  const [selectedInputAddresses, setSelectedInputAddresses] = useState<
    Array<string>
  >([]);
  const [selectedOutputAddresses, setSelectedOutputAddresses] = useState<
    Array<string>
  >([]);

  /**
   * If there's only one input slot selected, store it here
   * Will be used for the slop map table
   */
  let selectedInputSlot: Maybe<SlotFieldsFragment> = null;
  if (selectedInputAddresses.length === 1 && currentInputLabware) {
    selectedInputSlot = maybeFindSlotByAddress(
      currentInputLabware.slots,
      selectedInputAddresses[0]
    );
  }

  /**
   * Hook for tracking state for Pager component
   */
  const {
    currentPage,
    numberOfPages,
    setNumberOfPages,
    setCurrentPage,
    goToLastPage,
    ...pagerRest
  } = usePager({
    initialCurrentPage: 1,
    initialNumberOfPages: inputLabware.length,
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
    locked ? send({ type: "LOCK" }) : send({ type: "UNLOCK" });
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
  const handleOnOutputLabwareSlotClick = React.useCallback(
    (outputAddress: string) => {
      if (currentInputId && currentOutputId) {
        send({
          type: "COPY_SLOTS",
          inputLabwareId: currentInputId,
          inputAddresses: selectedInputAddresses,
          outputLabwareId: currentOutputId,
          outputAddress,
        });
      }
    },
    [send, currentInputId, selectedInputAddresses, currentOutputId]
  );

  /**
   * Handler for the "Clear" button
   */
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutputId) {
      send({
        type: "CLEAR_SLOTS",
        outputLabwareId: currentOutputId,
        outputAddresses: selectedOutputAddresses,
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
    onChange?.(slotCopyContent, allSourcesMapped);
  }, [onChange, slotCopyContent, allSourcesMapped]);

  /**
   * Handler for whenever labware is added or removed by the labware scanner
   */
  const onLabwareScannerChange = React.useCallback(
    (labware: LabwareFieldsFragment[]) => {
      send({ type: "UPDATE_INPUT_LABWARE", labware });
    },
    [send]
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 auto-rows-auto">
        <Heading level={4}>Input Labwares</Heading>

        <Heading level={4}>Output Labwares</Heading>

        <div id="inputLabwares" className="bg-gray-100 p-4">
          <LabwareScanner
            initialLabwares={initialInputLabware}
            onChange={onLabwareScannerChange}
          >
            {(props) => {
              if (!currentInputLabware) {
                return (
                  <MutedText>Add labware using the scan input above</MutedText>
                );
              }

              return (
                <>
                  {!locked && (
                    <div className="flex flex-row justify-end">
                      <RemoveButton
                        onClick={() =>
                          props.removeLabware(currentInputLabware.barcode)
                        }
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center">
                    <Labware
                      labware={currentInputLabware}
                      selectable="non_empty"
                      selectionMode="multi"
                      labwareRef={inputLabwareRef}
                      slotColor={(address, slot) => {
                        return getSourceSlotColor(
                          currentInputLabware,
                          address,
                          slot
                        );
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

        <div
          id="outputLabwares"
          className="p-4 flex flex-col items-center justify-center bg-gray-100"
        >
          {currentOutputLabware && (
            <Labware
              labware={currentOutputLabware}
              selectable="any"
              selectionMode="multi"
              labwareRef={outputLabwareRef}
              name={currentOutputLabware.labwareType.name}
              onSlotClick={handleOnOutputLabwareSlotClick}
              onSelect={setSelectedOutputAddresses}
              slotColor={(address) =>
                getDestinationSlotColor(currentOutputLabware, address)
              }
            />
          )}
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-between bg-gray-200">
          {inputLabware.length > 0 && (
            <Pager
              currentPage={currentPage}
              numberOfPages={numberOfPages}
              {...pagerRest}
            />
          )}
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-end bg-gray-200">
          {!locked && (
            <WhiteButton onClick={handleOnClickClear}>Clear</WhiteButton>
          )}
        </div>
      </div>

      {currentInputLabware && selectedInputSlot && (
        <div className="space-y-4">
          <Heading level={4}>Slot Mapping</Heading>
          <SlotMapperTable
            labware={currentInputLabware}
            slot={selectedInputSlot}
            slotCopyContent={slotCopyContent}
          />
        </div>
      )}
    </div>
  );
}

export default SlotMapper;
