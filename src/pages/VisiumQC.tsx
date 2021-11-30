import React, { ChangeEvent, useContext, useState } from "react";
import {
  GetVisiumQcInfoQuery,
  LabwareResult as CoreLabwareResult,
  OpWithSlotMeasurementsRequest,
  RecordOpWithSlotMeasurementsMutation,
  RecordVisiumQcMutation,
  ResultRequest,
  SlotMeasurementRequest,
} from "../types/sdk";
import AppShell from "../components/AppShell";
import WorkNumberSelect from "../components/WorkNumberSelect";
import LabwareScanner from "../components/labwareScanner/LabwareScanner";
import Heading from "../components/Heading";
import { objectKeys } from "../lib/helpers";
import FormikSelect from "../components/forms/Select";
import OperationCompleteModal from "../components/modal/OperationCompleteModal";
import Warning from "../components/notifications/Warning";
import { reload, StanCoreContext } from "../lib/sdk";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import BlueButton from "../components/buttons/BlueButton";
import { useMachine } from "@xstate/react";
import createFormMachine from "../lib/machines/form/formMachine";
import CDNAMeasurementQC from "../components/visiumQC/CDNAMeasurementQC";
import SlideProcessing from "../components/visiumQC/SlideProcessing";

export enum QCType {
  SLIDE_PROCESSING = "Slide Processing",
  CDNA_AMPLIFICATION = "cDNA amplification",
  CDNA_ANALYSIS = "cDNA analysis",
}

type VisiumQCProps = {
  info: GetVisiumQcInfoQuery;
};

export interface VisiumQCFormData {
  workNumber?: string;
  qcType: QCType;
  barcode: string;
  slotMeasurements?: Array<SlotMeasurementRequest>;
  labwareResult?: CoreLabwareResult;
}

export default function VisiumQC({ info }: VisiumQCProps) {
  const [labwareResult, setLabwareResult] = useState<
    CoreLabwareResult | undefined
  >(undefined);
  const stanCore = useContext(StanCoreContext);

  const validationSchema = Yup.object().shape({
    workNumber: Yup.string().optional().label("SGP number"),
    qcType: Yup.string().required().label("QC Type"),
    barcode: Yup.string().optional(),
    slotMeasurements: Yup.array()
      .of(
        Yup.object().shape({
          address: Yup.string(),
          name: Yup.string(),
          value: Yup.string(),
        })
      )
      .optional(),
  });
  const [currentSlideProcessing, sendSlideProcessing] = useMachine(
    createFormMachine<ResultRequest, RecordVisiumQcMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordVisiumQC({
            request: e.values,
          });
        },
      },
    })
  );

  const [currentCDNA, sendCDNA] = useMachine(
    createFormMachine<
      OpWithSlotMeasurementsRequest,
      RecordOpWithSlotMeasurementsMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordOpWithSlotMeasurements({
            request: e.values,
          });
        },
      },
    })
  );

  const {
    serverError: serverErrorSlideProcessing,
  } = currentSlideProcessing.context;
  const { serverError: serverErrorCDNA } = currentCDNA.context;

  const onSubmit = (values: VisiumQCFormData) => {
    if (values.qcType === QCType.SLIDE_PROCESSING && labwareResult) {
      sendSlideProcessing({
        type: "SUBMIT_FORM",
        values: {
          workNumber: values.workNumber,
          labwareResults: [labwareResult],
          operationType: QCType.SLIDE_PROCESSING,
        },
      });
    }
    if (
      values.qcType === QCType.CDNA_ANALYSIS ||
      (values.qcType === QCType.CDNA_AMPLIFICATION && values.slotMeasurements)
    ) {
      sendCDNA({
        type: "SUBMIT_FORM",
        values: {
          workNumber: values.workNumber,
          barcode: values.barcode,
          slotMeasurements: values.slotMeasurements ?? [],
          operationType: values.qcType,
        },
      });
    }
  };

  const isEnableSubmit = (value: VisiumQCFormData) => {
    if (
      value.qcType === QCType.CDNA_AMPLIFICATION ||
      value.qcType === QCType.CDNA_ANALYSIS
    ) {
      if (value.slotMeasurements) {
        const val = value.slotMeasurements.filter(
          (measurement) => measurement.value === ""
        );
        return val.length <= 0;
      } else return false;
    } else {
      return !!labwareResult;
    }
  };

  const getServerError = (qcType: QCType) => {
    if (
      (qcType === QCType.CDNA_AMPLIFICATION ||
        qcType === QCType.CDNA_ANALYSIS) &&
      serverErrorCDNA
    ) {
      return serverErrorCDNA;
    } else if (
      qcType === QCType.SLIDE_PROCESSING &&
      serverErrorSlideProcessing
    ) {
      return serverErrorSlideProcessing;
    } else return undefined;
  };
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Visium QC</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto mb-4">
          <Formik<VisiumQCFormData>
            initialValues={{
              barcode: "",
              workNumber: undefined,
              qcType: QCType.SLIDE_PROCESSING,
              slotMeasurements: [],
            }}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
          >
            {({ setFieldValue, values }) => (
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
                    {({ labwares, removeLabware }) => {
                      if (values.qcType === QCType.SLIDE_PROCESSING) {
                        return (
                          <SlideProcessing
                            labware={labwares[0]}
                            removeLabware={removeLabware}
                            comments={info.comments}
                            labwareResult={labwareResult}
                            setLabwareResult={setLabwareResult}
                          />
                        );
                      } else {
                        return (
                          <CDNAMeasurementQC
                            qcType={values.qcType}
                            slotMeasurements={values.slotMeasurements}
                            labware={labwares[0]}
                            removeLabware={removeLabware}
                          />
                        );
                      }
                    }}
                  </LabwareScanner>
                </div>

                {getServerError(values.qcType) && (
                  <Warning
                    className={"mt-4"}
                    message={"Failed to record Visium QC"}
                    error={getServerError(values.qcType)}
                  />
                )}
                <div className={"sm:flex mt-4 sm:flex-row justify-end"}>
                  <BlueButton disabled={!isEnableSubmit(values)} type="submit">
                    Save
                  </BlueButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <OperationCompleteModal
          show={
            currentSlideProcessing.matches("submitted") ||
            currentCDNA.matches("submitted")
          }
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
