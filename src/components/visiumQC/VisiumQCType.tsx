import SlideProcessing from "./SlideProcessing";
import React from "react";
import { QCType, VisiumQCData } from "../../pages/VisiumQC";
import { CommentFieldsFragment } from "../../types/sdk";
import { ClientError } from "graphql-request";
import CDNAAmplification from "./CDNAAmplification";
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

const VisiumQCType = ({ qcTypeProps }: { qcTypeProps: VisiumQCTypeProps }) => {
  const { values } = useFormikContext<VisiumQCData>();
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
    case QCType.CDNA_AMPLIFIFACTION: {
      return (
        <CDNAAmplification
          onSave={qcTypeProps.onSave}
          onError={qcTypeProps.onError}
        />
      );
    }
  }
  return <></>;
};

export default VisiumQCType;
