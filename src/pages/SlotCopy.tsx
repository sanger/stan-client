import React, { useEffect } from "react";
import AppShell from "../components/AppShell";
import SlotMapper from "../components/slotMapper/SlotMapper";
import BlueButton from "../components/buttons/BlueButton";
import LabelPrinter from "../components/LabelPrinter";
import { NewLabwareLayout } from "../types/stan";
import SlotCopyPresentationModel from "../lib/presentationModels/slotCopyPresentationModel";
import Warning from "../components/notifications/Warning";
import Success from "../components/notifications/Success";
import { toast } from "react-toastify";
import { useScrollToRef } from "../lib/hooks";

type PageParams = {
  title: string;
  initialOutputLabware: NewLabwareLayout[];
  model: SlotCopyPresentationModel;
};

/**
 * Success notification when slots have been copied
 */
const ToastSuccess = () => <Success message={"Slots copied"} />;

function SlotCopy({ title, initialOutputLabware, model }: PageParams) {
  /**
   * When we get into the "copied" state, show a success message
   */
  useEffect(() => {
    if (model.current.value === "copied") {
      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, [model]);

  /**
   * When there's an error returned from the server, scroll to it
   */
  const [ref, scrollToRef] = useScrollToRef();
  useEffect(() => {
    if (model.context.serverErrors != null) {
      scrollToRef();
    }
  }, [model.context.serverErrors, scrollToRef]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>{title}</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          {model.context.serverErrors && (
            <div ref={ref} className="mb-4">
              <Warning error={model.context.serverErrors} />
            </div>
          )}

          <SlotMapper
            locked={model.isSlotMapperLocked}
            initialOutputLabware={initialOutputLabware}
            onChange={model.handleOnSlotMapperChange}
          />

          {model.outputLabwares.length > 0 && (
            <div className="mt-8 flex flex-row items-center sm:justify-end">
              <div className="sm:max-w-xl w-full border-gray-200 p-4 rounded-md bg-gray-100 shadow space-y-2">
                <LabelPrinter labwares={model.outputLabwares} />
              </div>
            </div>
          )}
        </div>
      </AppShell.Main>

      <div className="border border-t-2 border-gray-200 w-full py-4 px-4 sm:px-6 lg:px-8 bg-gray-100 flex-shrink-0">
        <div className="flex flex-row items-center justify-end space-x-2">
          <BlueButton
            disabled={model.isBlueButtonDisabled}
            onClick={model.handleSave}
          >
            Save
          </BlueButton>
        </div>
      </div>
    </AppShell>
  );
}

export default SlotCopy;
