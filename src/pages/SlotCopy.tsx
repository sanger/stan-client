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
import { LabwareFieldsFragment, SlotCopyContent } from "../types/sdk";
import slotCopyMachine from "../lib/machines/slotCopy/slotCopyMachine";
import { Link } from "react-router-dom";
import { reload } from "../lib/sdk";
import WorkNumberSelect from "../components/WorkNumberSelect";
import Heading from "../components/Heading";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/Table";
import { ConfirmationModal } from "../components/modal/ConfirmationModal";
import { history } from "../lib/sdk";
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
      inputLabwarePermData: [],
    })
  );

  const [labwaresWithoutPerm, setLabwaresWithoutPerm] = React.useState<
    LabwareFieldsFragment[]
  >([]);
  const [warnBeforeSave, setWarnBeforeSave] = React.useState(false);

  const {
    serverErrors,
    outputLabwares,
    slotCopyContent,
    inputLabwarePermData,
  } = current.context;

  const handleOnSlotMapperChange = useCallback(
    (slotCopyContent: Array<SlotCopyContent>, anySourceMapped: boolean) => {
      send({
        type: "UPDATE_SLOT_COPY_CONTENT",
        slotCopyContent,
        anySourceMapped,
      });
    },
    [send]
  );

  const handleWorkNumberChange = useCallback(
    (workNumber?: string) => {
      send({ type: "UPDATE_WORK_NUMBER", workNumber });
    },
    [send]
  );

  const handleSave = React.useCallback(() => {
    setWarnBeforeSave(false);
    send({ type: "SAVE" });
  }, [setWarnBeforeSave, send]);

  const handleInputLabwareChange = React.useCallback(
    (inputLabwares: LabwareFieldsFragment[]) => {
      send({ type: "UPDATE_INPUT_LABWARE_PERMTIME", labwares: inputLabwares });
    },
    [send]
  );

  /**
   * Save action invoked, so check whether a warning to be given to user if any labware with no perm done is copied
   ***/
  const onSaveAction = React.useCallback(() => {
    /**Get all input lawares that didn't perform perm operation and are mapped/copied to 96 well plate*/
    const labwareWithoutPermData = inputLabwarePermData.filter(
      (permData) =>
        permData.visiumPermData.addressPermData.length === 0 &&
        slotCopyContent.some(
          (scc) => scc.sourceBarcode === permData.visiumPermData.labware.barcode
        )
    );

    if (labwareWithoutPermData.length > 0) {
      setLabwaresWithoutPerm(
        labwareWithoutPermData.map(
          (permData) => permData.visiumPermData.labware
        )
      );
      setWarnBeforeSave(true);
    } else {
      handleSave();
    }
  }, [handleSave, inputLabwarePermData, slotCopyContent]);

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

          <div className="mb-8">
            <Heading level={3}>SGP Number</Heading>
            <p className="mt-2">
              You may optionally select an SGP number to associate with this
              operation.
            </p>
            <div className="my-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
            </div>
          </div>

          <SlotMapper
            locked={current.matches("copied")}
            initialOutputLabware={initialOutputLabware}
            onChange={handleOnSlotMapperChange}
            onInputLabwareChange={handleInputLabwareChange}
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
              onClick={onSaveAction}
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
      {
        <ConfirmationModal
          show={warnBeforeSave}
          header={"Save transferred slots"}
          message={{
            type: "Warning",
            text: "Labware without Permeabilisation",
          }}
          confirmOptions={[
            {
              label: "Cancel",
              action: () => {
                setWarnBeforeSave(false);
              },
            },
            { label: "Continue", action: handleSave },
            {
              label: "Visium permeabilisation",
              action: () => {
                history.push({
                  pathname: "/lab/visium_perm",
                });
                setWarnBeforeSave(false);
              },
            },
          ]}
        >
          <p className={"font-bold mt-8"}>
            {"Permeabilisation has not been recorded on the following labware"}
          </p>
          <Table className={"mt-6 w-full overflow-y-visible"}>
            <TableHead>
              <tr>
                <TableHeader>Barcode</TableHeader>
                <TableHeader>Type</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {labwaresWithoutPerm.map((lw) => (
                <tr key={lw.barcode}>
                  <TableCell>{lw.barcode}</TableCell>
                  <TableCell>{lw.labwareType.name}</TableCell>
                </tr>
              ))}
            </TableBody>
          </Table>
          <p className="mt-8 my-3 text-gray-800 text-center text-sm  leading-normal">
            If you wish to perform permeabilisation on these slides, click the
            <span className="font-bold text-gray-900">
              {" "}
              Visium Permeabilisation{" "}
            </span>
            button.
          </p>{" "}
          <p className="my-3 text-gray-800 text-center text-sm  leading-normal">
            Otherwise click{" "}
            <span className="font-bold text-gray-900">Continue or Cancel</span>{" "}
            to record or cancel this operation.
          </p>
        </ConfirmationModal>
      }
    </AppShell>
  );
}

export default SlotCopy;
