import SlideProcessing from "./SlideProcessing";
import React from "react";
import { QCType, VisiumQCData } from "../../pages/VisiumQC";
import { CommentFieldsFragment } from "../../types/sdk";
import { ClientError } from "graphql-request";
import CDNAMeasurementQC from "./CDNAMeasurementQC";
import { useFormikContext } from "formik";

export type VisiumQCTypeProps = {
  /***
   * Comments
   */
  comments?: CommentFieldsFragment[];

  /**
   * Callback to indicate the success of saving result.
   */
  onSave: () => void;
  /**
   * Callback to indicate the failure/error in saving result.
   */
  onError: (error: ClientError) => void;
};

export const VisiumQCType = ({
  qcTypeProps,
}: {
  qcTypeProps: VisiumQCTypeProps;
}) => {
  const { values } = useFormikContext<VisiumQCData>();

  function validateMeasurementValue(value: string) {
    let error;
    if (!value) {
      error = "Required";
    } else {
      const val = /^\d{1,3}(\.\d{2})?$/.test(value);
      if (!val) {
        error = "Invalid number format (Required ###.##)";
      }
    }
    return error;
  }

  /**Customize component based on QCType**/
  switch (values.qcType) {
    case QCType.SLIDE_PROCESSING: {
      return (
        <SlideProcessing
          comments={qcTypeProps.comments}
          onSave={qcTypeProps.onSave}
          onError={qcTypeProps.onError}
        />
      );
    }
    case QCType.CDNA_AMPLIFICATION:
    case QCType.CDNA_ANALYSIS: {
      return (
        <>
          <CDNAMeasurementQC
            onSave={qcTypeProps.onSave}
            onError={qcTypeProps.onError}
            measurementName={
              values.qcType === QCType.CDNA_AMPLIFICATION
                ? "Cq value"
                : "Concentration"
            }
            qcType={values.qcType}
            initialMeasurementVal={
              values.qcType === QCType.CDNA_AMPLIFICATION ? "" : "0"
            }
            applySameValueForAlMeasurements={
              values.qcType === QCType.CDNA_AMPLIFICATION
            }
            validateMeasurementValue={
              values.qcType === QCType.CDNA_ANALYSIS
                ? validateMeasurementValue
                : undefined
            }
          />
        </>
      );
    }
  }
  return <></>;
};
