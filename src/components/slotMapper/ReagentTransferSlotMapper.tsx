import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Labware, { LabwareImperativeRef } from "../labware/Labware";
import slotMapperMachine from "./slotMapper.machine";
import WhiteButton from "../buttons/WhiteButton";
import {
  LabwareFieldsFragment,
  SlotCopyContent,
  SlotFieldsFragment,
} from "../../types/sdk";
import { NewLabwareLayout } from "../../types/stan";
import { useMachine } from "@xstate/react";
import { find } from "lodash";

export interface ReagentTransferMappingProps {
  /**
   * Callback that's called whenever a slot is mapped or unmapped
   *
   * @param slotCopyContent the current mapping of source to destination slots
   * @param allSourcesMapped true if input labware exists and their non-empty slots have been mapped, false otherwise
   */
  onChange?: (
    slotCopyContent: Array<SlotCopyContent>,
    allSourcesMapped: boolean
  ) => void;

  /**
   * Lock the SlotMapper.
   */
  locked?: boolean;

  /**
   * Initial input labware
   */
  initialSourceLabware: LabwareFieldsFragment | undefined;

  /**
   * Initial output labware
   */
  initialDestLabware: LabwareFieldsFragment | undefined;
}

function ReagentTransferSlotMapper({
  onChange,
  initialSourceLabware,
  initialDestLabware,
}: ReagentTransferMappingProps) {
  const [current, send] = useMachine(() =>
    slotMapperMachine.withContext({
      inputLabware: initialSourceLabware ? [initialSourceLabware] : [],
      outputLabware: initialDestLabware ? [initialDestLabware] : [],
      slotCopyContent: [],
      colorByBarcode: new Map(),
      failedSlots: new Map(),
      errors: new Map(),
    })
  );

  const { slotCopyContent, colorByBarcode } = current.context;
  /**
   * Update machine state when inut/source labware is changed in parent
   */
  React.useEffect(() => {
    if (!initialSourceLabware) return;
    send({ type: "UPDATE_INPUT_LABWARE", labware: [initialSourceLabware] });
  }, [send, initialSourceLabware]);

  /**
   * Update machine state when output/destination labware is changed in parent
   */
  React.useEffect(() => {
    if (!initialDestLabware) return;
    send({ type: "UPDATE_OUTPUT_LABWARE", labware: [initialDestLabware] });
  }, [send, initialDestLabware]);

  const anySourceMapped = useMemo(() => {
    if (!initialSourceLabware || !initialDestLabware) {
      return false;
    }
    return slotCopyContent.length > 0;
  }, [slotCopyContent, initialSourceLabware, initialDestLabware]);

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
        return `bg-red-200`;
      }

      if (slot?.samples?.length) {
        return `bg-red-500`;
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
        return `bg-green-500`;
      }
    },
    [slotCopyContent, colorByBarcode]
  );

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
   * State to keep the output address clicked to transfer from input
   */
  const [destinationAddress, setDestinationAddress] = useState<
    string | undefined
  >();

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
      if (!initialSourceLabware || !initialDestLabware) return;
      const address = destinationAddress
        ? destinationAddress
        : givenDestinationAddress;
      if (
        initialSourceLabware.barcode &&
        initialDestLabware.barcode &&
        address
      ) {
        send({
          type: "COPY_SLOTS",
          inputLabwareId: initialSourceLabware.id,
          inputAddresses: selectedInputAddresses,
          outputLabwareId: initialDestLabware.id,
          outputAddress: address,
        });
      }
      setDestinationAddress(undefined);
    },
    [
      initialSourceLabware,
      initialDestLabware,
      destinationAddress,
      selectedInputAddresses,
      send,
    ]
  );

  /**
   * Callback to handle click on destination address for tranferring slots
   */
  const handleOnOutputLabwareSlotClick = React.useCallback(
    (outputAddress: string) => {
      setDestinationAddress(outputAddress);
      handleCopySlots(outputAddress);
    },
    [handleCopySlots]
  );

  /**
   * Handler for the "Clear" button
   */
  const handleOnClickClear = React.useCallback(() => {
    if (initialDestLabware && initialDestLabware.id) {
      send({
        type: "CLEAR_SLOTS",
        outputLabwareId: initialDestLabware.id,
        outputAddresses: selectedOutputAddresses,
      });
      outputLabwareRef.current?.deselectAll();
    }
  }, [send, initialDestLabware, selectedOutputAddresses, outputLabwareRef]);

  /**
   * Whenever the SlotCopyContent map changes, or the current input labware changes,
   * deselect any selected input slots
   */
  useEffect(() => {
    inputLabwareRef.current?.deselectAll();
  }, [slotCopyContent, initialSourceLabware]);

  /**
   * Whenever the SlotCopyContent map changes, call the onChange handler
   */
  useEffect(() => {
    onChange?.(slotCopyContent, anySourceMapped);
  }, [onChange, slotCopyContent, anySourceMapped]);

  return (
    <div className="space-y-8 mt-3 ">
      <div className="grid grid-cols-2 auto-rows-auto">
        <div id="sourceLabwares" className="bg-gray-100">
          {initialSourceLabware && (
            <Labware
              labware={initialSourceLabware}
              selectable="non_empty"
              selectionMode="single"
              labwareRef={inputLabwareRef}
              slotColor={(address, slot) => {
                return getSourceSlotColor(initialSourceLabware, address, slot);
              }}
              name={initialSourceLabware.labwareType.name}
              onSelect={setSelectedInputAddresses}
            />
          )}
        </div>

        <div id="destLabwares" className="bg-gray-100">
          {initialDestLabware && (
            <Labware
              labware={initialDestLabware}
              selectable="any"
              selectionMode="single"
              labwareRef={outputLabwareRef}
              name={initialDestLabware.labwareType.name}
              onSlotClick={handleOnOutputLabwareSlotClick}
              onSelect={setSelectedOutputAddresses}
              slotColor={(address) =>
                getDestinationSlotColor(initialDestLabware, address)
              }
            />
          )}
        </div>
      </div>
      {initialSourceLabware && initialDestLabware && (
        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-end bg-gray-200">
          <WhiteButton onClick={handleOnClickClear}>Clear</WhiteButton>
        </div>
      )}
    </div>
  );
}

export default ReagentTransferSlotMapper;
