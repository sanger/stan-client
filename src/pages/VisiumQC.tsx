import React, { ChangeEvent, useCallback, useState } from "react";
import {
  CommentFieldsFragment,
  GetStainingQcInfoQuery,
  LabwareFieldsFragment,
} from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import Heading from "../components/Heading";
import { useCollection } from "../lib/hooks/useCollection";
import { objectKeys } from "../lib/helpers";
import { Select } from "../components/forms/Select";
import SlideProcessing from "../components/visiumQC/SlideProcessing";
import BlueButton from "../components/buttons/BlueButton";

type VisiumQCProps = {
  info: GetStainingQcInfoQuery;
};
enum QCType {
  SLIDE_PROCESSING = "Slide Processing",
}
export type VisiumQCTypeProps = {
  workNumber: string | undefined;
  comments: CommentFieldsFragment[];
  labwares: LabwareFieldsFragment[];
  removeLabware: (barcode: string) => void;
  recordResult: boolean;
  notify;
};
export enum RecordResultStatus {
  SUCCESS,
  FAILURE,
  UNDEFINED,
}

export default function VisiumQC({ info }: VisiumQCProps) {
  const [workNumber, setWorkNumber] = useState<string | undefined>();
  const [recordResult, setRecordResult] = useState<boolean>(false);
  const [qcType, setQCType] = useState<string>(QCType.SLIDE_PROCESSING);
  const [recordStatus, setRecordStatus] = useState<RecordResultStatus>(
    RecordResultStatus.UNDEFINED
  );
  const labwares = useCollection<LabwareFieldsFragment>({
    getKey: (item) => item.barcode,
  });
  const onAddLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      labwares.append(labware);
    },
    [labwares]
  );

  const onRemoveLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      labwares.remove(labware.barcode);
    },
    [labwares]
  );

  const QCTypeComponent = ({
    qcType,
    comments,
    labwares,
    removeLabware,
  }: {
    qcType: string;
    comments: CommentFieldsFragment[];
    labwares: LabwareFieldsFragment[];
    removeLabware: (barcode: string) => void;
    recordResult: boolean;
  }) => {
    switch (qcType) {
      case QCType.SLIDE_PROCESSING: {
        return (
          <SlideProcessing
            workNumber={workNumber}
            comments={comments}
            labwares={labwares}
            removeLabware={removeLabware}
            recordResult={recordResult}
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
        <div className="max-w-screen-xl mx-auto">
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
            <Heading level={2}>Slides</Heading>

            <p>Please scan in any slides you wish to QC.</p>

            <LabwareScanner
              onAdd={onAddLabware}
              onRemove={onRemoveLabware}
              locked={labwares.items.length > 0}
            >
              {({ labwares, removeLabware }) => (
                <QCTypeComponent
                  qcType={qcType}
                  labwares={labwares}
                  removeLabware={removeLabware}
                  comments={info.comments}
                  recordResult={recordResult}
                />
              )}
            </LabwareScanner>
          </div>

          {/*serverError && (
            <Warning
              message={"Failed to record Staining QC"}
              error={serverError}
            />
          )*/}

          <div className={"mt-4 flex flex-row items-center justify-end"}>
            <BlueButton
              disabled={labwares.items.length <= 0}
              onClick={() => setRecordResult(true)}
            >
              Save
            </BlueButton>
          </div>
        </div>

        {/*<OperationCompleteModal
          show={current.matches("submitted")}
          message={"Stain QC complete"}
          onReset={reload}
        >
          <p>
            If you wish to start the process again, click the "Reset Form"
            button. Otherwise you can return to the Home screen.
          </p>
        </OperationCompleteModal>*/}
      </AppShell.Main>
    </AppShell>
  );
}
