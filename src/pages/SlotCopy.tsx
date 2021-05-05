import React, { useCallback, useEffect } from "react";
import AppShell from "../components/AppShell";
import SlotMapper from "../components/slotMapper/SlotMapper";
import BlueButton from "../components/buttons/BlueButton";
import LabelPrinter from "../components/LabelPrinter";
import { LabwareTypeName, NewLabwareLayout } from "../types/stan";
import Warning from "../components/notifications/Warning";
import Success from "../components/notifications/Success";
import { toast } from "react-toastify";
import { useScrollToRef } from "../lib/hooks";
import { useMachine } from "@xstate/react";
import { SlotCopyContent } from "../types/sdk";
import slotCopyMachine from "../lib/machines/slotCopy/slotCopyMachine";
import { Link } from "react-router-dom";
import { reload } from "../lib/sdk";

type PageParams = {
  title: string;
  initialOutputLabware: NewLabwareLayout[];
};

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={"Slots copied"} />;

function SlotCopy({ title, initialOutputLabware }: PageParams) {
  const [current, send] = useMachine(() =>
    slotCopyMachine.withContext({
      operationType: "Visium cDNA",
      outputLabwareType: LabwareTypeName.PLATE,
      outputLabwares: [],
      slotCopyContent: [],
    })
  );

  const { serverErrors, outputLabwares } = current.context;

  const handleOnSlotMapperChange = useCallback(
    (slotCopyContent: Array<SlotCopyContent>, allSourcesMapped: boolean) => {
      send({
        type: "UPDATE_SLOT_COPY_CONTENT",
        slotCopyContent,
        allSourcesMapped,
      });
    },
    [send]
  );

  const handleSave = () => send({ type: "SAVE" });

  /**
   * When we get into the "copied" state, show a success message
   */
  useEffect(() => {
    if (current.value === "copied") {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
        hideProgressBar: true,
      });
    }
  }, [current.value]);

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
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          {serverErrors && (
            <div ref={ref} className="mb-4">
              <Warning error={serverErrors} />
            </div>
          )}

          <SlotMapper
            locked={current.matches("copied")}
            initialOutputLabware={initialOutputLabware}
            onChange={handleOnSlotMapperChange}
          />

          {outputLabwares.length > 0 && (
            <div className="mt-8 flex flex-row items-center sm:justify-end">
              <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow space-y-2">
                <LabelPrinter labwares={outputLabwares} />
              </div>
            </div>
          )}
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          {!current.matches("copied") && (
            <BlueButton
              disabled={!current.matches("readyToCopy")}
              onClick={handleSave}
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

export default SlotCopy;
