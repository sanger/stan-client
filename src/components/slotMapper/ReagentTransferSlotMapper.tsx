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
import { useMachine } from "@xstate/react";
import { find } from "lodash";
import { findSlotByAddress, isSlotEmpty } from "../../lib/helpers/slotHelper";
import { toast } from "react-toastify";
import warningToast from "../notifications/WarningToast";
import Heading from "../Heading";
import Table, { TableBody, TableCell, TableHead, TableHeader } from "../Table";
import RemoveButton from "../buttons/RemoveButton";

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
  disabled?: boolean;

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
  disabled,
}: ReagentTransferMappingProps) {
  const memoSlotMapperMachine = React.useMemo(() => {
    return slotMapperMachine.withContext({
      inputLabware: initialSourceLabware ? [initialSourceLabware] : [],
      outputLabware: initialDestLabware ? [initialDestLabware] : [],
      slotCopyContent: [],
      colorByBarcode: new Map(),
      failedSlots: new Map(),
      errors: new Map(),
    });
  }, [initialSourceLabware, initialDestLabware]);
  const [current, send] = useMachine(() => memoSlotMapperMachine);

  const { slotCopyContent } = current.context;
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

  React.useEffect(() => {
    if (!disabled) return;

    setSelectedInputAddresses([]);
    setSelectedOutputAddresses([]);
    inputLabwareRef.current?.deselectAll();
    outputLabwareRef.current?.deselectAll();
  }, [disabled, setSelectedOutputAddresses, setSelectedInputAddresses]);

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
      if (disabled) {
        return `bg-gray-400 `;
      } else {
        if (
          find(slotCopyContent, {
            sourceBarcode: labware.barcode,
            sourceAddress: address,
          })
        ) {
          return `bg-blue-200`;
        }

        if (slot?.samples?.length) {
          return `bg-blue-500`;
        }
      }
    },
    [slotCopyContent, disabled]
  );

  const getDestinationSlotColor = useCallback(
    (
      labware: LabwareFieldsFragment,
      address: string,
      slot: SlotFieldsFragment
    ) => {
      if (disabled) {
        return `bg-gray-400`;
      } else {
        const scc = find(slotCopyContent, {
          destinationAddress: address,
        });
        if (scc) {
          return `bg-blue-500`;
        }
        if (slot?.samples?.length) {
          return `bg-green-500`;
        }
      }
    },
    [slotCopyContent, disabled]
  );

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
      /**if the selected destination address slot is empty, give warning and return**/
      if (disabled) {
        return;
      }
      if (
        isSlotEmpty(findSlotByAddress(initialDestLabware!.slots, outputAddress))
      ) {
        warningToast({
          message: "Cannot transfer reagent to an empty slot.",
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000,
        });
        return;
      }
      setDestinationAddress(outputAddress);
      handleCopySlots(outputAddress);
    },
    [handleCopySlots, initialDestLabware, disabled]
  );

  /**
   * Handler for the "Clear" button
   */
  const handleOnClickClear = React.useCallback(() => {
    if (initialDestLabware && initialDestLabware.id) {
      send({
        type: "CLEAR_SLOTS",
        outputLabwareId: initialDestLabware.id,
        outputAddresses: slotCopyContent.map((scc) => scc.destinationAddress),
      });
      outputLabwareRef.current?.deselectAll();
    }
  }, [send, initialDestLabware, outputLabwareRef, slotCopyContent]);

  const handleOnRemoveMapping = React.useCallback(
    (destAddress: string) => {
      send({
        type: "CLEAR_SLOTS",
        outputLabwareId: initialDestLabware!.id,
        outputAddresses: [destAddress],
      });
      if (selectedOutputAddresses.includes(destAddress)) {
        outputLabwareRef.current?.deselectAll();
      }
    },
    [initialDestLabware, outputLabwareRef, selectedOutputAddresses, send]
  );

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
    <div className="mt-3 space-y-8">
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
              slotColor={(address, slot) =>
                getDestinationSlotColor(initialDestLabware, address, slot)
              }
            />
          )}
        </div>
      </div>
      {slotCopyContent.length > 0 && (
        <div className="flex flex-col p-4 bg-gray-100 space-y-8">
          <Heading level={4}>Mapping</Heading>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Source - Dual index plate</TableHeader>
                <TableHeader>Destination - 96 well plate</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {slotCopyContent.map((scc) => (
                <tr key={scc.sourceBarcode + scc.sourceAddress}>
                  <TableCell>{scc.sourceAddress}</TableCell>
                  <TableCell>{scc.destinationAddress}</TableCell>
                  <TableCell>
                    <RemoveButton
                      type="button"
                      onClick={() =>
                        handleOnRemoveMapping(scc.destinationAddress)
                      }
                      disabled={disabled}
                    />
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {initialSourceLabware && initialDestLabware && (
        <div className="border-gray-300 border-t-2 p-4 flex flex-row items-center justify-end bg-gray-200">
          <WhiteButton onClick={handleOnClickClear} disabled={disabled}>
            Clear
          </WhiteButton>
        </div>
      )}
    </div>
  );
}

export default ReagentTransferSlotMapper;
