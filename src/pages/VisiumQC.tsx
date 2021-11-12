import React, { ChangeEvent, useCallback, useState } from "react";
import {
  CommentFieldsFragment,
  GetVisiumQcInfoQuery,
  LabwareFieldsFragment,
} from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import Heading from "../components/Heading";
import { objectKeys } from "../lib/helpers";
import { Select } from "../components/forms/Select";
import SlideProcessing from "../components/visiumQC/SlideProcessing";
import BlueButton from "../components/buttons/BlueButton";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import { ClientError } from "graphql-request";
import { reload } from "../lib/sdk";

export enum QCType {
  SLIDE_PROCESSING = "Slide Processing",
}
type SaveResultStatus = {
  status: "Success" | "Fail" | "None";
  message?: string;
  error?: ClientError | undefined;
};

type VisiumQCProps = {
  info: GetVisiumQcInfoQuery;
};
export type VisiumQCTypeProps = {
  /***
   * Work Number
   */
  workNumber: string | undefined;

  /***
   * Comments
   */
  comments: CommentFieldsFragment[];

  /***
   * Labware scanned
   */
  labware: LabwareFieldsFragment | undefined;

  /***
   * Handler for closing labware display panel
   * @param barcode Barcode of the labware removed
   */
  removeLabware: (barcode: string) => void;

  /***
   * Status to indicate that save result action is initiated in parent.
   * useEffect hook can used on this to call stanCore API to record result.
   */
  saveResult: boolean;

  /**
   * Callback to indicate the outcome of saving result to parent.
   * This need to be called when save operation is completed.
   * @param status Status of result recording
   */
  notifySaveStatus: (status: SaveResultStatus) => void;
};

export default function VisiumQC({ info }: VisiumQCProps) {
  const [workNumber, setWorkNumber] = useState<string | undefined>();
  const [saveResult, setSaveResult] = useState<boolean>(false);
  const [qcType, setQCType] = useState<string>(QCType.SLIDE_PROCESSING);
  const [saveStatus, setSaveStatus] = useState<SaveResultStatus>({
    status: "None",
  });
  const [labware, setLabware] = useState<LabwareFieldsFragment>();

  const onAddLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      setLabware(labware);
    },
    [setLabware]
  );

  const onRemoveLabware = useCallback(() => {
    setLabware(undefined);
  }, [setLabware]);

  const notifySaveStatus = useCallback(
    (status: SaveResultStatus) => {
      setSaveStatus(status);
      setSaveResult(false);
    },
    [setSaveResult, setSaveStatus]
  );

  const QCTypeComponent = ({
    qcType,
    qcTypeProps,
  }: {
    qcType: string;
    qcTypeProps: VisiumQCTypeProps;
  }) => {
    switch (qcType) {
      case QCType.SLIDE_PROCESSING: {
        return (
          <SlideProcessing
            workNumber={qcTypeProps.workNumber}
            comments={qcTypeProps.comments}
            labware={qcTypeProps.labware}
            removeLabware={qcTypeProps.removeLabware}
            saveResult={qcTypeProps.saveResult}
            notifySaveStatus={qcTypeProps.notifySaveStatus}
          />
        );
      }
    }
    return <></>;
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto mb-4">
          <div className="space-y-2 mb-4 ">
            <Heading level={2}>SGP Number</Heading>

            <p>
              You may optionally select an SGP number to associate with this
              operation.
            </p>

            <div className="mt-4 md:w-1/2">
              <WorkNumberSelect onWorkNumberChange={setWorkNumber} />
            </div>
          </div>

          <Heading level={2}>QC Type</Heading>
          <div className="mt-4 md:w-1/2">
            <Select
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setQCType(e.currentTarget.value)
              }
              data-testid={"qcType"}
              emptyOption={true}
              value={qcType}
            >
              {objectKeys(QCType).map((qcType) => {
                return (
                  <option key={qcType} value={QCType[qcType]}>
                    {QCType[qcType]}
                  </option>
                );
              })}
            </Select>
          </div>

          <div className="mt-8 space-y-2">
            <Heading level={2}>Slide</Heading>

            <p>Please scan in any slides you wish to QC.</p>

            <LabwareScanner
              onAdd={onAddLabware}
              onRemove={onRemoveLabware}
              locked={labware !== undefined}
            >
              {({ labwares, removeLabware }) => (
                <QCTypeComponent
                  qcType={qcType}
                  qcTypeProps={{
                    workNumber: workNumber,
                    labware: labwares[0],
                    removeLabware: removeLabware,
                    comments: info.comments,
                    saveResult: saveResult,
                    notifySaveStatus: notifySaveStatus,
                  }}
                />
              )}
            </LabwareScanner>
          </div>

          {saveStatus.status === "Fail" && (
            <Warning
              message={"Failed to record Visium QC"}
              error={saveStatus.error}
            />
          )}

          <div className={"mt-4 flex flex-row items-center justify-end"}>
            <BlueButton disabled={!labware} onClick={() => setSaveResult(true)}>
              Save
            </BlueButton>
          </div>
        </div>

        <OperationCompleteModal
          show={saveStatus.status === "Success"}
          message={"Visium QC complete"}
          onReset={reload}
        >
          <p>
            If you wish to start the process again, click the "Reset Form"
            button. Otherwise you can return to the Home screen.
          </p>
        </OperationCompleteModal>
      </AppShell.Main>
    </AppShell>
  );
}
