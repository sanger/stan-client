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
import { Maybe, SlotFieldsFragment } from "../../types/graphql";
import SlotMapperTable from "./SlotMapperTable";
import { findSlotByAddress } from "../../lib/helpers/slotHelper";
import Heading from "../Heading";
import MutedText from "../MutedText";

function SlotMapper({
  onChange,
  initialInputLabware = [],
  initialOutputLabware = [],
  locked = false,
}: SlotMapperProps) {
  const model = usePresentationModel(
    slotMapperMachine.withContext({
      inputLabware: initialInputLabware,
      currentInputLabware:
        initialInputLabware.length > 0 ? initialInputLabware[0] : null,
      currentInputPage: 1,
      outputLabware: initialOutputLabware,
      currentOutputLabware:
        initialOutputLabware?.length > 0 ? initialOutputLabware[0] : null,
      currentOutputPage: 1,
      slotCopyContent: [],
      colorByBarcode: new Map(),
    }),
    (current, service) => new SlotMapperPresentationModel(current, service)
  );

  const {
    currentInputLabware,
    currentOutputLabware,
    inputLabware,
    outputLabware,
    slotCopyContent,
  } = model.context;

  const currentInputId = currentInputLabware?.id;
  const currentOutputId = currentOutputLabware?.id;

  const [selectedInputAddresses, setSelectedInputAddresses] = useState<
    Array<string>
  >([]);
  const [selectedOutputAddresses, setSelectedOutputAddresses] = useState<
    Array<string>
  >([]);

  let selectedInputSlot: Maybe<SlotFieldsFragment> = null;
  if (selectedInputAddresses.length === 1 && currentInputLabware) {
    selectedInputSlot = findSlotByAddress(
      currentInputLabware.slots,
      selectedInputAddresses[0]
    );
  }

  useEffect(() => {
    setSelectedOutputAddresses([]);
  }, [currentOutputLabware]);

  useEffect(() => {
    locked ? model.lock() : model.unlock();
  }, [locked, model]);

  /**
   * These refs are passed into the Labware components so we can imperatively
   * change their state e.g. deselecting all slots
   */
  const inputLabwareRef = useRef<LabwareImperativeRef>(null);
  const outputLabwareRef = useRef<LabwareImperativeRef>(null);

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

  // Handler for the "Clear" button
  const handleOnClickClear = React.useCallback(() => {
    if (currentOutputId) {
      model.clearSlots(currentOutputId, selectedOutputAddresses);
      outputLabwareRef.current?.deselectAll();
    }
  }, [model, currentOutputId, selectedOutputAddresses, outputLabwareRef]);

  // Whenever the SlotCopyContent map changes, or the current input labware changes,
  // deselect any selected input slots
  useEffect(() => {
    inputLabwareRef.current?.deselectAll();
  }, [model.context.slotCopyContent, currentInputLabware]);

  // Whenever the SlotCopyContent map changes, call the onChange handler
  useEffect(() => {
    onChange?.(model.context.slotCopyContent, model.allSourcesMapped);
  }, [onChange, model.context.slotCopyContent, model.allSourcesMapped]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 auto-rows-auto">
        <Heading level={4}>Input Labwares</Heading>

        <Heading level={4}>Output Labwares</Heading>

        <div id="inputLabwares" className="bg-gray-100 p-4">
          <LabwareScanner
            initialLabwares={inputLabware}
            onChange={model.updateInputLabware}
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
              numberOfPages={inputLabware.length}
              onPageChange={model.onInputPageChange}
            />
          )}
        </div>

        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-between bg-gray-200">
          {outputLabware.length > 0 && (
            <Pager
              numberOfPages={model.context.outputLabware.length}
              onPageChange={model.onOutputPageChange}
            />
          )}

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
