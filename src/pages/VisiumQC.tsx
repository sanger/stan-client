import React, { ChangeEvent, useCallback, useState } from "react";
import { GetVisiumQcInfoQuery, SlotMeasurementRequest } from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import Heading from "../components/Heading";
import { objectKeys } from "../lib/helpers";
import FormikSelect from "../components/forms/Select";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import { ClientError } from "graphql-request";
import { reload } from "../lib/sdk";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import { VisiumQCType } from "../components/visiumQC/VisiumQCType";

export enum QCType {
  SLIDE_PROCESSING = "Slide Processing",
  CDNA_AMPLIFICATION = "cDNA amplification",
  CDNA_ANALYSIS = "cDNA analysis",
}

type VisiumQCProps = {
  info: GetVisiumQcInfoQuery;
};

const validationSchema = Yup.object().shape({
  workNumber: Yup.string().optional().label("SGP number"),
  qcType: Yup.string().required().oneOf(Object.values(QCType)).label("QC Type"),
  barcode: Yup.string().required().label("Barcode"),
  slotMeasurements: Yup.array()
    .of(
      Yup.object().shape({
        address: Yup.string().required(),
        name: Yup.string().oneOf(["Cq value", "Concentration"]),
        value: Yup.string().required(),
      })
    )
    .optional(),
});
export interface VisiumQCData {
  workNumber?: string;
  qcType: QCType;
  barcode: string;
  slotMeasurements: Array<SlotMeasurementRequest>;
}

export default function VisiumQC({ info }: VisiumQCProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<ClientError | undefined>(undefined);

  const onSave = useCallback(() => {
    setSuccess(true);
  }, [setSuccess]);

  const onError = useCallback(
    (error: ClientError) => {
      setError(error);
    },
    [setError]
  );


  const initializeOnQCTypeSelection = useCallback(() => {
    setSuccess(false);
    setError(undefined);
  }, [setSuccess, setError]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto mb-4">
          <Formik<VisiumQCData>
            initialValues={{
              barcode: "",
              workNumber: undefined,
              qcType: QCType.SLIDE_PROCESSING,
              slotMeasurements: [],
            }}
            validationSchema={validationSchema}
            onSubmit={onSave}
          >
            {({ setFieldValue }) => (
              <Form>
                <div className="space-y-2 mb-8 ">
                  <Heading level={2}>SGP Number</Heading>

                  <p>
                    You may optionally select an SGP number to associate with
                    this operation.
                  </p>

                  <div className="mt-4 md:w-1/2">
                    <WorkNumberSelect
                      onWorkNumberChange={(workNumber) =>
                        setFieldValue("workNumber", workNumber)
                      }
                      name={"workNumber"}
                    />
                  </div>
                </div>
                <Heading level={2}>QC Type</Heading>
                <div className="mt-4 md:w-1/2">
                  <FormikSelect
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue("qcType", e.currentTarget.value);
                      initializeOnQCTypeSelection();
                    }}
                    data-testid={"qcType"}
                    emptyOption={true}
                    label={""}
                    name={"qcType"}
                  >
                    {objectKeys(QCType).map((qcType) => {
                      return (
                        <option key={qcType} value={QCType[qcType]}>
                          {QCType[qcType]}
                        </option>
                      );
                    })}
                  </FormikSelect>
                </div>

                <div className="mt-8 space-y-2">
                  <Heading level={2}>Labware</Heading>
                  <p>Please scan in any labware you wish to QC.</p>
                  <LabwareScanner limit={1}>
                    <VisiumQCType
                      qcTypeProps={{
                        comments: info.comments,
                        onSave: onSave,
                        onError: onError,
                      }}
                    />
                  </LabwareScanner>
                </div>

                {error && (
                  <Warning
                    className={"mt-4"}
                    message={"Failed to record Visium QC"}
                    error={error}
                  />
                )}
              </Form>
            )}
          </Formik>
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
