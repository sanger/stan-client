import React, { ChangeEvent, useCallback, useState } from "react";
import { GetVisiumQcInfoQuery, LabwareFieldsFragment } from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import Heading from "../components/Heading";
import { objectKeys } from "../lib/helpers";
import { Select } from "../components/forms/Select";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import { ClientError } from "graphql-request";
import { reload } from "../lib/sdk";
import VisiumQCType from "../components/visiumQC/VisiumQCType";

export enum QCType {
  SLIDE_PROCESSING = "Slide Processing",
}

type VisiumQCProps = {
  info: GetVisiumQcInfoQuery;
};

export default function VisiumQC({ info }: VisiumQCProps) {
  const [workNumber, setWorkNumber] = useState<string | undefined>();
  const [qcType, setQCType] = useState<string>(QCType.SLIDE_PROCESSING);
  const [labware, setLabware] = useState<LabwareFieldsFragment>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<ClientError | undefined>(undefined);

  const onAddLabware = useCallback(
    (labware: LabwareFieldsFragment) => {
      setLabware(labware);
    },
    [setLabware]
  );

  const onRemoveLabware = useCallback(() => {
    setLabware(undefined);
  }, [setLabware]);

  const onSave = useCallback(() => {
    setSuccess(true);
  }, [setSuccess]);

  const onError = useCallback(
    (error: ClientError) => {
      setError(error);
    },
    [setError]
  );

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
                <VisiumQCType
                  qcType={qcType}
                  qcTypeProps={{
                    workNumber: workNumber,
                    labware: labwares[0],
                    removeLabware: removeLabware,
                    comments: info.comments,
                    onSave: onSave,
                    onError: onError,
                  }}
                />
              )}
            </LabwareScanner>
          </div>

          {error && (
            <Warning
              className={"mt-4"}
              message={"Failed to record Visium QC"}
              error={error}
            />
          )}
        </div>

        <OperationCompleteModal
          show={success}
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
