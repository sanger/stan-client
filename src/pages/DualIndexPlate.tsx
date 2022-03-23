import React, { useCallback, useEffect } from "react";
import AppShell from "../components/AppShell";
import BlueButton from "../components/buttons/BlueButton";
import { LabwareTypeName } from "../types/stan";
import Warning from "../components/notifications/Warning";
import Success from "../components/notifications/Success";
import { toast } from "react-toastify";
import { useScrollToRef } from "../lib/hooks";
import { useMachine } from "@xstate/react";
import { SlotCopyContent } from "../types/sdk";
import { Link } from "react-router-dom";
import { reload } from "../lib/sdk";
import WorkNumberSelect from "../components/WorkNumberSelect";
import Heading from "../components/Heading";
import reagentTransferMachine from "../lib/machines/reagentTransfer/reagentTransferMachine";
import ScanInput from "../components/scanInput/ScanInput";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import ReagentTransferSlotMapper from "../components/slotMapper/ReagentTransferSlotMapper";
import labwareFactory from "../lib/factories/labwareFactory";
import { labwareTypeInstances } from "../lib/factories/labwareTypeFactory";
import MutedText from "../components/MutedText";
import { buildLabwareFragment } from "../lib/helpers/labwareHelper";

import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/Table";

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={"Slots copied"} />;

function DualIndexPlate() {
  const [current, send] = useMachine(() =>
    reagentTransferMachine.withContext({
      operationType: "Dual index plate",
      sourceReagentPlate: undefined,
      destLabware: undefined,
      workNumber: "",
      reagentTransfers: [],
      reagentTransferResult: undefined,
    })
  );

  const handleWorkNumberChange = useCallback(
    (workNumber?: string) => {
      if (workNumber) {
        send({ type: "UPDATE_WORK_NUMBER", workNumber });
      }
    },
    [send]
  );

  const {
    serverErrors,
    sourceReagentPlate,
    destLabware,
    reagentTransfers,
    workNumber,
  } = current.context;
  /**
   * When we get into the "copied" state, show a success message
   */
  useEffect(() => {
    if (current.value === "transferred") {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true,
      });
    }
  }, [current.value]);

  const memoInputLabware = React.useMemo(() => {
    if (!sourceReagentPlate) {
      return undefined;
    }
    const plate = labwareFactory.build({
      labwareType: labwareTypeInstances.find(
        (lt) => lt.name === LabwareTypeName.DUAL_INDEX_PLATE
      ),
      barcode: sourceReagentPlate.barcode,
    });
    plate.barcode = sourceReagentPlate.barcode;
    if (sourceReagentPlate.slots) {
      sourceReagentPlate.slots.forEach((slot, indx) => {
        if (slot.used) {
          plate.slots[indx].samples = [];
        }
      });
    }
    return buildLabwareFragment(plate);
  }, [sourceReagentPlate]);

  const handleOnSlotMapperChange = useCallback(
    (slotCopyContent: Array<SlotCopyContent>) => {
      const reagentTransfers = slotCopyContent.map((scc) => {
        return {
          reagentPlateBarcode: memoInputLabware!.barcode,
          reagentSlotAddress: scc.sourceAddress,
          destinationAddress: scc.destinationAddress,
        };
      });
      send({ type: "UPDATE_TRANSFER_CONTENT", reagentTransfers });
    },
    [send, memoInputLabware]
  );

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
        <AppShell.Title>Dual Index Plate</AppShell.Title>
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
            <p className="mt-2">
              Please select an SGP number to associate with this operation.
            </p>
            <div className="my-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 auto-rows-max">
            <div className="space-y-4">
              <Heading level={4}>Dual Index Plate</Heading>
              <div className="w-1/2">
                <ScanInput
                  onScan={(value) =>
                    send({ type: "SET_SOURCE_LABWARE", barcode: value })
                  }
                  disabled={sourceReagentPlate !== undefined}
                />
                <MutedText>
                  Add source labware using the scan input above
                </MutedText>
              </div>
            </div>
            <div className="space-y-4">
              <Heading level={4}>96 Well Plate</Heading>
              <div>
                <LabwareScanner
                  onChange={(labwares) =>
                    send({
                      type: "SET_DESTINATION_LABWARE",
                      labware: labwares[0],
                    })
                  }
                  locked={destLabware !== undefined}
                >
                  {}
                </LabwareScanner>
                <MutedText>
                  Add destination labware using the scan input above
                </MutedText>
              </div>
            </div>
          </div>
          <ReagentTransferSlotMapper
            initialDestLabware={destLabware}
            initialSourceLabware={memoInputLabware}
            onChange={handleOnSlotMapperChange}
          />
        </div>
      </AppShell.Main>

      {reagentTransfers.length > 0 && (
        <>
          <Heading level={4}>Mapping</Heading>
          <Table>
            <TableHead>
              <tr>
                <TableHeader>Source - Dual index plate</TableHeader>
                <TableHeader>Destination - 96 well plate</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {reagentTransfers.map((transfer) => (
                <tr
                  key={
                    transfer.reagentPlateBarcode + transfer.reagentSlotAddress
                  }
                >
                  <TableCell>{transfer.reagentSlotAddress}</TableCell>
                  <TableCell>{transfer.destinationAddress}</TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
        </>
      )}
      <div className={"flex flex-col w-full"}>
        {serverErrors && <Warning error={serverErrors} />}
      </div>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches("transferred") && (
            <BlueButton
              disabled={reagentTransfers.length <= 0 || workNumber === ""}
              onClick={() => send({ type: "SAVE" })}
            >
              Save
            </BlueButton>
          )}

          {current.matches("copied") && (
            <>
              <BlueButton onClick={reload} action="tertiary">
                Reset Form
              </BlueButton>
              <Link to={"/"}>
                <BlueButton action="primary">Return Home</BlueButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default DualIndexPlate;
