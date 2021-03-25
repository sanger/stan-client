import React, { useEffect, useRef, useState } from "react";
import Labware, { LabwareImperativeRef } from "../labware/Labware";
import Pager from "../pagination/Pager";
import slotMapperMachine from "./slotMapper.machine";
import { SlotMapperProps } from "./slotMapper.types";
import { usePresentationModel } from "../../lib/hooks";
import SlotMapperPresentationModel from "./SlotMapperPresentationModel";
import WhiteButton from "../buttons/WhiteButton";
import LabwareScanner from "../labwareScanner/LabwareScanner";
import RemoveButton from "../buttons/RemoveButton";
import {
  LabwareLayoutFragment,
  Maybe,
  SlotFieldsFragment,
} from "../../types/graphql";
import SlotMapperTable from "./SlotMapperTable";
import { maybeFindSlotByAddress } from "../../lib/helpers/slotHelper";
import Heading from "../Heading";
import MutedText from "../MutedText";
import { usePager } from "../../lib/hooks/usePager";
import { NewLabwareLayout } from "../../types/stan";

function SlotMapper({
  onChange,
  initialInputLabware = [],
  initialOutputLabware = [],
  locked = false,
}: SlotMapperProps) {
  const model = usePresentationModel(
    slotMapperMachine.withContext({
      inputLabware: initialInputLabware,
      outputLabware: initialOutputLabware,
      slotCopyContent: [],
      colorByBarcode: new Map(),
    }),
    (current, service) => new SlotMapperPresentationModel(current, service)
  );

  const { inputLabware, slotCopyContent } = model.context;

  /**
   * State to track the current input labware (for paging)
   */
  const [currentInputLabware, setCurrentInputLabware] = useState<
    Maybe<LabwareLayoutFragment>
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
   * Whenever the number of input labwares changes, go to the last page
   */
  useEffect(() => {
    goToLastPage();
  }, [inputLabware.length, goToLastPage]);

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
    locked ? model.lock() : model.unlock();
  }, [locked, model]);

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
        model.copySlots(
          currentInputId,
          selectedInputAddresses,
          currentOutputId,
          outputAddress
        );
      }
    },
    [model, currentInputId, selectedInputAddresses, currentOutputId]
  );

  /**
   * Handler for the "Clear" button
   */
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutputId) {
      model.clearSlots(currentOutputId, selectedOutputAddresses);
      outputLabwareRef.current?.deselectAll();
    }
  }, [model, currentOutputId, selectedOutputAddresses, outputLabwareRef]);

  /**
   * Whenever the SlotCopyContent map changes, or the current input labware changes,
   * deselect any selected input slots
   */
  useEffect(() => {
    inputLabwareRef.current?.deselectAll();
  }, [model.context.slotCopyContent, currentInputLabware]);

  /**
   * Whenever the SlotCopyContent map changes, call the onChange handler
   */
  useEffect(() => {
    onChange?.(model.context.slotCopyContent, model.allSourcesMapped);
  }, [onChange, model.context.slotCopyContent, model.allSourcesMapped]);

  /**
   * Handler for whenever labware is added or removed by the labware scanner
   */
  const updateInputLabware = model.updateInputLabware;
  const onLabwareScannerChange = React.useCallback(
    (labwares: LabwareLayoutFragment[]) => {
      updateInputLabware(labwares);
    },
    [updateInputLabware]
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
                        return model.getSourceSlotColor(
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
                model.getDestinationSlotColor(currentOutputLabware, address)
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
